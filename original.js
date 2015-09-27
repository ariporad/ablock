/* (c) 2015 Ari Porad (@ariporad) <ari@ariporad.com>. MIT Licensed */

var github = require('octonode');
const client = github.client(process.env.GITHUB_TOKEN);

var validate = require('./validate-commit-msg');

const repo = 'ariporad/Spoon-Knife';
const commitA = 'ff0b5b590e9145a382085a77caba3bbf3fd752c7';
const commitB = 'dd914c5dc8faa668205943b0c9fe86d65a80f301';

function setStatus(repo, sha, options) {
  const ghrepo = client.repo(repo);
  console.log(`Setting status for ${repo}#${sha} to ${JSON.stringify(options, null, 2)}`);
  return new Promise((good, bad) => {
    ghrepo.status(sha, options, (err, res) => {
      if (err) return bad(err);
      else return good(res);
    });
  });
}

function makeStatusOptions(state, desc) {
  return {
    state: state,
    target_url: "http://ariporad.com",
    description: desc,
    context: 'testing/test1'
  };
}

function sleep(time) {
  return new Promise((good, bad) => setTimeout(good, time));
}

// setStatus(repo, commitA, makeStatusOptions('failure', 'Everything\'s so broken!'))
// 	.then(() => setStatus(repo, commitB, makeStatusOptions('success', 'It\'s Working!')))


var ghpr = client.pr(repo, 2);

function processCommits(commits) {
  const commitsOk = commits.map(commit => ({ commit, ok: processCommit(commit) })).filter(commit => commit.ok !== 'ignore');
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

function processCommit({ sha, commit: { message }}) {
  var valid = validate(message);
  if (valid.ignored) return 'ignore';
  if (valid.ok) return true;
  else return valid.error;
}

ghpr.commits((err, commits) => {
  if (err) throw err;
  processCommits(commits);
});
