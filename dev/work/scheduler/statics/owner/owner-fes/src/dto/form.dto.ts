export type DynamicFormValueType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'DATE'
  | 'NUMBER'
  | 'ADDRESS'
  | 'PHONE_NUMBER'
  | 'EMAIL'
  | 'DROP_DOWN'
  | 'CHECKBOX'
  | 'RADIO_BUTTON';

export type DynamicFormFieldType =
  | 'FullName'
  | 'Email'
  | 'PhoneNumber'
  | 'Message'
  | 'Address'
  | 'Street'
  | 'AptFloorNo'
  | 'City'
  | 'State'
  | 'ZipCode'
  | 'Custom'
  | 'NumberOfParticipants';

export class DynamicFormValueTypes {
  static SHORT_TEXT: DynamicFormValueType = 'SHORT_TEXT';
  static LONG_TEXT: DynamicFormValueType = 'LONG_TEXT';
  static EMAIL: DynamicFormValueType = 'EMAIL';
  static PHONE: DynamicFormValueType = 'PHONE_NUMBER';
  static DROP_DOWN: DynamicFormValueType = 'DROP_DOWN';
  static NUMBER: DynamicFormValueType = 'NUMBER';
  static ADDRESS: DynamicFormValueType = 'ADDRESS';
}

export class DynamicFormFieldTypes {
  static FULL_NAME: DynamicFormFieldType = 'FullName';
  static EMAIL: DynamicFormFieldType = 'Email';
  static CUSTOM_FIELD: DynamicFormFieldType = 'Custom';
  static PHONE: DynamicFormFieldType = 'PhoneNumber';
  static MESSAGE: DynamicFormFieldType = 'Message';
  static ADDRESS: DynamicFormFieldType = 'Address';
  static CITY: DynamicFormFieldType = 'City';
  static STREET: DynamicFormFieldType = 'Street';
  static STATE: DynamicFormFieldType = 'State';
  static ZIP: DynamicFormFieldType = 'ZipCode';
  static APARTMENT: DynamicFormFieldType = 'AptFloorNo';
  static NUM_OF_PARTICIPANTS: DynamicFormFieldType = 'NumberOfParticipants';
  static isAddressProperty = prop =>
    ['Street', 'AptFloorNo', 'City', 'State', 'ZipCode'].indexOf(prop) > -1;
}

export interface DynamicFormData {
  defaultAddress?: IDynamicFormAttribute;
  form: {
    id: string;
    header: {
      title: string;
      description: string;
      isDescriptionHidden: boolean;
    };
    fields: IDynamicFormAttribute[];
    actions: {
      onlinePaymentLabel: string;
      offlinePaymentLabel: string;
    };
  };
}

interface LinkLabel {
  url: string;
  text: string;
}

export interface IDynamicFormAttribute {
  id?: string;
  clientId?: string;
  isNew?: boolean;
  label?: string;
  link?: LinkLabel;
  userConstraints?: {
    required?: boolean;
    max?: number;
  };
  valueType?: DynamicFormValueType;
  fieldType?: DynamicFormFieldType;
  allowedActions?: {
    remove: boolean;
    require: boolean;
    duplicate: boolean;
  };
  validValues?: { id: string; label: string }[];
  subFields?: IDynamicFormAttribute[];
  value?: any;
}

export class DynamicFormAttribute implements IDynamicFormAttribute {
  subFields: DynamicFormAttribute[];
  constructor(data: IDynamicFormAttribute = {}) {
    const defaultData: IDynamicFormAttribute = {
      fieldType: DynamicFormFieldTypes.CUSTOM_FIELD,
      valueType: DynamicFormValueTypes.SHORT_TEXT,
      userConstraints: { required: false },
      allowedActions: { remove: true, require: true, duplicate: true },
      subFields: null,
      label: '',
      isNew: false,
    } as IDynamicFormAttribute;
    Object.assign(this, defaultData, data);
  }
}

export interface VisitorFieldedAddress {
  city: string;
  addressLine: string;
  aptOrFloor: string;
}
export class ButtonTypes {
  static OFFLINE: ButtonType = 'offlinePaymentLabel';
  static ONLINE: ButtonType = 'onlinePaymentLabel';
}
export type ButtonType = 'offlinePaymentLabel' | 'onlinePaymentLabel';
export class SectionTypes {
  static DYNAMIC_FIELD = 'dynamic-field';
  static DYNAMIC_QUESTION_FIELD = 'dynamic-question-field';
  static TITLE = 'form-title';
  static BUTTON_ONLINE = ButtonTypes.ONLINE;
  static BUTTON_OFFLINE = ButtonTypes.OFFLINE;
}
