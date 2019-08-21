// import {MockUtils} from '../base-mock';
// import {LocationTypes, CalendarItemType} from '../../../modules/common/dto/sessions/session.dto';
// import {GroupSessionDto} from '../../../modules/common/dto/sessions/group-session.dto';

// function validGroupSession(): GroupSessionDto {
//   const now = moment();

//   return ({
//     type: CalendarItemType.Group,
//     staffId: 'staff_id_01',
//     startTime: +now.clone(),
//     endTime: +now.clone().add(1, 'hours'),
//     origin: {},
//     id: MockUtils.guid(),
//     offeringId: MockUtils.guid(),
//     locationType: LocationTypes.BUSINESS,
//     offeringName: 'offering name',
//     participantsCapacity: 15,
//     registeredParticipants: 3,
//     formattedLocation: 'formatted location',
//     note: 'note',
//     uouHidden: false
//   });
// }

// export class GroupSessionDtoBuilder {
//   groupSession: GroupSessionDto = {...validGroupSession()};

//   withNote(note) {
//     this.groupSession.note = note;
//     return this;
//   }

//   withId(id: string) {
//     this.groupSession.id = id;
//     return this;
//   }

//   withStaffId(staffId: string) {
//     this.groupSession.staffId = staffId;
//     return this;
//   }

//   withTimeInterval(startTime, endTime) {
//     this.groupSession.startTime = startTime;
//     this.groupSession.endTime = endTime;
//     return this;
//   }

//   withOfferingName(offeringName) {
//     this.groupSession.offeringName = offeringName;
//     return this;
//   }

//   withOfferingId(offeringId: string) {
//     this.groupSession.offeringId = offeringId;
//     return this;
//   }

//   withLocation(location) {
//     this.groupSession.locationType = location.locationType;
//     this.groupSession.formattedLocation = location.formattedLocation;

//     return this;
//   }

//   withParticipantsCapacity(participantsCapacity) {
//     this.groupSession.participantsCapacity = participantsCapacity;
//     return this;
//   }

//   withRegisteredParticipants(registeredParticipants) {
//     this.groupSession.registeredParticipants = registeredParticipants;
//     return this;
//   }

//   withOrigin(origin: any) {
//     this.groupSession.origin = origin;
//     return this;
//   }

//   build() {
//     return this.groupSession;
//   };
// }
