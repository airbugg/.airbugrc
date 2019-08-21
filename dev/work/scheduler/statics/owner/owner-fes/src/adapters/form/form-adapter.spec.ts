import { getBookingForm, updateBookingForm } from './form-adapter';
import {
  aSimpleFormField,
  buildASimpleFormResponse,
} from '../../../test/builders/rpc-custom/form-builder';
import { IDynamicFormAttribute } from '../../dto/form.dto';
import { Form } from '@wix/ambassador-services-server';
import { aForm } from '@wix/ambassador-services-server/builders';
import { validBookingsForm } from '../../../test/builders/dto/form.dto.builder';

describe('Get bookings From - adapter', () => {
  it('should return simple fields Email,FullName,PhoneNumber', async () => {
    const bookingRPCForm = buildASimpleFormResponse();
    const getterOfBookingForm = async () => {
      return bookingRPCForm;
    };
    const bookingsForm = await getBookingForm(getterOfBookingForm);

    expect(
      fieldWithType(bookingsForm.form.fields, 'Email'),
    ).toBeDerivativeFromFormFieldDTO(bookingRPCForm.form.email);
    expect(
      fieldWithType(bookingsForm.form.fields, 'FullName'),
    ).toBeDerivativeFromFormFieldDTO(bookingRPCForm.form.name);
    expect(
      fieldWithType(bookingsForm.form.fields, 'PhoneNumber'),
    ).toBeDerivativeFromFormFieldDTO(bookingRPCForm.form.phone);
    expect(
      fieldWithType(bookingsForm.form.fields, 'NumberOfParticipants'),
    ).toBeDerivativeFromFormFieldDTO(bookingRPCForm.form.numberOfParticipants);
  });

  it('should return allowedActions for mandatory fields (Email,FullName,Address)', async () => {
    const bookingRPCForm = buildASimpleFormResponse();
    const getterOfBookingForm = async () => {
      return bookingRPCForm;
    };
    const bookingsForm = await getBookingForm(getterOfBookingForm);
    const expectedAllowAction = {
      remove: false,
      require: false,
      duplicate: false,
    };
    const address: IDynamicFormAttribute = fieldWithType(
      bookingsForm.form.fields,
      'Address',
    );
    expect(
      fieldWithType(bookingsForm.form.fields, 'Email').allowedActions,
    ).toEqual(expectedAllowAction);
    expect(
      fieldWithType(bookingsForm.form.fields, 'FullName').allowedActions,
    ).toEqual(expectedAllowAction);
    expect(
      fieldWithType(bookingsForm.form.fields, 'Address').allowedActions,
    ).toEqual(expectedAllowAction);
    expect(
      fieldWithType(bookingsForm.form.fields, 'NumberOfParticipants')
        .allowedActions,
    ).toEqual(expectedAllowAction);
    expect(fieldWithType(address.subFields, 'Street').allowedActions).toEqual(
      expectedAllowAction,
    );
    expect(fieldWithType(address.subFields, 'City').allowedActions).toEqual(
      expectedAllowAction,
    );
  });

  it('should return allowedActions for non mandatory fields (PhoneNumber, AptFloorNo)', async () => {
    const bookingRPCForm = buildASimpleFormResponse();
    const getterOfBookingForm = async () => {
      return bookingRPCForm;
    };
    const bookingsForm = await getBookingForm(getterOfBookingForm);
    const expectedAllowAction = {
      remove: false,
      require: true,
      duplicate: false,
    };
    const address: IDynamicFormAttribute = fieldWithType(
      bookingsForm.form.fields,
      'Address',
    );
    expect(
      fieldWithType(bookingsForm.form.fields, 'PhoneNumber').allowedActions,
    ).toEqual(expectedAllowAction);
    expect(
      fieldWithType(address.subFields, 'AptFloorNo').allowedActions,
    ).toEqual(expectedAllowAction);
  });

  it('should return the nested address field', async () => {
    const bookingRPCForm = buildASimpleFormResponse();
    const getterOfBookingForm = async () => {
      return bookingRPCForm;
    };
    const bookingsForm = await getBookingForm(getterOfBookingForm);
    const address: IDynamicFormAttribute = fieldWithType(
      bookingsForm.form.fields,
      'Address',
    );
    expect(
      fieldWithType(address.subFields, 'City'),
    ).toBeDerivativeFromFormFieldDTO(bookingRPCForm.form.address.city);
    expect(
      fieldWithType(address.subFields, 'Street'),
    ).toBeDerivativeFromFormFieldDTO(bookingRPCForm.form.address.street);
    expect(
      fieldWithType(address.subFields, 'AptFloorNo'),
    ).toBeDerivativeFromFormFieldDTO(bookingRPCForm.form.address.floorNumber);
  });

  it('should return the action labels ', async () => {
    const bookingRPCForm = buildASimpleFormResponse();
    const getterOfBookingForm = async () => {
      return bookingRPCForm;
    };
    const bookingsForm = await getBookingForm(getterOfBookingForm);
    const bookingsFormAction = bookingsForm.form.actions;
    const bookingsFormRPCAction = bookingRPCForm.form.actionLabels;

    expect(bookingsFormAction.offlinePaymentLabel).toBe(
      bookingsFormRPCAction.offlinePaymentLabel,
    );
    expect(bookingsFormAction.onlinePaymentLabel).toBe(
      bookingsFormRPCAction.onlinePaymentLabel,
    );
  });

  it('should return the action labels ', async () => {
    const bookingRPCForm = buildASimpleFormResponse();
    const getterOfBookingForm = async () => {
      return bookingRPCForm;
    };
    const bookingsForm = await getBookingForm(getterOfBookingForm);
    const bookingsFormAction = bookingsForm.form.actions;
    const bookingsFormRPCAction = bookingRPCForm.form.actionLabels;

    expect(bookingsFormAction.offlinePaymentLabel).toBe(
      bookingsFormRPCAction.offlinePaymentLabel,
    );
    expect(bookingsFormAction.onlinePaymentLabel).toBe(
      bookingsFormRPCAction.onlinePaymentLabel,
    );
  });

  it('should return the headers labels ', async () => {
    const bookingRPCForm = buildASimpleFormResponse();
    const getterOfBookingForm = async () => {
      return bookingRPCForm;
    };
    const bookingsForm = await getBookingForm(getterOfBookingForm);
    const bookingsFormAction = bookingsForm.form.header;
    const bookingsFormRPCAction = bookingRPCForm.form.header;

    expect(bookingsFormAction.description).toBe(
      bookingsFormRPCAction.description,
    );
    expect(bookingsFormAction.title).toBe(bookingsFormRPCAction.title);
    expect(bookingsFormAction.isDescriptionHidden).toBe(
      bookingsFormRPCAction.isDescriptionHidden,
    );
  });

  it('should return a custom field', async () => {
    const bookingRPCForm = buildASimpleFormResponse();
    const customField = aSimpleFormField().build();
    bookingRPCForm.form.customFields = [customField];
    const getterOfBookingForm = async () => {
      return bookingRPCForm;
    };
    const bookingsForm = await getBookingForm(getterOfBookingForm);
    const custom = fieldWithType(bookingsForm.form.fields, 'Custom');
    expect(custom).toBeDerivativeFromFormFieldDTO(
      bookingRPCForm.form.customFields[0],
    );
    expect(custom.allowedActions.remove).toBe(true);
    expect(custom.allowedActions.duplicate).toBe(true);
    expect(custom.allowedActions.require).toBe(true);
  });

  it('should not return a custom field', async () => {
    const bookingRPCForm = buildASimpleFormResponse();
    delete bookingRPCForm.form.customFields;
    const getterOfBookingForm = async () => {
      return bookingRPCForm;
    };
    const bookingsForm = await getBookingForm(getterOfBookingForm);
    expect(fieldWithType(bookingsForm.form.fields, 'Custom')).not.toBeDefined();
  });
});

