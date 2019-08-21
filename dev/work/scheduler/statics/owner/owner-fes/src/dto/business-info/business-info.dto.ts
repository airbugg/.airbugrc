import { Template } from '@wix/ambassador-notifications-server';
import { WorkingHoursDto } from '../working-hours.dto';

export interface Business {
  language: any;
  locale: any;
  email: any;
  currency: any;
  phone: any;
  name: string;
  timeZone: any;
  formattedAddress: any | String;
  businessLocation: string;
  cancellationPolicy: any;
  classConfirmationEmail: Template;
  confirmationEmail: Template;
  groupCancellationEmail: Template;
  remindersEmails: {
    classEmail: Template;
    individualEmail: Template;
  };
  useReminders: boolean;
  connectedCalendars: any;
  workingHours: WorkingHoursDto;
  slotLength: number;
  cancellationLeadTime: number;
  leadTime: number;
  businessType: string;
}
