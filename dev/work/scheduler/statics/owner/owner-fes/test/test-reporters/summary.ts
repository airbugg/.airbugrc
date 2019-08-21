const SummaryReporter = require('jest-cli/build/reporters/summary_reporter')
  .default;

class FingersCrossedSummaryReporter extends SummaryReporter {}

module.exports = FingersCrossedSummaryReporter;
