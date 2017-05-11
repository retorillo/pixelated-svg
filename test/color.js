'use strict';
const should = require('should');
const color = require('../lib/color.js');
const UTIL = require('./util.js');

const RED    = UTIL.BASE16_COLOR('RED', 255);
const PURPLE = UTIL.BASE16_COLOR('PURPLE', 255);
const BLUE   = UTIL.BASE16_COLOR('CYAN', 255);

const testcases = [
  {
    input: [RED, PURPLE, BLUE],
    selectors: [[ RED[0], '*', '*', '*']],
    expect: [RED],
    expectInverse: [PURPLE, BLUE],
  },
  {
    input: [RED, PURPLE, BLUE],
    selectors: [['*', `<= ${ RED[1] }`, `> ${ RED[2] - 1 }`, '*'], [BLUE[0], BLUE[1], BLUE[2], '*']],
    expect: [RED, BLUE],
    expectInverse: [PURPLE],
  },
];

describe('RGBA Selector', function() {
  for (let test of testcases) {
    var desc = `${JSON.stringify(test.selectors)} <= ${test.input.map(c => UTIL.RGBA_TO_STR(c)).join(', ')} }`
    describe(desc, function() {
      it(`should be filtered to ${test.expect.map(c => UTIL.RGBA_TO_STR(c)).join(', ')}`, function() {
        should(color.select(test.input, test.selectors)).eql(test.expect);
      });
      it(`should be filtered to ${test.expectInverse.map(c => UTIL.RGBA_TO_STR(c)).join(', ')}`, function() {
        should(color.select(test.input, test.selectors, true)).eql(test.expectInverse);
      });
    });
  }
});
