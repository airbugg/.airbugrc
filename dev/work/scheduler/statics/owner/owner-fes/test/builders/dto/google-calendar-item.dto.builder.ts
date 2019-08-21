// import {CalendarItemType} from '../../../modules/common/dto/sessions/session.dto';
// import {GoogleCalendarItemDto} from '../../../modules/common/dto/sessions/google-calendar-item.dto';

// function validGoogleCalendarItemDto(): GoogleCalendarItemDto {
//   const now = moment();

//   return ({
//     type: CalendarItemType.Google,
//     staffId: 'staff_id_01',
//     startTime: +now.clone(),
//     endTime: +now.clone().add(1, 'hours'),
//     link: 'http://www.google.com',
//     origin: {}
//   });
// }

// export class GoogleCalendarItemDtoBuilder {
//   googleCalendarItem: GoogleCalendarItemDto = {...validGoogleCalendarItemDto()};

//   withStaffId(staffId) {
//     this.googleCalendarItem.staffId = staffId;
//     return this;
//   }

//   withRedirectLink(link) {
//     this.googleCalendarItem.link = link;
//     return this;
//   }

//   withTimeInterval(startTime, endTime) {
//     this.googleCalendarItem.startTime = startTime;
//     this.googleCalendarItem.endTime = endTime;
//     return this;
//   }

//   withOrigin(origin: any) {
//     this.googleCalendarItem.origin = origin;
//     return this;
//   }

//   build() {
//     return this.googleCalendarItem;
//   };
// }
