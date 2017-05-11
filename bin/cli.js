#!/usr/bin/env node

const fromPng = require('../').fromPng;
const gnuopt = require('gnu-option');

function parseColors(val) {
  var parsed = JSON.parse(val);
  parsed.forEach(p => p.push.apply(p, new Array(4)));
  return parsed.map(p => p.slice(0, 4));
}
const optmap = {
  include: parseColors,
  i: '&include',
  exclude: parseColors,
  e: '&exclude',
  scale: 'number',
  s: '&scale',
}
var argv = gnuopt.parse(optmap);

if (argv.$.length == 0)
  throw new Error('Image file path is required.');
if (argv.$.length > 1)
  throw new Error('Multiple files cannot be specified.');

var option = {
  includeColors: argv.include,
  excludeColors: argv.exclude,
  scale: argv.scale,
};
fromPng(argv.$[0], option).then(svg => console.log(svg));
