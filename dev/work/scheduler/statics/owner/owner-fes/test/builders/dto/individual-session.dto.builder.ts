import { IndividualSessionDto } from '../../../src/dto/sessions/individual-session.dto';
import { Chance } from 'chance';
import {
  CalendarItemType,
  LocationTypes,
} from '../../../src/dto/sessions/session.dto';
import * as moment from 'moment';

const chance = new Chance();

function validIndividualSession(): IndividualSessionDto {
  const now = moment();
  const id = chance.guid();
  const offeringName = chance.sentence({ words: 5 });
  const startTime = +now.clone();
  const endTime = +now.clone().add(1, 'hours');

  return {
    type: CalendarItemType.Individual,
    staffId: chance.guid(),
    startTime,
    endTime,
    origin: {
      id,
      staffMemberId: chance.guid(),
      serviceId: chance.guid(),
      summary: chance.string(),
      location: 'BUSINESS',
      locationText: '',
      addressLine: chance.address(),
      apartmentNum: chance.integer({ min: 1, max: 50 }),
      city: chance.city(),
      name: chance.name({ nationality: 'en' }),
      notes: chance.sentence({ words: 5 }),
      serviceName: offeringName,
      from: startTime,
      to: endTime,
      email: chance.email(),
      phone: chance.phone(),
    },
    id,
    offeringId: chance.guid(),
    locationType: LocationTypes.OTHER,
    offeringName,
    participantsCapacity: chance.integer({ min: 1, max: 30 }),
    registeredParticipants: chance.integer({ min: 1, max: 30 }),
    formattedLocation: chance.address(),
    customerName: chance.name({ nationality: 'en' }),
    customerPhone: chance.phone(),
    customerEmail: chance.email(),
    note: chance.sentence({ words: 5 }),
    uouHidden: false,
  };
}

export class IndividualSessionDtoBuilder {
  individualSession: IndividualSessionDto = { ...validIndividualSession() };

  withNote(note) {
    this.individualSession.note = note;
    return this;
  }

  withLocation(location) {
    this.individualSession.locationType = location.locationType;
    this.individualSession.formattedLocation = location.formattedLocation;

    return this;
  }

  withId(id: string) {
    this.individualSession.id = id;
    return this;
  }

  withStaffId(staffId: string) {
    this.individualSession.staffId = staffId;
    return this;
  }

  withTimeInterval(startTime, endTime) {
    this.individualSession.startTime = startTime;
    this.individualSession.endTime = endTime;
    return this;
  }

  withOfferingName(offeringName) {
    this.individualSession.offeringName = offeringName;
    this.individualSession.origin.serviceName = offeringName;
    return this;
  }

  withUouHidden(uouHidden: boolean) {
    this.individualSession.uouHidden = uouHidden;
    return this;
  }

  withOfferingId(offeringId: string) {
    this.individualSession.offeringId = offeringId;
    return this;
  }

  withCustomerName(customerName: string) {
    this.individualSession.customerName = customerName;
    return this;
  }

  withCustomerPhone(phone: string) {
    this.individualSession.customerPhone = phone;
    return this;
  }

  withCustomerEmail(email: string) {
    this.individualSession.customerEmail = email;
    return this;
  }

  withOrigin(origin: any) {
    this.individualSession.origin = origin;
    return this;
  }

  build() {
    return this.individualSession;
  }
}
