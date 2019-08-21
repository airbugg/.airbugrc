import { BootstrapServer } from '@wix/wix-bootstrap-testkit';
import { AmbassadorTestkit } from '@wix/ambassador-testkit';

declare global {
  const app: BootstrapServer;
  const petriServer: any;
  const ambassadorServer: AmbassadorTestkit;
  const gatekeeperTestkit: any;
  const apiGwTestkit: any;
}

export {};
