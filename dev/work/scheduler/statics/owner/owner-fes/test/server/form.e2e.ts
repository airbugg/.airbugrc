import axios from 'axios';
import { ServicesServer } from '@wix/ambassador-services-server/rpc';
import { buildASimpleFormResponse } from '../builders/rpc-custom/form-builder';
import { validBookingsForm } from '../builders/dto/form.dto.builder';

describe('', () => {
  it('should return a default from', async () => {
    const servicesCatalogServerStub = ambassadorServer.createStub(
      ServicesServer,
    );
    const simpleFormResponse = buildASimpleFormResponse();
    servicesCatalogServerStub
      .FormsService()
      .get.when({})
      .resolve(simpleFormResponse);
    const res = await axios.get(app.getUrl(`/owner/bookingsForm/`));
    expect(res.data.form).toBeDefined();
  });

  it('should update the a default from', async () => {
    const servicesCatalogServerStub = ambassadorServer.createStub(
      ServicesServer,
    );
    const simpleFormResponse = buildASimpleFormResponse();
    servicesCatalogServerStub
      .FormsService()
      .update.when(() => true)
      .resolve(simpleFormResponse);
    const res = await axios.put(
      app.getUrl(`/owner/bookingsForm/`),
      validBookingsForm(),
    );
    expect(res.data.id).toBeDefined();
  });
});
/*
{"form":
{"id":"00000000-0000-0000-0000-000000000000",
"header":{"title":"Add Your Info","description":"Tell us a bit about yourself"},
"fields":[{"fieldType":"FullName",
"valueType":"SHORT_TEXT","userConstraints":{"required":true},"allowedActions":{"remove":false,"require":false,"duplicate":false},"subFields":null,"label":"Name","isNew":false,"id":"00000000-0000-0000-0000-000000000001"},{"fieldType":"Email","valueType":"SHORT_TEXT","userConstraints":{"required":true},"allowedActions":{"remove":false,"require":false,"duplicate":false},"subFields":null,"label":"Email","isNew":false,"id":"00000000-0000-0000-0000-000000000002"},{"fieldType":"PhoneNumber","valueType":"SHORT_TEXT","userConstraints":{},"allowedActions":{"remove":false,"require":true,"duplicate":false},"subFields":null,"label":"Phone Number","isNew":false,"id":"00000000-0000-0000-0000-000000000003"},{"fieldType":"NumberOfParticipants","valueType":"SHORT_TEXT","userConstraints":{"required":true},"allowedActions":{"remove":false,"require":false,"duplicate":false},"subFields":null,"label":"Number of Participants","isNew":false,"id":"00000000-0000-0000-0000-000000000007"},{"fieldType":"Address","valueType":"ADDRESS","userConstraints":{"required":true},"allowedActions":{"remove":false,"require":false,"duplicate":false},"subFields":[{"fieldType":"City","valueType":"SHORT_TEXT","userConstraints":{"required":true},"allowedActions":{"remove":false,"require":false,"duplicate":false},"subFields":null,"label":"City","isNew":false,"id":"00000000-0000-0000-0000-000000000005"},{"fieldType":"Street","valueType":"SHORT_TEXT","userConstraints":{"required":true},"allowedActions":{"remove":false,"require":false,"duplicate":false},"subFields":null,"label":"Street","isNew":false,"id":"00000000-0000-0000-0000-000000000004"},{"fieldType":"AptFloorNo","valueType":"SHORT_TEXT","userConstraints":{},"allowedActions":{"remove":false,"require":true,"duplicate":false},"subFields":null,"label":"Apt. / Floor No.","isNew":false,"id":"00000000-0000-0000-0000-000000000006"}],"label":"Address","isNew":false,"id":"","labelTranslationKey":"booking-form.fields.address.label"},{"fieldType":"Custom","valueType":"LONG_TEXT","userConstraints":{},"allowedActions":{"remove":false,"require":true,"duplicate":false},"subFields":null,"label":"Add Your Message","isNew":false,"id":"00000000-0000-0000-0000-000000000008"}],"actions":{"onlinePaymentLabel":"Pay Now","offlinePaymentLabel":"Book It"}}}






 */
/*
expected res

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
