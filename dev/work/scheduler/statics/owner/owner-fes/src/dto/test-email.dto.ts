export interface testEmailDto {
  body: string;
  emailType: emailTypes;
  serviceType: emailServiceType;
  subject: string;
}

export enum emailTypes {
  CANCELLATION = 'cancellation',
  REMINDER = 'reminder',
  CONFIRMATION = 'confirmation',
}

export enum emailServiceType {
  PRIVATE = 'private',
  GROUP = 'group',
}
