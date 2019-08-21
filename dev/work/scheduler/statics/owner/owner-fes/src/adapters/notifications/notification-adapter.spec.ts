import {
  extractNotification,
  findNotificationByType,
  getUseReminders,
  mapNotificationDotTypeToPlatformType,
  mapNotificationDtoServiceTypeToTag,
  sendTestNotification,
} from './notification-adapter';
import { testEmailBuilder } from '../../../test/builders/dto/test-email.dto.builder';
import { Notification } from '@wix/ambassador-notifications-server';
import { aNotification } from '@wix/ambassador-notifications-server/builders';
import { Chance } from 'chance';
import { createBusinessInfo } from '../../../test/builders/dto/business-info.dto.builder';
import { NotificationType } from '@wix/ambassador-notifications-server/types';

const chance = new Chance();
describe('notifications:', () => {
  it('should get the default notification', () => {});
  it('should send test email', async () => {
    const testerOfEmail = jest.fn();
    const testRequestDto = new testEmailBuilder().Build();
    const expectedNotification: Notification = {
      type: mapNotificationDotTypeToPlatformType(testRequestDto.emailType),
      template: {
        subject: testRequestDto.subject,
        body: testRequestDto.body,
      },
      isEnabled: true,
      tag: mapNotificationDtoServiceTypeToTag(testRequestDto.serviceType),
    };

    await sendTestNotification(testerOfEmail, testRequestDto);

    expect(testerOfEmail).toHaveBeenCalledWith(expectedNotification);
  });
  it('should return user Reminders ', () => {
    const reminderNotification = aNotification()
      .withIsEnabled(chance.bool())
      .withType(NotificationType.REMINDER_EMAIL)
      .build();
    expect(getUseReminders([reminderNotification])).toBe(
      reminderNotification.isEnabled,
    );
  });
  it('should update userReminders with business info data', () => {
    const businessInfo = createBusinessInfo();
    const notificationsList = extractNotification(businessInfo);
    expect(
      findNotificationByType(notificationsList, 'REMINDER_EMAIL').isEnabled,
    ).toBe(businessInfo.useReminders);
  });
});
