// import {CalendarItemType} from '../../../modules/common/dto/sessions/session.dto';
// import {BlockingCalendarItemDto} from '../../../modules/common/dto/sessions/blocking-calendar-item.dto';
// import {MockUtils} from '../base-mock';

// function validBlockingCalendarItemDto(): BlockingCalendarItemDto {
//   const now = moment();

//   return ({
//     id: MockUtils.guid(),
//     type: CalendarItemType.Blocked,
//     staffId: 'staff_id_01',
//     startTime: +now.clone(),
//     endTime: +now.clone().add(1, 'hours'),
//     origin: {},
//     note: 'note'
//   });
// }

// export class BlockingCalendarItemDtoBuilder {
//   blockingCalendarItem: BlockingCalendarItemDto = {...validBlockingCalendarItemDto()};

//   withId(id) {
//     this.blockingCalendarItem.id = id;
//     return this;
//   }

//   withStaffId(staffId) {
//     this.blockingCalendarItem.staffId = staffId;
//     return this;
//   }

//   withNote(note) {
//     this.blockingCalendarItem.note = note;
//     return this;
//   }

//   withTimeInterval(startTime, endTime) {
//     this.blockingCalendarItem.startTime = startTime;
//     this.blockingCalendarItem.endTime = endTime;
//     return this;
//   }

//   withOrigin(origin: any) {
//     this.blockingCalendarItem.origin = origin;
//     return this;
//   }

//   build() {
//     return this.blockingCalendarItem;
//   };
// }
