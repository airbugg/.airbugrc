import * as moment from 'moment';
import { UNITS_OF_TIME } from '@wix/bookings-platform-adapter/lib/adapters/booking-policy/booking-policy';
export const toMinutes = (amount, units) =>
  moment.duration(Number(amount), units).asMinutes();

export const minutesToUnits = (amount, units: UNITS_OF_TIME): number => {
  const duration = moment.duration(Number(amount), 'minutes');

  switch (units) {
    case UNITS_OF_TIME.DAYS:
      return duration.asDays();
    case UNITS_OF_TIME.HOURS:
      return duration.asHours();
    case UNITS_OF_TIME.MINUTES:
      return duration.asMinutes();
    default:
      return null;
  }
};
