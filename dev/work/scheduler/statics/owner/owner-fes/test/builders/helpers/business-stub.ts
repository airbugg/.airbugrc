import { BusinessServer } from '@wix/ambassador-business-server/rpc';
import {
  aGetInfoViewResponse,
  aProperty,
} from '@wix/ambassador-business-server/builders';
import { Chance } from 'chance';

const chance = new Chance();

export function stubUpdateBusinessProperties() {
  ambassadorServer
    .createStub(BusinessServer)
    .Business()
    .updateProperties.when(() => true)
    .resolve(null);
}

export function stubGetBusinessProperties() {
  const property = aProperty()
    .withPropertyName(chance.name())
    .withValue(chance.name())
    .build();
  ambassadorServer
    .createStub(BusinessServer)
    .Business()
    .getProperties.when(() => true)
    .resolve({
      customProperties: [property],
      errors: null,
    });
}
export function stubGetBusinessInfoView() {
  ambassadorServer
    .createStub(BusinessServer)
    .Business()
    .getInfo.when(() => true)
    .resolve(
      aGetInfoViewResponse()
        .withTimeZone('Etc/UTC')
        .build(),
    );
}
