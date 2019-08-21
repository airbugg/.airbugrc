const {
  emitConfigs,
  bootstrapServer,
  ambassadorServer
} = require("./environment");
const { AmbassadorTestkit } = require("@wix/ambassador-testkit");
const petriTestkit = require("@wix/wix-petri-testkit");
const gatekeeperTestkit = require("@wix/wix-gatekeeper-testkit");

// The purpose of this file is to start your server and possibly additional servers
// like RPC/Petri servers.
//
// Because tests are running in parallel, it should start a different server on a different port
// for every test file (E2E and server tests).
//
// By attaching the server object (testkit result) on `globalObject` it will be available to every
// test file globally by that name.
module.exports = {
  bootstrap: {
    setup: async ({ globalObject, getPort, appConfDir }) => {
      const ambassadorServer = new AmbassadorTestkit({ port: getPort() });

      await emitConfigs({ targetFolder: appConfDir, ambassadorServer });

      const petriPort = getPort();
      globalObject.petriServer = petriTestkit.server({ port: petriPort });
      globalObject.ambassadorServer = ambassadorServer;
      globalObject.app = bootstrapServer({
        port: getPort(),
        managementPort: getPort(),
        appConfDir,
        petriPort
      });
      await globalObject.petriServer.start();
      await globalObject.ambassadorServer.start();
      await globalObject.app.start();
    },
    teardown: async ({ globalObject }) => {
      await globalObject.app.stop();
      await globalObject.ambassadorServer.stop();
      await globalObject.petriServer.stop();
    }
  }
};
