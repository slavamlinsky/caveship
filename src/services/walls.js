export function makePolygonString(points, wallHeight, start) {
  let result = "";
  let allHeight = (points.length - 1) * wallHeight;
  result += start + "," + allHeight + " ";
  result += start + ",0 ";
  for (let i = 0; i < points.length; i++) {
    result += points[i] + "," + i * wallHeight + " ";
  }

  return result;
}
