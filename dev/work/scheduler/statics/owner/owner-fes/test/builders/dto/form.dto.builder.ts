import { Chance } from 'chance';
import {
  DynamicFormFieldType,
  DynamicFormValueType,
  IDynamicFormAttribute,
  DynamicFormData,
} from '../../../src/dto/form.dto';

const chance = Chance();

function aAddressField() {
  return {
    fieldType: 'Address',
    valueType: 'ADDRESS',
    userConstraints: {
      required: true,
    },
    subFields: [
      newField('City', 'SHORT_TEXT'),
      newField('Street', 'SHORT_TEXT'),
      newField('AptFloorNo', 'SHORT_TEXT'),
    ],
    label: 'Address',
    id: chance.guid(),
    labelTranslationKey: 'booking-form.fields.address.label',
  };
}

function newField(
  fieldType: DynamicFormFieldType,
  valueType: DynamicFormValueType,
): IDynamicFormAttribute {
  return {
    fieldType,
    valueType,
    label: chance.string(),
    isNew: chance.bool(),
    userConstraints: { required: chance.bool() },
    id: chance.guid(),
    allowedActions: {
      require: false,
      remove: false,
      duplicate: false,
    },
  };
}

export function validBookingsForm(): DynamicFormData {
  const fields = [];
  fields.push(
    newField('Email', 'SHORT_TEXT'),
    newField('FullName', 'SHORT_TEXT'),
    newField('PhoneNumber', 'SHORT_TEXT'),
    newField('NumberOfParticipants', 'SHORT_TEXT'),
    newField('Custom', 'LONG_TEXT'),
    aAddressField(),
  );
  return {
    form: {
      id: chance.guid(),
      header: {
        title: chance.string({ length: 20 }),
        description: chance.paragraph({ sentences: 1 }),
        isDescriptionHidden: chance.bool(),
      },
      fields,
      actions: {
        offlinePaymentLabel: chance.string({ length: 8 }),
        onlinePaymentLabel: chance.string({ length: 8 }),
      },
    },
  };
}
