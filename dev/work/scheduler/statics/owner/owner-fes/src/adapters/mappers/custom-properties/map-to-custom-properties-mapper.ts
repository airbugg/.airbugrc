import { Property } from '@wix/ambassador-business-server';

export function mapMapToCustomProperties(map: Map<string, string>): Property[] {
  const properties: Property[] = [];
  map.forEach((value: string, key: string) => {
    properties.push({ propertyName: key, value });
  });

  return properties;
}
