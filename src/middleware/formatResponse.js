/* (c) 2015 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
function isErrorStatusCode(status) {
  return [
    status !== 404,
    status >= 300 || status < 200,
  ].reduce((ok, isError) => ok && isError, true);
}

function makeResponseFormatter() {
  return function* formatResponse(next) {
    let isError = false;
    try {
      yield next;
    } catch (err) {
      isError = true;
      this.body = err;
    }
    if (this.body instanceof Error || isError) {
      this.body = { ok: false, error: (this.body instanceof Error ? this.body.message : this.body) };
      if (!isErrorStatusCode(this.status)) this.status = 500;
    } else {
      /* istanbul ignore next: just a default */
      this.body = this.body || {};
      this.body = { ok: this.body.ok || true, payload: this.body.payload || this.body };
    }
  };
}

module.exports = makeResponseFormatter;
// Export for testing
module.exports._isErrorStatusCode = isErrorStatusCode;
