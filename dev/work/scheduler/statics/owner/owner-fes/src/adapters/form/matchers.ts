import * as diff from 'jest-diff';
import { FormField } from '@wix/ambassador-services-server';
import { IDynamicFormAttribute } from '../../dto/form.dto';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDerivativeFromFormFieldDTO(expected: FormField): CustomMatcherResult;
    }
  }
}

expect.extend({
  toBeDerivativeFromFormFieldDTO(
    received: IDynamicFormAttribute,
    expected: FormField,
  ) {
    const doMatch =
      received.id === expected.fieldId &&
      received.valueType === expected.valueType &&
      received.label === expected.label &&
      received.userConstraints.required === received.userConstraints.required;
    const message = !doMatch
      ? () => {
          const difference = diff(expected, received, {
            expand: this.expand,
          });
          return (
            this.utils.matcherHint(
              'toBeDerivativeFromFormFieldDTO',
              undefined,
              undefined,
            ) +
            '\n\n' +
            (difference && difference.includes('- Expect')
              ? `Difference:\n\n${difference}`
              : `Expected: ${this.utils.printExpected(expected)}\n` +
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
