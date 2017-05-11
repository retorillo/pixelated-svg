'use strict';
const should = require('should');
const local = require('../');
const core = require('../lib/core.js');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const UTIL = require('./util.js');
const R = 'R';
const C = 'C';
const T = 'T';
const PALETTE = {
  R: UTIL.BASE16_COLOR('RED', 255),
  C: UTIL.BASE16_COLOR('CYAN', 200),
  T: [0, 0, 0, 0],
};
const testsources = [
  {
    rgbalist: [
      C, R, T,
      R, C, R,
      C, R, T,
    ],
    width: 3,
  },
];
before(function () {
  return new Promise((resolve, reject) => {
    fs.stat('tmp', (err, stats) => {
      console.log(JSON.stringify(err));
      if (err && err.code === 'ENOENT')
        fs.mkdir('tmp', () => {
          resolve();
        });
      else if (!stats.isDirectory())
        reject('ENOTDIR');
      else if (err)
        reject(err);
      else
        resolve();
    });
  });
});
after(function () {
  return new Promise((resolve, reject) => {
    fs.rmdir('tmp', resolve);
  });
});
describe('fromPNG', function() {
  for (let test of testsources) {
    let fname = 'tmp/' + test.rgbalist.join('') + '.png';
    after(function() {
      return new Promise((resolve, reject) => {
        fs.unlink(fname, resolve);
      });
    });
    it(fname, function(){
      return new Promise((resolve, reject) => {
        if (!test.height)
          test.height = test.rgbalist.length / test.width;
        var buffer = UTIL.RGBA_BUFFER(test.rgbalist.map(c => PALETTE[c]));
        var png = new PNG({ filterType: 4 });
        png.data = buffer;
        png.width = test.width;
        png.height = test.height;
        png.pack().pipe(fs.createWriteStream(fname)).on('finish', () => {
          local.fromPng(fname).then((svg) => { resolve(svg); });
        });
      }).then(svg => {
        should(svg).match(/^<\?xml/);
        should(svg).match(/<\/svg>$/);
      });
    });
  }
});

