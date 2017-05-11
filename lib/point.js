module.exports = {
  equals: equals,
  distance: distance,
  clockwise: clockwise,
  findNearest: findNearest,
}
function distance(pt1, pt2) {
  var dx = Math.abs(pt1[0] - pt2[0]);
  var dy = Math.abs(pt1[1] - pt2[1]);
  if (dx === 0) return dy;
  if (dy === 0) return dx;
  var theta = Math.atan(dy / dx);
  return dx / Math.cos(theta);
}
function equals(pt1, pt2) {
  return pt1[0] === pt2[0] && pt1[1] === pt2[1];
}
function findNearest(curpt, points, filter) {
  var sorted = points.filter(pt => curpt !== pt && filter(pt))
    .map(pt => [ pt, distance(pt, curpt), ])
    .sort((x, y) => x[1] - y[1])
  if (sorted.length > 0) return sorted[0][0]
  return null;
}
function clockwise(points) {
  var dir = (pt1, pt2) => {
    var dx = pt2[0] - pt1[0];
    var dy = pt2[1] - pt1[1];
    if (dx > 0 && dy === 0) return 'l';
    else if (dx < 0 && dy === 0) return 'r';
    else if (dx === 0 && dy < 0) return 't';
    else if (dx === 0 && dy > 0) return 'b';
    else return null;
  };
  var fp = points[0];
  var np = points[1];
  var lp = points[points.length - 1];
  var f = dir(fp, np);
  var l = dir(lp, fp);
  return (f === 't' && l === 'r') ||
         (f === 'r' && l === 'b') ||
         (f === 'b' && l === 'l') ||
         (f === 'l' && l === 't');
}
