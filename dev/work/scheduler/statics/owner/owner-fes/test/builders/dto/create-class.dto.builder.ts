import { ClassSession } from '../../../src/dto/sessions/session.dto';
import { Chance } from 'chance';

const chance = Chance();
import * as moment from 'moment';

export function validCreateClassSession() {
  const start = moment();
  const duration = chance.natural({ min: 10, max: 120 });
  const classSession: ClassSession = {
    location: 'OTHER',
    name: chance.string(),
    locationText: chance.string(),
    isFree: chance.bool(),
    capacity: chance.integer({ min: 1, max: 20 }),
    classProtoId: chance.guid(),
    currency: chance.currency().code,
    staffMemberId: chance.guid(),
    notes: chance.paragraph(),
    classDate: start.add(1, 'day').format('YYYY-MM-DD'),
    classTime: start.add(1, 'day').format('HH:mm:00.000'),
    start: start.valueOf(),
    end: start.add(duration, 'm').valueOf(),
  };
  return classSession;
}
