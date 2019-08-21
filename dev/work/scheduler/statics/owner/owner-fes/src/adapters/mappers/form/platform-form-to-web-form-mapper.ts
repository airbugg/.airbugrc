import { AddressFields, Form } from '@wix/ambassador-services-server';
import { DynamicFormData, IDynamicFormAttribute } from '../../../dto/form.dto';
const mapLinkLabel = ({ url, label: text }) => ({
  url,
  text,
});
function mapFieldDTOToField(field, fieldType): IDynamicFormAttribute {
  const formField: IDynamicFormAttribute = {
    fieldType,
    valueType: field.valueType,
    id: field.fieldId,
    label: field.label,
    link:
      field.additionalLabels && field.additionalLabels.length
        ? mapLinkLabel(field.additionalLabels[0].linkLabel)
        : null,
    userConstraints: {
      required: field.userConstraints.required,
    },
  };
  addAllowedActions(formField);
  return formField;
}

function mapAddressFieldDTOToAddressField(addressFields: AddressFields) {
  const addressField = {
    fieldType: 'Address',
    valueType: 'ADDRESS',

    id: '',
    label: 'Address',
    labelTranslationKey: 'booking-form.fields.address.label',
    subFields: [
      mapFieldDTOToField(addressFields.city, 'City'),
      mapFieldDTOToField(addressFields.street, 'Street'),
      mapFieldDTOToField(addressFields.floorNumber, 'AptFloorNo'),
    ],
    userConstraints: {
      required: true,
    },
  };
  addAllowedActions(addressField as any);
  return addressField;
}

function addAllowedActions(field: IDynamicFormAttribute): void {
  switch (field.fieldType) {
    case 'FullName':
    case 'Email':
    case 'NumberOfParticipants':
    case 'Street':
    case 'City':
    case 'Address':
      field.allowedActions = {
        remove: false,
        require: false,
        duplicate: false,
      };
      break;
    case 'PhoneNumber':
    case 'AptFloorNo':
      field.allowedActions = { remove: false, require: true, duplicate: false };
      break;
    default:
      field.allowedActions = { remove: true, require: true, duplicate: true };
  }
}

export function mapFormDTOToForm(formDTO: Form): DynamicFormData {
  return {
    form: {
      id: formDTO.id,
      header: {
        title: formDTO.header.title,
        description: formDTO.header.description,
        isDescriptionHidden: formDTO.header.isDescriptionHidden,
      },
      fields: [
        mapFieldDTOToField(formDTO.name, 'FullName'),
        mapFieldDTOToField(formDTO.email, 'Email'),
        mapFieldDTOToField(formDTO.phone, 'PhoneNumber'),
        mapFieldDTOToField(
          formDTO.numberOfParticipants,
          'NumberOfParticipants',
        ),
        ...insertIf(
          formDTO.address,
          mapAddressFieldDTOToAddressField(formDTO.address),
        ),
        ...executeIf(formDTO.customFields, () => {
          return formDTO.customFields.map(customField =>
            mapFieldDTOToField(customField, 'Custom'),
          );
        }),
      ],
      actions: {
        onlinePaymentLabel: formDTO.actionLabels.onlinePaymentLabel,
        offlinePaymentLabel: formDTO.actionLabels.offlinePaymentLabel,
      },
    },
  };
}

export function insertIf(condition, ...elements) {
  return condition ? elements : [];
}
export function executeIf(condition, func: Function): any {
  return condition ? func() : [];
}
