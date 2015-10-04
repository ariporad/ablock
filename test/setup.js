/* (c) 2015 Ari Porad. MIT License: ariporad.mit-license.org */
/* global expect:false, assert:false */
/* eslint-env mocha */
var chai = require('chai');

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

chai.should();
global.expect = chai.expect;
global.assert = chai.assert;

require('sinomocha')();
require('co-mocha');

global.request = require('supertest-promised');
