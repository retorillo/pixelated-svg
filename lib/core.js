const fs = require('fs');
const pointutil = require('./point.js');
const formatutil = require('./format.js');
const colorutil = require('./color.js');

module.exports = {
  svgFromRgbaBuffer: svgFromRgbaBuffer,
  svgPathesFromRgbaBuffer: svgPathesFromRgbaBuffer,
  colorsFromRgbaBuffer: colorsFromRgbaBuffer,
  binaryFromRgbaBuffer: binaryFromRgbaBuffer,
  polygonsFromBinary: polygonsFromBinary,
  contourPointsFromBinaries: contourPointsFromBinaries,
}
function normalizeOption(option) {
  if (!option) option = {};
  if (!option.scale) option.scale = 1;
  return option;
}
function svgFromRgbaBuffer(buffer, width, height, option) {
  option = normalizeOption(option);
  var lines = [];
  var pathes = svgPathesFromRgbaBuffer(buffer, width, height, option);
  lines.push('<?xml version="1.0"?>');
  lines.push(formatutil.element('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.1',
    width: width * option.scale,
    height: height * option.scale,
  }));
  lines.push.apply(lines, pathes.map(path => formatutil.element('path', path, true)));
  lines.push('</svg>');
  return lines.join('');
}
function svgPathesFromRgbaBuffer(buffer, width, height, option){
  option = normalizeOption(option);
  var pathes = [];
  var colors = colorsFromRgbaBuffer(buffer, width, height, option);
  if (option.includeColors)
    colors = colorutil.select(colors, option.includeColors);
  if (option.excludeColors)
    colors = colorutil.select(colors, option.excludeColors, true);
  for (c of colors) {
    var bin = binaryFromRgbaBuffer(buffer, width, height, c);
    var polygons = polygonsFromBinary(bin, width, height);
    var dlist = [];
    var clockwise = true;
    for (var p of polygons) {
      clockwise &= pointutil.clockwise(p);
      var dpart = p.map(pt => pt.slice(0, 2).map(nr => formatutil.number(nr, option.scale)).join(' ') )
      dlist.push(dpart.join(' L '));
    }
    pathes.push({
      d: `M ${dlist.join(' Z M ')} Z`,
      fill: formatutil.rgb(c),
      'fill-opacity': c[3] < 255 ? (c[3] / 255).toFixed(2) : '',
      'fill-rule': !clockwise ? 'evenodd' : '',
    });
  }
  return pathes;
}
function colorsFromRgbaBuffer(buffer, width, height) {
  var colors = []
  var imax = 4 * width * height;
  for (var i = 0; i < imax; i += 4) {
    if (buffer[i+3] === 0) continue;
    if (colors.findIndex(c => c[0] === buffer[i+0] && c[1] === buffer[i+1]
        && c[2] === buffer[i+2] && c[3] === buffer[i+3]) != -1)
      continue;
    colors.push([buffer[i+0], buffer[i+1], buffer[i+2], buffer[i+3]]);
  }
  return colors;
}
function binaryFromRgbaBuffer(x, width, height, pickColor) {
  var y = new Buffer(width * height);
  var ix = 0, iy = 0, ixmax = width * height * 4;
  for (var ix = 0; ix < ixmax; ix += 4, iy++)
    y[iy] = pickColor[0] == x[ix+0] &&
      pickColor[1] == x[ix+1] &&
      pickColor[2] == x[ix+2] &&
      pickColor[3] == x[ix+3];
  return y;
}
function polygonsFromBinary(bin, width, height, option) {
  var polygonlist = [];
  var polygon = null;
	var direction;
  var cps = contourPointsFromBinaries(bin, width, height);
  while (cps.length > 0) {
    if (!polygon) {
      var fp = cps.splice(0, 1)[0];
      polygon = [ fp ];
      cps.push(fp);
			direction = null;
		}
    var firstv = polygon[0][2];
    var last = polygon[polygon.length - 1];
    var x = last[0];
    var y = last[1];
    var voffset = width * y;
		var inrange = x < width && y < height;
    var v = bin[voffset + x];
    var l = x - 1 >= 0 ? bin[voffset + x - 1] : 0;
    var t = y - 1 >= 0 ? bin[voffset - width + x] : 0;
		var lt = x - 1 >= 0 && y - 1 >= 0 ? bin[voffset - width + x - 1] : 0;
		var finder;
    var np;
		var nextdirection;
    switch (direction) {
      case 'l':
        if (lt)
          nextdirection = v ? 't' : 'b';
        else
          nextdirection = l ? 'b' : 't';
        break;
      case 't':
        if (lt)
          nextdirection = v ? 'l' : 'r';
        else
          nextdirection = t ? 'l' : 'r';
        break;
      case 'r':
        if (lt)
          nextdirection = v ? 'b' : 't';
        else
          nextdirection = t ? 't' : 'b';
        break;
      case 'b':
        if (lt)
          nextdirection = v ? 'r' : 'l';
        else
          nextdirection = l ? 'l' : 'r';
        break;
      default:
        if (firstv)
          nextdirection = v && !t ? 'r' : 't';
        else
          nextdirection = !v && t ? 'r' : 't';
        break;
    }
		switch (nextdirection) {
			case 't': finder = p => p[2] === firstv && p[0] === x && p[1] < y; break;
			case 'b': finder = p => p[2] === firstv && p[0] === x && p[1] > y; break;
			case 'r': finder = p => p[2] === firstv && p[0] > x && p[1] === y; break;
			case 'l': finder = p => p[2] === firstv && p[0] < x && p[1] === y; break;
		}
    np = pointutil.findNearest(last, cps, finder);
    if (!np) {
			cps.splice(cps.indexOf(polygon[0]), 1);
      cps.push.apply(cps, polygon.slice(1));
			polygon = null;
			continue;
		}
		direction = nextdirection;
    var i = cps.indexOf(np);
    cps.splice(i, 1);
    if (np === polygon[0]) {
      polygon = polygon.map(pt => pt.splice(0, 2));
			polygonlist.push(firstv ? polygon : polygon.reverse());
      polygon = null;
    }
    else
      polygon.push(np);
  }
  // TODO: connect polygons if required (optional)
  return polygonlist;
}
function contourPointsFromBinaries(bin, width, height) {
  var points = [];
  var voffset = 0, index = 0;
  for (var y = 0; y < height; y++, voffset += width)
    for (var x = 0; x < width; x++, index++) {
      var v = bin[index];
      var l = x - 1 >= 0 ? bin[voffset + x - 1] : 0;
      var r = x + 1 < width ? bin[voffset + x + 1] : 0;
      var t = y - 1 >= 0 ? bin[voffset - width + x] : 0;
      var b = y + 1 < height ? bin[voffset + width + x] : 0;
      if (!v) { l = !l; r = !r; t = !t; b = !b; }
      if (!l && !t) {
        points.push([x, y, v]);
				if (!v)
					points.push([x, y, 1]);
			}
      if (!r && !t) {
        points.push([x + 1, y, v]);
				if (!v)
					points.push([x + 1, y, 1]);
			}
      if (!r && !b) {
        points.push([x + 1, y + 1, v]);
				if (!v)
					points.push([x + 1, y + 1, 1]);
			}
      if (!l && !b) {
        points.push([x, y + 1, v]);
				if (!v)
					points.push([x, y + 1, 1]);
			}
    }
  return points;
}