describe('Update bookings From - adapter', () => {
  it('should return simple fields Email,FullName,PhoneNumber', async () => {
    const bookingWebForm = validBookingsForm();
    let formToSave: Form;
    const updaterOfBookingForm = async (form: Form) => {
      formToSave = form;
      return {
        form: aForm().build(),
      };
    };
    const bookingsFormId = await updateBookingForm(
      bookingWebForm,
      updaterOfBookingForm,
    );

    expect(formToSave.id).toBe(bookingWebForm.form.id);
    expect(formToSave.phone).toBeDerivativeFromFormFieldDTO(
      fieldWithType(bookingWebForm.form.fields, 'PhoneNumber'),
    );
    expect(formToSave.email).toBeDerivativeFromFormFieldDTO(
      fieldWithType(bookingWebForm.form.fields, 'Email'),
    );
    expect(formToSave.name).toBeDerivativeFromFormFieldDTO(
      fieldWithType(bookingWebForm.form.fields, 'FullName'),
    );
    expect(formToSave.numberOfParticipants).toBeDerivativeFromFormFieldDTO(
      fieldWithType(bookingWebForm.form.fields, 'NumberOfParticipants'),
    );
    expect(formToSave.customFields[0]).toBeDerivativeFromFormFieldDTO(
      fieldWithType(bookingWebForm.form.fields, 'Custom'),
    );
  });
});

