// https://github.com/wix-platform/wix-node-platform/tree/master/bootstrap/wix-bootstrap-testkit
const path = require("path");

const testkit = require("@wix/wix-bootstrap-testkit");
// https://github.com/wix-platform/wix-node-platform/tree/master/config/wix-config-emitter

module.exports = {
  emitConfigs: function({ targetFolder, ambassadorServer }) {
    let localPathToNotification = __dirname;
    localPathToNotification = localPathToNotification.replace("/test", "/src");
    const ownerLocalPath =
      path.resolve(__dirname, "../../../scheduler-owner-statics/app/") + "/";
    return ambassadorServer
      .configEmitter({
        sourceFolders: ["./templates"],
        targetFolder
      })
      .fn(
        "static_url",
        "com.wixpress.boost.scheduler-owner-statics",
        "https://localhost:3200/"
      )
      .fn(
        "rpc_service_url",
        "com.wixpress.authorization.gatekeeper.gatekeeper-server",
        "https://localhost:3401/"
      )
      .fn(
        "local_files_path",
        "com.wixpress.bookings-adapter-mail-templates",
        localPathToNotification
      )
      .fn(
        "local_files_path",
        "com.wixpress.boost.scheduler-owner-statics",
        ownerLocalPath
      )
      .fn(
        "databag_passwd",
        "com.wixpress.bookings.owner-fes",
        "bookings_app_secret",
        "narf"
      )
      .fn("scripts_domain", "static.parastorage.com")
      .emit();
  },
  bootstrapServer: function({ port, managementPort, appConfDir, petriPort }) {
    return testkit.app("./index", {
      env: {
        PORT: port,
        MANAGEMENT_PORT: managementPort,
        NEW_RELIC_LOG_LEVEL: "warn",
        DEBUG: "",
        APP_CONF_DIR: appConfDir,
        WIX_BOOT_LABORATORY_URL: `http://localhost:${petriPort}`,
        APP_LOG_DIR: `./target/logs_${process.pid}`,
        APP_PERSISTENT_DIR: `./target/persistent_${process.pid}`
      }
    });
  }
};
//export function emitConfigs

// start the server as an embedded app
// export function bootstrapServer({
//   port,
//   managementPort,
//   appConfDir,
//   petriPort,
// }) {
//   return testkit.app('./index', {
//     env: {
//       PORT: port,
//       MANAGEMENT_PORT: managementPort,
//       NEW_RELIC_LOG_LEVEL: 'warn',
//       DEBUG: '',
//       APP_CONF_DIR: appConfDir,
//       WIX_BOOT_LABORATORY_URL: `http://localhost:${petriPort}`,
//       APP_LOG_DIR: `./target/logs_${process.pid}`,
//       APP_PERSISTENT_DIR: `./target/persistent_${process.pid}`,
//     },
//   });
// }
