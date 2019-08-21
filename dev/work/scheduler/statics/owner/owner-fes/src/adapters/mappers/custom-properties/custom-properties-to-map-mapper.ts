import { Property } from '@wix/ambassador-business-server';

export function mapCustomPropertiesToMap(properties: Property[]) {
  const map = new Map();
  if (properties) {
    properties.reduce((ccItems, businessProperties) => {
      ccItems.set(businessProperties.propertyName, businessProperties.value);
      return ccItems;
    }, map);
  }
  return map;
}
