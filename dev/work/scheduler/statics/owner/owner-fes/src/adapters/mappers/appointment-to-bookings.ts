import {
  BookRequest,
  FormInfo,
  Location,
  PaidPlan,
  PaymentSelection,
  Session,
} from '@wix/ambassador-bookings-server';
import {
  GetServiceResponse,
  Schedule,
} from '@wix/ambassador-services-catalog-server/rpc';
import { getLinkedSchedule } from './offering/offering-to-service';
import { mapBenefitOrderIdToPaidPlan } from './benefit-plan/benefit-order-Id-to-pricing-plan';
import { getPaymentSelectionBySchedules } from '../payment-selection';
import { ServiceLocationType } from '../consts';
import { LocationType } from '@wix/ambassador-checkout-server/types';

function getPaidPlanSelection(appointment) {
  return appointment.benefitOrderId
    ? mapBenefitOrderIdToPaidPlan(appointment.benefitOrderId)
    : null;
}

export function mapAppointmentToBookRequest(
  appointment,
  serviceResponse: GetServiceResponse,
  staffMember,
): BookRequest {
  const formInfo = extractContactInfoFromAppointment(
    appointment,
    serviceResponse.schedules,
  );

  const paidPlanData: PaidPlan = getPaidPlanSelection(appointment);
  const session: Session = extractSessionInfo(
    appointment,
    serviceResponse,
    staffMember,
  );

  const bookRequest: BookRequest = {
    notifyParticipants: appointment.sendEmail,
    createSession: session,
    formInfo,
    planSelection: paidPlanData,
  };

  return bookRequest;
}

function extractContactInfoFromAppointment(
  appointment,
  schedules: Schedule[],
): FormInfo {
  const paymentSelection: PaymentSelection[] = [
    getPaymentSelectionBySchedules(schedules),
  ];

  let address;

  if (isServiceAtClientsLocation(schedules)) {
    address = `${appointment.addressLine} ${appointment.apartmentNum}, ${appointment.city}`;
  }

  return {
    customFormFields: null,
    paymentSelection,
    contactDetails: {
      email: appointment.email,
      firstName: appointment.fullName,
      phone: appointment.phoneNumber,
      contactId: appointment.contactId,
      address,
    },
  };
}

function isServiceAtClientsLocation(schedules: Schedule[]) {
  if (!schedules || !schedules[0]) {
    return false;
  }

  return (
    schedules[0].location &&
    schedules[0].location.locationType === LocationType.CUSTOM
  );
}

export function extractSessionInfo(
  appointment,
  serviceResponse: GetServiceResponse,
  staffMember,
): Session {
  const schedule = serviceResponse.schedules[0];
  return {
    tags: schedule.tags,
    start: {
      timestamp: new Date(appointment.from).toISOString(),
    },
    end: {
      timestamp: new Date(appointment.to).toISOString(),
    },
    notes: appointment.notes,
    rate: schedule.rate,
    affectedSchedules: getLinkedSchedule([staffMember]),
    participants: [],
    totalNumberOfParticipants: schedule.totalNumberOfParticipants,
    scheduleId: schedule.id,
    scheduleOwnerId: appointment.id,
    location: getLocationForAppointment(serviceResponse.schedules, appointment),
    //location: getLocation(serviceResponse.schedules),
    title: getTitle(serviceResponse.schedules),
    id: null,
    inheritedFields: null,
    status: null,
  };
}
// function getLocation(schedules: Schedule[]) {
//   return schedules && schedules[0] ? schedules[0].location : null;
// }

function getLocationForAppointment(
  schedules: Schedule[],
  appointment,
): Location {
  if (!(schedules || schedules[0])) {
    return null;
  }
  const location = schedules[0].location;
  if (
    schedules[0].location &&
    schedules[0].location.locationType === 'CUSTOM'
  ) {
    location.address = getAddress(appointment);
  }
  return location;
}

function validAddressString(value: string): string {
  return value ? value : '';
}

function getAddress(appointment): string {
  return formatAddress(
    validAddressString(appointment.city),
    validAddressString(appointment.addressLine),
    validAddressString(appointment.apartmentNum),
  );
}
//"my street 234234  my ciry"
function formatAddress(city, address, apartmentNum): string {
  return `${address} ${apartmentNum} ${city}`;
}
function getTitle(schedules: Schedule[]) {
  return schedules && schedules[0] ? schedules[0].title : '';
}
