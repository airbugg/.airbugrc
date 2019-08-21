import { Chance } from 'chance';
import { Business } from '../../../src/dto/business-info/business-info.dto';
import { WorkingHoursDto } from '../../../src/dto/working-hours.dto';

const chance = new Chance();

export function createBusinessInfo(
  workingHours: WorkingHoursDto = null,
): Business {
  return {
    businessType: 'business',
    currency: chance.currency().code,
    phone: chance.phone(),
    email: chance.email(),
    name: `${chance.first()}  ${chance.last()}`,
    cancellationPolicy: chance.paragraph({ sentences: 3 }),
    language: 'en',
    locale: 'he_IL',
    timeZone: 'Asia/Brunei',
    formattedAddress: 'address',
    businessLocation: 'ON_THE_GO',
    connectedCalendars: {},
    useReminders: chance.bool(),
    workingHours: workingHours
      ? workingHours
      : {
          fri: null,
          mon: null,
          sat: null,
          sun: null,
          thu: null,
          tue: null,
          wed: null,
        },
    classConfirmationEmail: {
      subject: chance.paragraph({ sentences: 1 }),
      body: chance.paragraph({ sentences: 3 }),
    },
    groupCancellationEmail: {
      subject: chance.paragraph({ sentences: 1 }),
      body: chance.paragraph({ sentences: 3 }),
    },
    confirmationEmail: {
      subject: chance.paragraph({ sentences: 1 }),
      body: chance.paragraph({ sentences: 3 }),
    },
    remindersEmails: {
      classEmail: {
        subject: chance.paragraph({ sentences: 1 }),
        body: chance.paragraph({ sentences: 3 }),
      },
      individualEmail: {
        subject: chance.paragraph({ sentences: 1 }),
        body: chance.paragraph({ sentences: 3 }),
      },
    },
    slotLength: chance.pickone([5, 10, 15, 30, 60]),
    leadTime: chance.integer({ min: 0, max: 72 }),
    cancellationLeadTime: chance.integer({ min: 0, max: 72 }),
  };
}
