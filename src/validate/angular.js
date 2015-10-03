/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
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

/* istanbul ignore next: a) nothing to test, b) implimentation detail */
/**
 * Creates an output object. If ignore = true, then error = null and ok = true. If ok = true, error = null
 * @param {boolean} [ok=true] - Is the message valid?
 * @param {error|string} [error=null] - What's wrong with the message? (Ignored if ok = true)
 * @param {boolean} [ignore=false] - Was this message ignored?
 * @return {{ok: boolean, error: (string|null), ignore: boolean}}
 */
function makeOutput(ok = true, error = null, ignore = false) {
  ok = !!ok;
  ignore = !!ignore;
  if (ignore) ok = true;
  if (ok) error = null;
  if (error && error.message) error = error.message;

  return { ok, error: `${error}` || null, ignore };
}

/**
 * Validates a commit message.
 * @param {string} message - the message to validate
 * @return {{ok: boolean, error: (string|null), ignore: boolean}}
 */
function validateMessage(message) {
  if (IGNORED.test(message)) {
    return makeOutput(true, null, true);
  }

  if (message.length > MAX_LENGTH) {
    return makeOutput(false, `Commit message is longer than ${MAX_LENGTH} characters!`);
  }

  const match = PATTERN.exec(message);

  if (!match) {
    return makeOutput(false, `Commit message does not match "<type>(<scope>): <subject>"!`);
  }

  const [, type /* , , scope, subject */ ] = match;

  if (TYPES.indexOf(type) === -1) {
    return makeOutput(false, `"${type}" is not an allowed type!`);
  }

  // Some more ideas, do want anything like this ?
  // - allow only specific scopes (eg. fix(docs) should not be allowed) ?

  return makeOutput();
}

module.exports = validateMessage;
