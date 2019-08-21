const { AmbassadorTestkit } = require('@wix/ambassador-testkit');
const { bootstrapServer, emitConfigs, ambassadorServer, petriServer } = require('./environment');

process.env['WIX_BOOT_API_GW_IDENTITY_SERVICE_URL'] = 'http://app-jvm-13-115.42.wixprod.net:29594/rpc/services/execute';
process.env['WIX_BOOT_API_GW_VERTICALS_SERVICE_URL'] = 'http://app-jvm-109.42.wixprod.net:25684/meta-site-manager/rpc/services/execute';
process.env['WIX_BOOT_API_GW_RELOOSE_API_URL'] = 'http://app-jvm-9-13.96.wixprod.net:24774/rpc/services/execute';

process.env['PORT'] = 3000;
process.env['DEBUG'] = '*';

const port = parseInt(process.env.PORT, 10); // 3000
const appConfDir = './target/configs';

(async () => {
  // start bootstrap server
  const app = bootstrapServer({
    port,
    managementPort: port + 1,
    appConfDir,
  });

  // mock rpc (TODO)
  const ambassadorServer = new AmbassadorTestkit();

  // mock petri (with defaults)

  await emitConfigs({ targetFolder: appConfDir, ambassadorServer });

  // start rpc server
  await ambassadorServer.start();

  // start petri server
  // await petriServer.start();

  await app.start();
})();
