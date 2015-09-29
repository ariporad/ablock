/* (c) 2015 Ari Porad. MIT License: ariporad.mit-license.org */
/**
 * Validate commit messages
 * See https://docs.google.com/document/d/1rk04jEuGfk9kYzfqCuOlPTSJw3hEDZJTBN5E5f1SALo/edit
 *
 * Borrowed and modified from: https://github.com/angular/angular.js/blob/master/validate-commit-msg.js
 */
const MAX_LENGTH = 100;
const PATTERN = /^(?:fixup!\s*)?(\w*)(\(([\w\$\.\*/-]*)\))?\: (.*)$/;
const IGNORED = /^WIP\:/;
const TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'chore',
  'revert',
];

function makeOutput(ok = true, error = null, ignore = false) {
  return { ok, error, ignore };
}

function validateMessage(message) {
  if (IGNORED.test(message)) {
    return makeOutput(true, null, true);
  }

  if (message.length > MAX_LENGTH) {
    return makeOutput(false, `Commit message is longer than ${MAX_LENGTH} characters!`, false);
  }

  const match = PATTERN.exec(message);

  if (!match) {
    return makeOutput(false, `Commit message does not match "<type>(<scope>): <subject>"!`, false);
  }

  const [, type /* , , scope, subject */ ] = match;

  if (TYPES.indexOf(type) === -1) {
    return makeOutput(false, `"${type}" is not an allowed type!`, false);
  }

  // Some more ideas, do want anything like this ?
  // - allow only specific scopes (eg. fix(docs) should not be allowed) ?

  return makeOutput(true, null, false);
}

module.exports = validateMessage;
