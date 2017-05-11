const PNG = require('pngjs').PNG;
const fs = require('fs');
const core = require('./lib/core.js');

module.exports = {
  fromPng: fromPng,
}
function fromPng(file, option) {
  return new Promise((resolve, reject) => {
    var png;
    fs.createReadStream(file)
      .pipe(png = new PNG({ filterType: 4 }))
      .on('error', reject)
      .on('parsed', () => {
        resolve(core.svgFromRgbaBuffer(png.data, png.width, png.height, option));
      });
  });
}
