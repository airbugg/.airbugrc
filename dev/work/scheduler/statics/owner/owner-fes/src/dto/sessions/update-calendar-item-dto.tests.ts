// import {CourseSessionDomain} from '../../../calendar/common/domain/course-session.domain';
// import {CourseSessionDtoBuilder} from '../../../../test/mock/dto-builders/course-session.dto.builder';
// import {mapCalendarItemDomainToUpdateCalendarItemDto, UpdateCalendarItemDto} from './update-calendar-item-dto';

// describe('Update calendar item', () => {

//   beforeEach(() => {
//     angular.mock.module( 'schedulerOwnerAppInternal');
//   });

//   it('should map course session domain to update item dto with note as null', () => {
//     const courseSession = new CourseSessionDomain(new CourseSessionDtoBuilder().withNote('').build(), '');

//     let expectedUpdateCalendarItemDto: UpdateCalendarItemDto = {
//       id: courseSession.id,
//       startTime: courseSession.startTime,
//       endTime: courseSession.endTime,
//       staffMemberId: courseSession.staffId,
//       note: null
//     };

//     expect(expectedUpdateCalendarItemDto).toEqual(mapCalendarItemDomainToUpdateCalendarItemDto(courseSession));
//   });

//   it('should map course session domain to update item dto with updated note', () => {
//     const dummyNote = 'dummy note';
//     const courseSession = new CourseSessionDomain(new CourseSessionDtoBuilder().withNote(dummyNote).build(), '');

//     let expectedUpdateCalendarItemDto: UpdateCalendarItemDto = {
//       id: courseSession.id,
//       startTime: courseSession.startTime,
//       endTime: courseSession.endTime,
//       staffMemberId: courseSession.staffId,
//       note: dummyNote
//     };

//     expect(expectedUpdateCalendarItemDto).toEqual(mapCalendarItemDomainToUpdateCalendarItemDto(courseSession));
//   });

// });
