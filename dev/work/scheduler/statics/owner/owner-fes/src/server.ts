import { Router } from 'express';
import { hot } from 'bootstrap-hot-loader';
import * as wixExpressCsrf from '@wix/wix-express-csrf';
import * as wixExpressRequireHttps from '@wix/wix-express-require-https';
import { setServerRoutes, wrapAsync } from './routes';
import * as bodyParser from 'body-parser';
import { getConfigedI18n } from './translator';
import { WixMetaSiteManagerWebapp } from '@wix/ambassador-wix-meta-site-manager-webapp';
import { ignoreMigrationRoutes } from './routes/migration';
// This function is the main entry for our server. It accepts an express Router
// (see http://expressjs.com) and attaches routes and middlewares to it.
//
// `context` is an object with built-in services from `wix-bootstrap-ng`. See
// https://github.com/wix-platform/wix-node-platform/tree/master/bootstrap/wix-bootstrap-ng).
export default hot(
  module,
  (app: Router, { renderer, config, petri, apiGwClient, rpc, gatekeeper }) => {
    // We load the already parsed ERB configuration (located at /templates folder).
    const fesConfig = config.load('owner-fes');
    fesConfig.i18n = getConfigedI18n(fesConfig.notification.localPath);

    // Attach CSRF protection middleware. See
    // https://github.com/wix-platform/wix-node-platform/tree/master/express/wix-express-csrf.
    app.use(ignoreMigrationRoutes(wixExpressCsrf()));

    // Require HTTPS by redirecting to HTTPS from HTTP. Only active in a production environment.
    // See https://github.com/wix-platform/wix-node-platform/tree/master/express/wix-express-require-https.
    app.use(ignoreMigrationRoutes(wixExpressRequireHttps));

    // Attach a rendering middleware, it adds the `renderView` method to every request.
    // See https://github.com/wix-private/fed-infra/tree/master/wix-bootstrap-renderer.
    app.use(renderer.middleware());

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ extended: true }));

    // Define a route to render our initial HTML.
    app.get('/', (req, res) => {
      // Extract some data from every incoming request.
      const renderModel = getRenderModel(req);

      // Send a response back to the client.
      res.renderView('./index.ejs', renderModel);
    });
    setServerRoutes(app, fesConfig, petri, gatekeeper, apiGwClient);
    app.get(
      '/meta',
      wrapAsync(async (req, res, next) => {
        const resRPC = await WixMetaSiteManagerWebapp()
          .ReadOnlyMetaSiteManager()(req.aspects)
          .getMetaSite('08996e26-e2b4-4e20-8858-b2049ac05417');
        console.log(resRPC);
      }),
    );

    function getRenderModel(req) {
      const { language, basename, debug } = req.aspects['web-context'];

      return {
        language,
        basename,
        debug: debug || process.env.NODE_ENV === 'development',
        title: 'Wix Full Stack Project Boilerplate',
        staticsDomain: fesConfig.clientTopology.staticsDomain,
      };
    }

    return app;
  },
);
