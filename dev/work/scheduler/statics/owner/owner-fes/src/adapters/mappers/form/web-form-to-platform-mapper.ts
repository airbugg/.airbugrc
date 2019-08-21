import { DynamicFormData, IDynamicFormAttribute } from '../../../dto/form.dto';
import {
  AddressFields,
  Form,
  FormField,
} from '@wix/ambassador-services-server';

function mapField(field: IDynamicFormAttribute): FormField {
  return {
    valueType: field.valueType === 'LONG_TEXT' ? 'LONG_TEXT' : 'SHORT_TEXT',
    userConstraints: { required: field.userConstraints.required },
    label: field.label,
    fieldId: field.id,
    additionalLabels: field.link
      ? [
          {
            linkLabel: {
              url: field.link.url,
              label: field.link.text,
            },
          },
        ]
      : null,
  };
}

function mapAddressField(addressField: IDynamicFormAttribute): AddressFields {
  const cityField = fieldWithType(addressField.subFields, 'City');
  const streetField = fieldWithType(addressField.subFields, 'Street');
  const aptFloorNoField = fieldWithType(addressField.subFields, 'AptFloorNo');
  return {
    floorNumber: mapField(aptFloorNoField),
    city: mapField(cityField),
    street: mapField(streetField),
  };
}

function mapCustomFild(fields: IDynamicFormAttribute[]) {
  const customFiles = filterWithType(fields, 'Custom');
  return customFiles.map(mapField);
}

export function mapWebFromToPlatformForm(webFrom: DynamicFormData): Form {
  const emailField = fieldWithType(webFrom.form.fields, 'Email');
  const fullNameField = fieldWithType(webFrom.form.fields, 'FullName');
  const phoneField = fieldWithType(webFrom.form.fields, 'PhoneNumber');
  const addressField = fieldWithType(webFrom.form.fields, 'Address');
  const numParticipantField = fieldWithType(
    webFrom.form.fields,
    'NumberOfParticipants',
  );
  const platformFrom: Form = {
    id: webFrom.form.id,
    header: {
      isDescriptionHidden: webFrom.form.header.isDescriptionHidden,
      description: webFrom.form.header.description,
      title: webFrom.form.header.title,
    },
    email: mapField(emailField),
    name: mapField(fullNameField),
    phone: mapField(phoneField),
    address: mapAddressField(addressField),
    customFields: mapCustomFild(webFrom.form.fields),
    numberOfParticipants: mapField(numParticipantField),
    actionLabels: {
      onlinePaymentLabel: webFrom.form.actions.onlinePaymentLabel,
      offlinePaymentLabel: webFrom.form.actions.offlinePaymentLabel,
    },
  };

  return platformFrom;
}

const filterWithType = (fields, type): IDynamicFormAttribute[] =>
  fields.filter(field => field.fieldType === type);

const fieldWithType = (fields, type): IDynamicFormAttribute =>
  fields.find(field => field.fieldType === type);
