const BASE16_COLOR_LIST = [
  // from base16-default-dark.css
  [ 24,  24,  24], //  0
  [ 40,  40,  40], //  1
  [ 56,  56,  56], //  2
  [ 88,  88,  88], //  3
  [184, 184, 184], //  4
  [216, 216, 216], //  5
  [232, 232, 232], //  6
  [248, 248, 248], //  7
  [171,  70,  66], //  8 Red
  [220, 150,  86], //  9 Orange
  [247, 202, 136], // 10 Yellow
  [161, 181, 108], // 11 Green
  [134, 193, 185], // 12 Teal
  [124, 175, 194], // 13 Cyan
  [186, 139, 175], // 14 Purple
  [161, 105,  70], // 15 Brown
];
module.exports = {
  BASE16_COLOR_LIST: BASE16_COLOR_LIST,
  BASE16_COLOR: BASE16_COLOR,
  RGBA_BUFFER: RGBA_BUFFER,
  RGBA_TO_HEX: RGBA_TO_HEX,
  RGBA_TO_STR: RGBA_TO_STR,
  DEFAULT: DEFAULT,
}
function DEFAULT(val, dval) {
  return (!val || val === '') ? dval : val;
}
function RGBA_TO_STR(rgba) {
  return 'rgba(' + rgba.slice(0, 4).join(', ') + ')';
}
function RGBA_TO_HEX(rgba) {
  return '#' + rgba.slice(0, 3).map(c => ('00' + c.toString(16)).slice(-2)).join('');
}
function BASE16_COLOR(name, alpha) {
  var index;
  if (typeof(name) == 'number')
    index = name;
  else {
    index = ['red', 'orange', 'yellow', 'teal',
      'cyan', 'purple', 'brown'].indexOf(name.toLowerCase());
    if (index == -1)
      throw new Error(`Unkown color: ${name}`);
    index += 8;
  }
  var rgba = BASE16_COLOR_LIST[index].slice();
  rgba.push(typeof(alpha) === 'number' ? alpha : 255);
  return rgba;
}
function RGBA_BUFFER(rgbalist) {
  var buf = new Buffer(rgbalist.length * 4);
  var offset = 0;
  for (var rgba of rgbalist)
    rgba.slice(0, 4).forEach(b => buf.writeUInt8(b, offset++));
  return buf;
}
