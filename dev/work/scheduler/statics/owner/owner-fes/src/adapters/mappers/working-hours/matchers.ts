import * as diff from 'jest-diff';
import { WorkingHour } from '../../../dto/offerings/working-days.dto';
import { Interval } from '@wix/ambassador-resources-server/rpc';
import * as moment from 'moment';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDerivativeFromWorkingsHours(
        expected: WorkingHour,
      ): CustomMatcherResult;
    }
  }
}

expect.extend({
  toBeDerivativeFromWorkingsHours(received: Interval, expected: WorkingHour) {
    function toMoment(timeOfDay: string) {
      const [hour, minute] = timeOfDay.split(':').map(res => parseInt(res, 10));
      return moment()
        .hour(hour)
        .minute(minute);
    }
    const startMoment = toMoment(expected.startTime);
    const endMoment = toMoment(expected.endTime);
    const duration = endMoment.diff(startMoment, 'm');
    const expectedObject = {
      hourOfDay: startMoment.hour(),
      minuteOfHour: startMoment.minute(),
      duration,
    };
    const doMatch =
      received.minuteOfHour === startMoment.minute() &&
      received.hourOfDay === startMoment.hour() &&
      received.duration === duration;
    const message = !doMatch
      ? () => {
          const difference = diff(expected, received, {
            expand: this.expand,
          });

          return (
            this.utils.matcherHint(
              'toBeDerivativeFromWorkingsHours',
              undefined,
              undefined,
            ) +
            '\n\n' +
            (difference && difference.includes('- Expect')
              ? `Difference:\n\n${difference}`
              : `Expected: ${this.utils.printExpected(expectedObject)}\n` +
                `Received: ${this.utils.printReceived(received)}`)
          );
        }
      : () => '';
    return {
      pass: doMatch,
      message,
      actual: received,
    };
  },
});
