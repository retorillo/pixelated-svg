module.exports = {
  attribute: attribute,
  number: number,
  rgb: rgb,
  element: element,
};
function number(nr, scale) {
  return Math.round((nr * (arguments.length <= 1 ? 1 : scale) * 100) / 100).toString();
}
function rgb(rgb) {
  return '#' + rgb.slice(0, 3).map(c => ('0' + c.toString(16)).slice(-2)).join('')
}
function attribute(val) {
  var str = typeof(val) === 'number' ? number(val) : val;
  return str.replace(/"/g, '&quote;');
}
function element(name, attr, selfclose) {
  var astr = Object.keys(attr)
    .map(key => { return { key: key, attr: attribute(attr[key]) } })
    .filter(i => i.attr.length > 0)
    .map(i => `${i.key}="${i.attr}"`).join(' ');
  return `<${name} ${astr}${ selfclose ? ' />' : '>' }`;
}
