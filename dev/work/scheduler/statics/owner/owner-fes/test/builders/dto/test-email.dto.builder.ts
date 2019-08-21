import {
  emailServiceType,
  emailTypes,
  testEmailDto,
} from '../../../src/dto/test-email.dto';
import { Chance } from 'chance';

const chance = new Chance();

export class testEmailBuilder {
  private readonly subject: string = chance.sentence();
  private readonly serviceType: emailServiceType = chance.pickone([
    emailServiceType.GROUP,
    emailServiceType.PRIVATE,
  ]);
  private readonly body: string = chance.paragraph();
  private readonly emailType: emailTypes = chance.pickone([
    emailTypes.CANCELLATION,
    emailTypes.CONFIRMATION,
    emailTypes.REMINDER,
  ]);

  public Build(): testEmailDto {
    return {
      subject: this.subject,
      body: this.body,
      serviceType: this.serviceType,
      emailType: this.emailType,
    };
  }
}
