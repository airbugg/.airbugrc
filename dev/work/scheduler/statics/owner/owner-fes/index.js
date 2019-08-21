const bootstrap = require("@wix/wix-bootstrap-ng");
const apiGatewayClientPlugin = require("@wix/wix-bootstrap-api-gw-client");
const app = bootstrap({ express: { timeout: 30000 }, rpc: { timeout: 30000 } })
  // https://github.com/wix-platform/wix-node-platform/tree/master/greynode/wix-bootstrap-greynode
  .use(require("@wix/wix-bootstrap-greynode"))
  // https://github.com/wix-platform/wix-node-platform/tree/master/bootstrap-plugins/hadron/wix-bootstrap-hadron
  .use(require("@wix/wix-bootstrap-hadron"))
  // https://github.com/wix-private/fed-infra/tree/master/wix-bootstrap-renderer
  .use(require("@wix/wix-bootstrap-renderer"))
  .use(require("@wix/wix-bootstrap-gatekeeper"))
  .use(apiGatewayClientPlugin)
  .use(require("@wix/ambassador/runtime"));

// Our code needs to be transpiled with Babel or TypeScript. In production or locally we
// use the already transpiled code from the /dist directory.
//
// In tests we use require hooks to transpile our code on the fly. For more information on
// require hooks, see https://github.com/TypeStrong/ts-node#how-it-works)
app.express("./dist/server");
app.start({
  disableCluster: process.env.NODE_ENV !== "production"
});
