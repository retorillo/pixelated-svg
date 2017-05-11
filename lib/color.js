module.exports = {
  select: select,
  compileSelectors: compileSelectors,
}
function select(colors, selectors, inverse) {
  selectors = compileSelectors(selectors);
  return colors.filter(color => {
    var satisfied = true;
    for (var s of selectors) {
      satisfied = true;
      for (var i = 0; satisfied && i < 4; i++) {
        switch(s[i].operator) {
          case '==': satisfied &= color[i] == s[i].value; break;
          case '!=': satisfied &= color[i] != s[i].value; break;
          case '<' : satisfied &= color[i] <  s[i].value; break;
          case '<=': satisfied &= color[i] <= s[i].value; break;
          case '>=': satisfied &= color[i] >= s[i].value; break;
          case '>' : satisfied &= color[i] >  s[i].value; break;
          case '*' : break;
          default  : satisfied = false; break;
        }
      }
      if (satisfied) break;
    }
    return inverse ? !satisfied : satisfied;
  });
}
function compileSelectors(selectors) {
  var compiled = [];
  for (var selector of selectors) {
    var s = [];
    for (var i = 0; i < 4; i++) {
      if (typeof(selector[i]) === 'number') {
        s[i] = { operator: '==', value: selector[i] };
        continue;
      }
      if (selector[i] === '*') {
        s[i] = { operator: '*' };
        continue;
      }
      var m = /^(<|>|<=|>=|==|!=)\s*([0-9]+)$/.exec(selector[i]);
      if (!m)
        throw new Error(`Unsupported RGBA selector: ${selector[i]}`)
      s[i] = { operator: m[1], value: parseInt(m[2]) };
    }
    compiled.push(s);
  }
  return compiled;
}
