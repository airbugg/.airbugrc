import { Chance } from 'chance';
const chance = new Chance();

export function createAnAppointment(staffMemberId = chance.guid()) {
  const appointment = {
    email: chance.email(),
    from: 1547634600000,
    fullName: `${chance.first()} ${chance.last()}`,
    notes: chance.paragraph(),
    phoneNumber: chance.phone(),
    sendEmail: chance.bool(),
    serviceId: chance.guid(),
    staffMemberId,
    to: 1547638200000,
    type: 'Service',
  };
  return appointment;
}
