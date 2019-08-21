import {
  aFieldConstraints,
  aForm,
  aFormField,
  aGetFormResponse,
  aHeader,
  anAddressFields,
} from '@wix/ambassador-services-server/builders';
import { anActionLabels } from '@wix/ambassador-services-catalog-server/builders';
import { Chance } from 'chance';

const chance = new Chance();

export function aSimpleFormField() {
  return aFormField()
    .withValueType(chance.pickone(['LONG_TEXT', 'SHORT_TEXT', 'UNDEFINED']))
    .withFieldId(chance.guid())
    .withLabel(chance.string())
    .withUserConstraints(
      aFieldConstraints()
        .withRequired(true)
        .build(),
    );
}

export function buildASimpleFormResponse() {
  const bookingForm = aGetFormResponse()
    .withForm(
      aForm()
        .withId(chance.guid())
        .withHeader(
          aHeader()
            .withTitle(chance.string())
            .withIsDescriptionHidden(chance.bool())
            .withDescription(chance.paragraph({ sentences: 1 }))
            .build(),
        )
        .withActionLabels(
          anActionLabels()
            .withOfflinePaymentLabel(chance.string())
            .withOnlinePaymentLabel(chance.string())
            .build(),
        )
        .withId(chance.guid())
        .withEmail(aSimpleFormField().build())
        .withName(aSimpleFormField().build())
        .withNumberOfParticipants(aSimpleFormField().build())
        .withPhone(aSimpleFormField().build())
        .withAddress(
          anAddressFields()
            .withCity(aSimpleFormField().build())
            .withFloorNumber(aSimpleFormField().build())
            .withStreet(aSimpleFormField().build())
            .build(),
        )
        .withCustomFields([])
        .build(),
    )
    .build();
  return bookingForm;
}
