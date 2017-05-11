# pixelated-svg

[![Build Status](https://travis-ci.org/retorillo/pixelated-svg.svg?branch=master)](https://travis-ci.org/retorillo/pixelated-svg)
[![Coverage Status](https://coveralls.io/repos/github/retorillo/pixelated-svg/badge.svg?branch=master)](https://coveralls.io/github/retorillo/pixelated-svg?branch=master)
[![Dependency Status](https://gemnasium.com/badges/github.com/retorillo/pixelated-svg.svg)](https://gemnasium.com/github.com/retorillo/pixelated-svg)
[![NPM](https://img.shields.io/npm/v/pixelated-svg.svg)](https://www.npmjs.com/package/pixelated-svg)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Create SVG vector image from raster image with keeping pixeleated visual.

## Functions

### fromPng

Create SVG document from PNG file. Asynchronous function. Returns `Promise`.
See also [Options](#options).

```javascript
const svg = require('pixelated-svg');
svg.fromPng('foobar.png').then(svg => {
    console.log(svg);
    // <?xml version="1.0"?><!DOCTYPE svg ...
  });
```

**NOTE**: This package is targeting small raster images (like classic game
resources). If very huge and colorful images is specified, it might take a long
computing time or raise memory insufficient error.

## Options

Some options are prepared for `fromPng`.

### scale

By default, `scale` is `1`, so output SVG size equals with source raster image
size. For example, if source image has 8 pixel width, SVG width becomes 8.

Specify scaling factor by `scale` option to change SVG size.

```javascript
svg.fromPng('8x8.png', {
  scale: 100,
}).then(...); // becomes 800 x 800 SVG
```

### includeColors, excludeColors

Specify RGBA colors to include or exclude.

The following example picks only `RED` and `CYAN` to generate SVG.
All other colors to be treated as transparent and no path drawn.

```javascript
const RED  = [171,  70,  66, 255];
const CYAN = [124, 175, 194, 255];
svg.fromPng('colorful.png', {
  includeColors: [ RED, CYAN ],
}).then(...);
```

`excludeColors` works as reverse option of `includeColors`, so if change
`includeColors` of the above example to `excludeColors`, only `RED` and `CYAN`
colors goes transparent and all other colors are included.

If both `includeColors` and `excludeColors` are specified, only colors
satisfying both conditions are selected. Therefore, only `CYAN` will be selected
on the following example.

```javascript
svg.fromPng('colorful.png', {
  includeColors: [ RED, CYAN ],
  excludeColors: [ RED, ]
}).then(...);
```

Finally, special selector syntax are avaiable for both `includeColors` and
`execludeColors`:

  - Wildcard (`*`)
  - Equality (`==`)
  - Inequalities (`!=`, `<=`, `<`, `>=`, `>`)

For example,

```javascript
const selector = ['< 249', '>= 35', 156, '*'];
svg.fromPng('rgb.png', {
  includeColors: [ selector ],
}).then(...);
```

This can select colors that satisfy the next conditions:

  - R < 249
  - B >= 35
  - G == 156
  - A can be any value

## CLI

Command line interface will be available when globally installed. (`npm install -g pixelated-svg`)

```bash
pixelated-svg raster.png --scale 100 > out.svg
```

Command line options correspond with `fromPng` options:

- `--scale` or `-s`
  - Corresponds with `scale`.
- `--include`, `-i`, `--exclude`, `-e` (Experimental)
  - Correspond with `includeColors` and `excludeColors` options
  - Syntax must be "exact" JSON Array format. (eg. `-i "[[171, 70, 66, 255]]"`).
    - This inconvenient constraint will be change later.

## License

MIT License

(C) 2017 Retorillo