// it('should return allowedActions for mandatory fields (Email,FullName,Address)', async () => {
//   const bookingRPCForm = buildASimpleFormResponse();
//   const getterOfBookingForm = async () => {
//     return bookingRPCForm;
//   };
//   const bookingsForm = await getBookingForm(getterOfBookingForm);
//   const expectedAllowAction = {
//     remove: false,
//     require: false,
//     duplicate: false,
//   };
//   const address: IDynamicFormAttribute = fieldWithType(
//     bookingsForm.form.fields,
//     'Address',
//   );
//   expect(
//     fieldWithType(bookingsForm.form.fields, 'Email').allowedActions,
//   ).toEqual(expectedAllowAction);
//   expect(
//     fieldWithType(bookingsForm.form.fields, 'FullName').allowedActions,
//   ).toEqual(expectedAllowAction);
//   expect(
//     fieldWithType(bookingsForm.form.fields, 'Address').allowedActions,
//   ).toEqual(expectedAllowAction);
//   expect(
//     fieldWithType(bookingsForm.form.fields, 'NumberOfParticipants')
//       .allowedActions,
//   ).toEqual(expectedAllowAction);
//   expect(fieldWithType(address.subFields, 'Street').allowedActions).toEqual(
//     expectedAllowAction,
//   );
//   expect(fieldWithType(address.subFields, 'City').allowedActions).toEqual(
//     expectedAllowAction,
//   );
// });
//
// it('should return allowedActions for non mandatory fields (PhoneNumber, AptFloorNo)', async () => {
//   const bookingRPCForm = buildASimpleFormResponse();
//   const getterOfBookingForm = async () => {
//     return bookingRPCForm;
//   };
//   const bookingsForm = await getBookingForm(getterOfBookingForm);
//   const expectedAllowAction = {
//     remove: false,
//     require: true,
//     duplicate: false,
//   };
//   const address: IDynamicFormAttribute = fieldWithType(
//     bookingsForm.form.fields,
//     'Address',
//   );
//   expect(
//     fieldWithType(bookingsForm.form.fields, 'PhoneNumber').allowedActions,
//   ).toEqual(expectedAllowAction);
//   expect(
//     fieldWithType(address.subFields, 'AptFloorNo').allowedActions,
//   ).toEqual(expectedAllowAction);
// });
//
// it('should return the nested address field', async () => {
//   const bookingRPCForm = buildASimpleFormResponse();
//   const getterOfBookingForm = async () => {
//     return bookingRPCForm;
//   };
//   const bookingsForm = await getBookingForm(getterOfBookingForm);
//   const address: IDynamicFormAttribute = fieldWithType(
//     bookingsForm.form.fields,
//     'Address',
//   );
//   expect(
//     fieldWithType(address.subFields, 'City'),
//   ).toBeDerivativeFromFormFieldDTO(bookingRPCForm.form.address.city);
//   expect(
//     fieldWithType(address.subFields, 'Street'),
//   ).toBeDerivativeFromFormFieldDTO(bookingRPCForm.form.address.street);
//   expect(
//     fieldWithType(address.subFields, 'AptFloorNo'),
//   ).toBeDerivativeFromFormFieldDTO(bookingRPCForm.form.address.floorNumber);
// });
//
// it('should return the action labels ', async () => {
//   const bookingRPCForm = buildASimpleFormResponse();
//   const getterOfBookingForm = async () => {
//     return bookingRPCForm;
//   };
//   const bookingsForm = await getBookingForm(getterOfBookingForm);
//   const bookingsFormAction = bookingsForm.form.actions;
//   const bookingsFormRPCAction = bookingRPCForm.form.actionLabels;
//
//   expect(bookingsFormAction.offlinePaymentLabel).toBe(
//     bookingsFormRPCAction.offlinePaymentLabel,
//   );
//   expect(bookingsFormAction.onlinePaymentLabel).toBe(
//     bookingsFormRPCAction.onlinePaymentLabel,
//   );
// });
//
// it('should return the action labels ', async () => {
//   const bookingRPCForm = buildASimpleFormResponse();
//   const getterOfBookingForm = async () => {
//     return bookingRPCForm;
//   };
//   const bookingsForm = await getBookingForm(getterOfBookingForm);
//   const bookingsFormAction = bookingsForm.form.actions;
//   const bookingsFormRPCAction = bookingRPCForm.form.actionLabels;
//
//   expect(bookingsFormAction.offlinePaymentLabel).toBe(
//     bookingsFormRPCAction.offlinePaymentLabel,
//   );
//   expect(bookingsFormAction.onlinePaymentLabel).toBe(
//     bookingsFormRPCAction.onlinePaymentLabel,
//   );
// });
//
// it('should return the headers labels ', async () => {
//   const bookingRPCForm = buildASimpleFormResponse();
//   const getterOfBookingForm = async () => {
//     return bookingRPCForm;
//   };
//   const bookingsForm = await getBookingForm(getterOfBookingForm);
//   const bookingsFormAction = bookingsForm.form.header;
//   const bookingsFormRPCAction = bookingRPCForm.form.header;
//
//   expect(bookingsFormAction.description).toBe(
//     bookingsFormRPCAction.description,
//   );
//   expect(bookingsFormAction.title).toBe(bookingsFormRPCAction.title);
//   expect(bookingsFormAction.isDescriptionHidden).toBe(
//     bookingsFormRPCAction.isDescriptionHidden,
//   );
// });
//
// it('should return a custom field', async () => {
//   const bookingRPCForm = buildASimpleFormResponse();
//   const customField = aSimpleFormField();
//   bookingRPCForm.form.customFields = [customField];
//   const getterOfBookingForm = async () => {
//     return bookingRPCForm;
//   };
//   const bookingsForm = await getBookingForm(getterOfBookingForm);
//   expect(
//     fieldWithType(bookingsForm.form.fields, 'Custom'),
//   ).toBeDerivativeFromFormFieldDTO(bookingRPCForm.form.customFields[0]);
// });
//
// it('should not return a custom field', async () => {
//   const bookingRPCForm = buildASimpleFormResponse();
//   const getterOfBookingForm = async () => {
//     return bookingRPCForm;
//   };
//   const bookingsForm = await getBookingForm(getterOfBookingForm);
//   expect(fieldWithType(bookingsForm.form.fields, 'Custom')).not.toBeDefined();
// });
//});

