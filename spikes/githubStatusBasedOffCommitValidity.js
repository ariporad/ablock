/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */

const github = require('octonode');
const client = github.client(process.env.GITHUB_TOKEN);

const validate = require('./validate-commit-msg');

const repo = 'ariporad/Spoon-Knife';

function setStatus(repoName, sha, options) {
  const ghrepo = client.repo(repoName);
  console.log(`Setting status for ${repoName}#${sha} to ${JSON.stringify(options, null, 2)}`);
  return new Promise((good, bad) => {
    ghrepo.status(sha, options, (err, res) => {
      if (err) bad(err);
      else good(res);
    });
  });
}

function makeStatusOptions(state, desc) {
  return {
    state: state,
    target_url: 'http://ariporad.com',
    description: desc,
    context: 'testing/test1',
  };
}

// setStatus(repo, commitA, makeStatusOptions('failure', 'Everything\'s so broken!'))
// 	.then(() => setStatus(repo, commitB, makeStatusOptions('success', 'It\'s Working!')))


const ghpr = client.pr(repo, 2);

function processCommit({ sha, commit: { message }}) {
  const valid = validate(message);
  if (valid.ignored) return 'ignore';
  return valid.ok ? true : valid.error;
}

function processCommits(commits) {
  const commitsOk = commits.map(commit => ({ commit, ok: processCommit(commit) })).filter(commit => commit.ok !==
                                                                                                    'ignore');
  commitsOk.forEach(({commit, ok}) => {
    const statusOptions = ok === true ? makeStatusOptions('success', 'Valid commit message.') :
                          makeStatusOptions('failure', ok);
    setStatus(repo, commit.sha, statusOptions);
  });
  const allCommitsOK = commitsOk.reduce((ok, commit) => ok && commit.ok === true, true);
  const finalCommit = commits[commits.length - 1];
  const statusOptions = allCommitsOK ? makeStatusOptions('success', 'All commit messages valid.') :
                        makeStatusOptions('failure', 'One or more commit messages are invalid.');
  setStatus(repo, finalCommit.sha, statusOptions);
}

ghpr.commits((err, commits) => {
  if (err) throw err;
  processCommits(commits);
});
