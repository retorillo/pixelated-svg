'use strict';
const should = require('should');
const core = require('../lib/core.js');
const UTIL = require('./util.js');

const R = 'R';
const C = 'C';
const T = 'T';
const PALETTE = {
  R: UTIL.BASE16_COLOR('RED', 255),
  C: UTIL.BASE16_COLOR('CYAN', 200),
  T: [0, 0, 0, 0],
};
const testcases = [
  {
    rgbalist: [R, T, R],
    colors: [R],
    width: 3,
    option: undefined,
    pathes: [ {
      d: "M 0 0 L 1 0 L 1 1 L 0 1 Z M 2 0 L 3 0 L 3 1 L 2 1 Z",
      fill: R,
      'fill-opacity': '',
      'fill-rule': '',
    } ],
  },
  {
    rgbalist: [R, C, R],
    width: 3,
    // NOTE: colorsFromRgbaBuffer does not accept option, so skip color test to prevent confusion.
    colors: undefined,
    option: { includeColors: [ PALETTE[R] ] },
    pathes: [ {
      d: "M 0 0 L 1 0 L 1 1 L 0 1 Z M 2 0 L 3 0 L 3 1 L 2 1 Z",
      fill: R,
      'fill-opacity': '',
      'fill-rule': '',
    } ],
  },
  {
    rgbalist: [R, C, R],
    width: 3,
    // NOTE: colorsFromRgbaBuffer does not accept option, so skip color test to prevent confusion.
    colors: undefined,
    option: { excludeColors: [ PALETTE[R] ] },
    pathes: [ {
      d: "M 1 0 L 2 0 L 2 1 L 1 1 Z",
      fill: C,
      'fill-opacity': "0.78",
      'fill-rule': '',
    } ],
  },
  {
    rgbalist: [
      R, R, R,
      R, C, R,
      R, T, R,
      R, R, R,
    ],
    colors: [R, C],
    width: 3,
    option: undefined,
    pathes: [
      {
        d: "M 0 0 L 3 0 L 3 4 L 0 4 Z M 1 3 L 2 3 L 2 1 L 1 1 Z",
        fill: R,
        "fill-opacity": "",
        "fill-rule": "evenodd",
      },
      {
        d: "M 1 1 L 2 1 L 2 2 L 1 2 Z",
        fill: C,
        "fill-opacity": "0.78",
        "fill-rule": "",
      }
    ]
  },
  {
    rgbalist: [
      R, R, R,
      R, C, R,
      R, T, R,
      R, R, R,
    ],
    colors: [R, C],
    width: 3,
    option: { scale: 2 },
    pathes: [
      {
        d: "M 0 0 L 6 0 L 6 8 L 0 8 Z M 2 6 L 4 6 L 4 2 L 2 2 Z",
        fill: R,
        "fill-opacity": "",
        "fill-rule": "evenodd",
      },
      {
        d: "M 2 2 L 4 2 L 4 4 L 2 4 Z",
        fill: C,
        "fill-opacity": "0.78",
        "fill-rule": "",
      }
    ]
  },
  {
    rgbalist: [
      T, T, C, C, C, C, C,
      T, C, R, C, C, R, C,
      C, R, R, C, R, R, C,
      T, T, C, C, C, C, C,
    ],
    colors: [C, R],
    width: 7,
    pathes: [
      {
        // TODO: Should large polygon be first?
        d: 'M 5 2 L 5 1 L 6 1 L 6 3 L 4 3 L 4 2 Z M 1 1 L 2 1 L 2 0 L 7 0 L 7 4 L 2 4 L 2 3 L 3 3 L 3 1 L 2 1 L 2 2 L 1 2 L 1 3 L 0 3 L 0 2 L 1 2 Z',
        fill: C,
        'fill-opacity': '0.78',
        'fill-rule': 'evenodd'
      },
      {
        d: 'M 2 2 L 2 1 L 3 1 L 3 3 L 1 3 L 1 2 Z M 5 2 L 5 1 L 6 1 L 6 3 L 4 3 L 4 2 Z',
        fill: R,
        'fill-opacity': '',
        'fill-rule': 'evenodd'
      }
    ]
  }
];

describe('RGBA', function() {
  for (let test of testcases) {
    test.pathes.forEach(path => path.fill = UTIL.RGBA_TO_HEX(PALETTE[path.fill]));
    let buffer = UTIL.RGBA_BUFFER(test.rgbalist.map(c => PALETTE[c]));
    let height = buffer.length / (4 * test.width);
    let desc = `[${test.rgbalist.join(',')}]`;
    if (test.option)
      desc += ` with option ${JSON.stringify(test.option)}`;
    describe(desc, function() {
      if (test.colors)
        it(`colors should be: ${test.colors.map(c => UTIL.RGBA_TO_STR(PALETTE[c])).join(', ')}`, function() {
          should(core.colorsFromRgbaBuffer(buffer, test.width, height))
            .eql(test.colors.map(c => PALETTE[c]))
        });
      let pathes = core.svgPathesFromRgbaBuffer(buffer, test.width, height, test.option);
      let dstr = pathes.map(p => [p.fill, UTIL.DEFAULT(p['fill-opacity'], '1'), p.d].join(' => ')).join(' / ');
      it(`pathes should be: ${dstr} `, function() {
        should(pathes).eql(test.pathes);
      });
    });
  }
});
