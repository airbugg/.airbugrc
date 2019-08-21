import { createAnAppointment } from '../../../test/builders/dto/appointment.dto.builder';
import {
  extractSessionInfo,
  mapAppointmentToBookRequest,
} from './appointment-to-bookings';
import { Chance } from 'chance';
import { getLinkedSchedule } from './offering/offering-to-service';
import {
  LocationType,
  PaidPlan,
  Session,
} from '@wix/ambassador-bookings-server';
import { mapPaidPlanToBenefitOrderId } from './benefit-plan/paid-plan-to-plan-order-id';
import { OfferingTypes } from '../../dto/offerings/offerings.consts';
import { aStaffResource } from '../../../test/builders/rpc-custom/resource-builder';
import { createAService } from '../../../test/builders/rpc-custom/service';
import { aGetServiceResponse } from '@wix/ambassador-services-catalog-server/builders';
import {
  aPaidPlan,
  aPrice,
  aRate,
  RateDTOBuilder,
} from '@wix/ambassador-checkout-server/builders';
import {
  aSchedule,
  LocationDTOBuilder,
  aLocation,
} from '@wix/ambassador-services-server/builders';
import { aResource } from '@wix/ambassador-resources-server/builders';

describe('service response from offering', () => {
  const chance = new Chance();
  const title = chance.sentence();
  let rateBuilder: RateDTOBuilder;
  let locationBuilder: LocationDTOBuilder;
  beforeEach(() => {
    locationBuilder = aLocation()
      .withAddress(chance.address())
      .withLocationType(chance.pickone([
        'CUSTOM',
        'OWNER_CUSTOM',
        'OWNER_BUSINESS',
      ]) as LocationType);
    rateBuilder = aRate().withLabeledPriceOptions({
      general: aPrice()
        .withAmount(chance.integer().toString())
        .withCurrency(chance.currency().code)
        .build(),
    });
  });

  it('should map appointment to bookings', () => {
    const location = locationBuilder.build();
    const serviceResponse = aGetServiceResponse()
      .withSchedules([
        aSchedule()
          .withRate(rateBuilder.build())
          .withLocation(location)
          .withTitle(title)
          .build(),
      ])
      .build();

    const staff = aResource()
      .withSchedules([aSchedule().build()])
      .build();
    const appointment = createAnAppointment();
    const bookReq = mapAppointmentToBookRequest(
      appointment,
      serviceResponse,
      staff,
    );
    const session = bookReq.createSession;
    const contactDetails = bookReq.formInfo.contactDetails;
    expect(session.start.timestamp).toBe(
      new Date(appointment.from).toISOString(),
    );
    expect(session.end.timestamp).toBe(new Date(appointment.to).toISOString());
    expect(session.notes).toBe(appointment.notes);
    expect(contactDetails.firstName).toBe(appointment.fullName);
    expect(contactDetails.email).toBe(appointment.email);
    expect(contactDetails.phone).toBe(appointment.phoneNumber);
    expect(session.affectedSchedules.length).toBe(1);
    expect(session.affectedSchedules).toEqual(getLinkedSchedule([staff]));
    expect(session.location).toEqual(location);
    expect(session.title).toEqual(title);
    expect(bookReq.notifyParticipants).toBe(appointment.sendEmail);
  });

  it('should map customer location appointment', () => {
    const appointment: any = createAnAppointment();
    appointment.city = chance.name();
    appointment.addressLine = chance.address();
    appointment.apartmentNum = chance.natural();
    const service = createAService().build();
    const schedule = aSchedule()
      .withRate(rateBuilder.build())
      .withLocation(
        locationBuilder.withLocationType(LocationType.CUSTOM).build(),
      )
      .withTitle(title)
      .withTags([OfferingTypes.INDIVIDUAL])
      .build();
    const staff = aStaffResource(schedule);
    const expectedSession: Session = extractSessionInfo(
      appointment,
      aGetServiceResponse()
        .withService(service)
        .withSchedules([schedule])
        .build(),
      staff,
    );
    expect(expectedSession.location.locationType).toBe('CUSTOM');
    expect(expectedSession.location.address).toContain(appointment.city);
  });

  it("should map empty customer location without 'undefined'", () => {
    const appointment: any = createAnAppointment();
    const service = createAService().build();
    const schedule = aSchedule()
      .withRate(rateBuilder.build())
      .withLocation(
        locationBuilder.withLocationType(LocationType.CUSTOM).build(),
      )
      .withTitle(title)
      .withTags([OfferingTypes.INDIVIDUAL])
      .build();
    const staff = aStaffResource(schedule);
    const expectedSession: Session = extractSessionInfo(
      appointment,
      aGetServiceResponse()
        .withService(service)
        .withSchedules([schedule])
        .build(),
      staff,
    );
    expect(expectedSession.location.locationType).toBe(LocationType.CUSTOM);
    expect(expectedSession.location.address).not.toContain('undefined');
  });

  it('should map appointment planOrderId to bookings request', () => {
    const paidPlan: PaidPlan = aPaidPlan()
      .withBenefitId(chance.guid())
      .withOrderId(chance.guid())
      .build();
    const serviceResponse = aGetServiceResponse()
      .withSchedules([
        aSchedule()
          .withRate(rateBuilder.build())
          .withLocation(locationBuilder.build())
          .withTitle(title)
          .build(),
      ])
      .build();

    const staff = aResource()
      .withSchedules([aSchedule().build()])
      .build();
    const appointment = createAnAppointment();
    (appointment as any).benefitOrderId = mapPaidPlanToBenefitOrderId(paidPlan);
    const bookReq = mapAppointmentToBookRequest(
      appointment,
      serviceResponse,
      staff,
    );
    const expectedPlan = bookReq.planSelection;
    expect(expectedPlan.orderId).toBe(paidPlan.orderId);
    expect(expectedPlan.benefitId).toBe(paidPlan.benefitId);
  });
});
