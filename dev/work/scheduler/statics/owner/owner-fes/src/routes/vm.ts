import * as fs from 'fs';
import * as path from 'path';
import * as Velocity from 'velocityjs';

export function setVMRoutes(app, config) {
  app.get('/owner/post-google-sync/', (req, res, next) => {
    try {
      const renderModel = getModelForGoogleSync(req, config);
      const pathToVM = path.join(
        config.appTopology.ownerLocalPath,
        'closewindow.vm',
      );
      // const vmTemplate = fs.readFileSync(pathToVM, 'utf8');
      // const htmlContent = Velocity.render(vmTemplate, renderModel);
      //res.send(htmlContent);
      fs.readFile(pathToVM, { encoding: 'utf8' }, (error, vmTemplate) => {
        console.log('error', error);
        const htmlContent = Velocity.render(vmTemplate, renderModel);
        res.send(htmlContent);
      });
    } catch (e) {
      console.log('e', e);
      next(e);
    }
  });

  function getModelForGoogleSync(httpRequest, appConfig): any {
    const locale = httpRequest.query.locale || 'en';
    const secured = true;
    const clientTopology = {
      schedulerOwnerSslStaticsUrl: `${appConfig.appTopology.staticsUrl}`,
      sslStaticBaseUrl: `//${appConfig.appTopology.staticsDomain}/`,
    };
    return {
      locale,
      secured,
      clientTopology,
    };
  }
}
