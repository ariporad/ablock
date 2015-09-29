/* (c) 2015 Ari Porad. MIT License: ariporad.mit-license.org */
const validate = require('./validate/angular');

/**
 * TODO: This layer isn't good for FauxO (it has dependencies). If you think about what it does, it extracts data
 * (not logic), validates them (this can be done in the integration layer), then generates status options for them
 * (this can be done where ever the GitHub API is actually used). It also has a status constant, which doesn't
 * really need to exist, but could be moved to a JSON file, or a separate module. That's it. It doesn't make sense
 * to have it here (if you adhere to Faux0. Remember, the server is the integration layer. It can depend. It needs
 * to do the following things (in order):
 * [Webhook for PR open, sync]
 * 1. <integrated> Auth/Get User Info/DB Queries/etc.
 * 1.5. <integrated> If needed, get github token for request.
 * 2. <integrated> Get `ghpr` for pull request.
 * 3. <integrated> Get commits from `ghpr`.
 * 4. <isolated> Map the data for each commit, and filter any ignored commits. Also compute the status for the last
 * commit (this could be it's own module (functional only), if you wanted to be able to test it easy).
 * 5. <isolated> Map commits -> status options (Separate module, I think. That makes it easy to test)
 * 6. <integrated> Send all the statuses to Github.
 */
const STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILURE: 'failure',
  ERROR: 'error',
  NONE: 'none',
};

function makeStatusOptions(status, desc) {
  if (status === STATUS.NONE) return undefined;
  return {
    state: status,
    target_url: process.env.COMMIT_GUIDELINES_URL,
    description: desc,
    context: process.env.STATUS_CONTEXT,
  };
}

function parseCommitData(commit) {
  return { sha: commit.sha, message: commit.commit.message };
}

function generateStatuses(commits = []) {
  const statuses = commits.map((commit) => {
    const commitData = parseCommitData(commit);
    const valid = validate(commitData.message);
    let status;
    if (valid.ignored) return null;
    else if (valid.error) status = makeStatusOptions(STATUS.FAILURE, valid.error);
    else if (!valid.ok) status = makeStatusOptions(STATUS.FAILURE, 'Invalid commit message');
    else status = makeStatusOptions(STATUS.SUCCESS, 'Commit message is valid');

    return [commit, status];
  }).filter(commit => commit === null);
}

module.exports = generateStatuses;
module.exports._parseCommitData = parseCommitData;
module.exports._makeStatusOptions = makeStatusOptions;
module.exports._STATUS = STATUS;
