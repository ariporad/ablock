/* (c) 2015 Ari Porad. MIT License: ariporad.mit-license.org */
module.exports = function makeResponseFormatter() {
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
    } else {
      this.body = { ok: true, payload: this.body };
    }
  };
};
