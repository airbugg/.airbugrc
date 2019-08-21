// import {CourseSessionDomain} from '../../../calendar/common/domain/course-session.domain';
// import {CalendarItemDomain} from '../../../calendar/common/domain/calendar-item.domain';

// const mapCourseSessionDomainToUpdateCalendarItemDto = (courseSessionDomain: CourseSessionDomain): UpdateCalendarItemDto => {
//   const updateCalendarItemDto: UpdateCalendarItemDto = {
//     id: courseSessionDomain.id,
//     startTime: courseSessionDomain.startTime,
//     endTime: courseSessionDomain.endTime,
//     staffMemberId: courseSessionDomain.staffId,
//     note: courseSessionDomain.note ? courseSessionDomain.note : null
//   };
//   return updateCalendarItemDto;
// };

// export const mapCalendarItemDomainToUpdateCalendarItemDto = (calendarItemDomain: CalendarItemDomain): UpdateCalendarItemDto => {
//   return mapCourseSessionDomainToUpdateCalendarItemDto(calendarItemDomain as CourseSessionDomain);
// };

// export interface UpdateCalendarItemDto {
//   id: string;
//   startTime: number;
//   endTime: number;
//   staffMemberId: string;
//   note: string;
// }