const fieldWithType = (fields, type) =>
  fields.find(field => field.fieldType === type);
/*
{
  "form": {
    "id": "eee81d81-b2b8-4899-a512-c8db933bec34",
    "header": {
      "title": "Tilføj info",
      "description": "Fortal lidt om dig selv",
      "isDescriptionHidden": false
    },
    "fields": [
      {
        "fieldType": "FullName",
        "valueType": "SHORT_TEXT",
        "id": "ffcb71fc-4f28-469a-bb1c-b6beb6d72f42",
        "label": "Navn",
        "labelTranslationKey": "booking-form.fields.full-name.label",
        "allowedActions": {
          "remove": false,
          "require": false,
          "duplicate": false
        },
        "userConstraints": {
          "required": true
        }
      },
      {
        "fieldType": "Email",
        "valueType": "EMAIL",
        "id": "f694a03a-47b6-4f66-913a-7b144bced6c9",
        "label": "E-mail",
        "labelTranslationKey": "booking-form.fields.email.label",
        "allowedActions": {
          "remove": false,
          "require": false,
          "duplicate": false
        },
        "userConstraints": {
          "required": true
        }
      },
      {
        "fieldType": "PhoneNumber",
        "valueType": "PHONE_NUMBER",
        "id": "4c4d3831-0d85-4ae2-94d7-5043ca2ecefc",
        "label": "Telefonnummer",
        "labelTranslationKey": "booking-form.fields.phone-number.label",
        "allowedActions": {
          "remove": false,
          "require": true,
          "duplicate": false
        }
      },
      {
        "fieldType": "Address",
        "valueType": "ADDRESS",
        "id": "b604b333-e193-4120-9c6c-3163f8fc47fb",
        "label": "Adresse",
        "labelTranslationKey": "booking-form.fields.address.label",
        "allowedActions": {
          "remove": false,
          "require": false,
          "duplicate": false
        },
        "subFields": [
          {
            "fieldType": "Street",
            "valueType": "SHORT_TEXT",
            "id": "a3f5254c-821e-4ee1-94b5-175510672e99",
            "label": "Gade",
            "labelTranslationKey": "booking-form.fields.street.label",
            "allowedActions": {
              "remove": true,
              "require": false,
              "duplicate": false
            },
            "userConstraints": {
              "required": true
            }
          },
          {
            "fieldType": "AptFloorNo",
            "valueType": "SHORT_TEXT",
            "id": "a68b9d3c-f80f-4362-99d3-052ab79bdde0",
            "label": "Lejl. / etage",
            "labelTranslationKey": "booking-form.fields.apt-floor.label",
            "allowedActions": {
              "remove": false,
              "require": true,
              "duplicate": false
            }
          },
          {
            "fieldType": "City",
            "valueType": "SHORT_TEXT",
            "id": "248b1071-ea29-4e2b-87ef-2c5580a1da3f",
            "label": "By",
            "labelTranslationKey": "booking-form.fields.city.label",
            "allowedActions": {
              "remove": true,
              "require": false,
              "duplicate": false
            },
            "userConstraints": {
              "required": true
            }
          }
        ],
        "userConstraints": {
          "required": true
        }
      },
      {
        "fieldType": "NumberOfParticipants",
        "valueType": "SHORT_TEXT",
        "id": "6216da12-2f3c-4ba0-8fb0-7ce2dfd2389f",
        "label": "Antal af deltagere",
        "labelTranslationKey": "booking-form.fields.number-of-participants.label",
        "allowedActions": {
          "remove": false,
          "require": false,
          "duplicate": false
        },
        "userConstraints": {
          "required": true
        }
      },
      {
        "fieldType": "Custom",
        "valueType": "LONG_TEXT",
        "id": "c4fde605-2649-48be-81e8-73f3acea0e5e",
        "label": "Tilføj din besked",
        "labelTranslationKey": "booking-form.fields.message.label",
        "allowedActions": {
          "remove": true,
          "require": true,
          "duplicate": true
        }
      }
    ],
    "actions": {
      "onlinePaymentLabel": "Betal nu",
      "offlinePaymentLabel": "OK",
      "actionLabel": "",
      "shouldPay": false
    }
  },
  "source": "OwnerCustomized",
  "defaultAddress": {
    "fieldType": "Address",
    "valueType": "ADDRESS",
    "id": "6d16d64f-47e3-4893-8f46-da6128e6171f",
    "label": "Address",
    "labelTranslationKey": "booking-form.fields.address.label",
    "allowedActions": {
      "remove": false,
      "require": false,
      "duplicate": false
    },
    "subFields": [
      {
        "fieldType": "Street",
        "valueType": "SHORT_TEXT",
        "id": "404a5893-2439-4f53-aa9a-626dc3387381",
        "label": "Street",
        "labelTranslationKey": "booking-form.fields.street.label",
        "allowedActions": {
          "remove": true,
          "require": false,
          "duplicate": false
        },
        "userConstraints": {
          "required": true
        }
      },
      {
        "fieldType": "AptFloorNo",
        "valueType": "SHORT_TEXT",
        "id": "cbfe521f-87c5-41c1-a538-88d69b4bed97",
        "label": "Apt/ Floor No.",
        "labelTranslationKey": "booking-form.fields.apt-floor.label",
        "allowedActions": {
          "remove": false,
          "require": true,
          "duplicate": false
        }
      },
      {
        "fieldType": "City",
        "valueType": "SHORT_TEXT",
        "id": "4ce6642f-3948-444b-8e92-bb435cb7db00",
        "label": "City",
        "labelTranslationKey": "booking-form.fields.city.label",
        "allowedActions": {
          "remove": true,
          "require": false,
          "duplicate": false
        },
        "userConstraints": {
          "required": true
        }
      }
    ],
    "userConstraints": {
      "required": true
    }
  }
}
 */
