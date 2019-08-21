// import {MockUtils} from '../base-mock';
// import {LocationTypes, CalendarItemType} from '../../../modules/common/dto/sessions/session.dto';
// import {CourseSessionDto} from '../../../modules/common/dto/sessions/course-session.dto';

// function validCourseSession(): CourseSessionDto {
//   const now = moment();

//   return ({
//     type: CalendarItemType.Course,
//     staffId: 'staff_id_01',
//     startTime: now.clone().valueOf(),
//     endTime: now.clone().add(1, 'hours').valueOf(),
//     origin: {},
//     id: MockUtils.guid(),
//     offeringId: MockUtils.guid(),
//     locationType: LocationTypes.OTHER,
//     offeringName: 'offering name',
//     intervalId: 'interval_id',
//     participantsCapacity: 15,
//     registeredParticipants: 3,
//     formattedLocation: 'formatted location',
//     offeringStartTime: now.clone().subtract(1, 'week').valueOf(),
//     offeringEndTime: now.clone().add(1, 'week').valueOf(),
//     note: 'note',
//     uouHidden: false
//   });
// }

// export class CourseSessionDtoBuilder {
//   courseSession: CourseSessionDto = {...validCourseSession()};

//   withNote(note) {
//     this.courseSession.note = note;
//     return this;
//   }

//   withId(id: string) {
//     this.courseSession.id = id;
//     return this;
//   }

//   withIntervalId(intervalId: string) {
//     this.courseSession.intervalId = intervalId;
//     return this;
//   }

//   withStaffId(staffId: string) {
//     this.courseSession.staffId = staffId;
//     return this;
//   }

//   withTimeInterval(startTime, endTime) {
//     this.courseSession.startTime = startTime;
//     this.courseSession.endTime = endTime;
//     return this;
//   }

//   withOfferingTimeInterval(startTime, endTime) {
//     this.courseSession.offeringStartTime = startTime;
//     this.courseSession.offeringEndTime = endTime;
//     return this;
//   }

//   withOfferingName(offeringName) {
//     this.courseSession.offeringName = offeringName;
//     return this;
//   }

//   withOfferingEndTime(offeringEndTime) {
//     this.courseSession.offeringEndTime = offeringEndTime;
//     return this;
//   }

//   withOfferingStartTime(offeringStartTime) {
//     this.courseSession.offeringStartTime = offeringStartTime;
//     return this;
//   }

//   withOfferingId(offeringId: string) {
//     this.courseSession.offeringId = offeringId;
//     return this;
//   }

//   withParticipantsCapacity(participantsCapacity: number) {
//     this.courseSession.participantsCapacity = participantsCapacity;
//     return this;
//   }

//   withRegisteredParticipants(registeredParticipants: number) {
//     this.courseSession.registeredParticipants = registeredParticipants;
//     return this;
//   }

//   withOrigin(origin: any) {
//     this.courseSession.origin = origin;
//     return this;
//   }

//   withLocation({locationType, formattedLocation}) {
//     this.courseSession.locationType = locationType;
//     this.courseSession.formattedLocation = formattedLocation;

//     return this;
//   }

//   withStartTime(startTime) {
//     this.courseSession.startTime = startTime;
//     return this;
//   }

//   withEndTime(endTime) {
//     this.courseSession.endTime = endTime;
//     return this;
//   }

//   build() {
//     return this.courseSession;
//   };
// }
