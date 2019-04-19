export const coordinatesAreEqual = (a, b) => {
  return Math.abs(a[0] - b[0]) < Number.EPSILON && Math.abs(a[1] - b[1]) < Number.EPSILON;
  // return a[0] === b[0] && a[1] === b[1];
};

export const nodesAreEqual = (a, b) => {
  return Math.abs(a.x - b.x) < Number.EPSILON && Math.abs(a.y - b.y) < Number.EPSILON;
  // return a.x === b.x && a.y === b.y;
};

export const squaredDistance = (p1, p2) => {
  const dy = p2[0] - p1[0];
  const dx = p2[1] - p1[1];
  return dx * dx + dy * dy;
};

export const distance = (p1, p2) => {
  const sqDist = squaredDistance(p1, p2);
  return Math.sqrt(sqDist);
};

export const isOnSegment = (segment, point) => {
  const sqLength = distance(segment[0], segment[1]);
  const sqDistToStart = distance(segment[0], point);
  const sqDistToEnd = distance(segment[1], point);
  const d = sqDistToStart + sqDistToEnd;
  return Math.abs(sqLength - (sqDistToStart + sqDistToEnd)) < Number.EPSILON;
};

export const split = (lineCoordinates, point) => {
  if (coordinatesAreEqual(point, lineCoordinates[0])) {
    return;
  }
  if (coordinatesAreEqual(point, lineCoordinates[lineCoordinates.length - 1])) {
    return;
  }

  let intersects = false;
  let splitIndex;

  for (let i = 0; i < lineCoordinates.length - 1; i++) {
    if (isOnSegment([lineCoordinates[i], lineCoordinates[i + 1]], point)) {
      splitIndex = i + 1;
      intersects = true;
      break;
    }
  }

  if (intersects) {
    let firstCoordinates = lineCoordinates.slice(0, splitIndex);
    firstCoordinates.push(point);
    let secondCoordinates = [];
    if (coordinatesAreEqual(point, lineCoordinates[splitIndex]) === false) {
      secondCoordinates.push(point);
    }
    secondCoordinates.push(...lineCoordinates.slice(splitIndex));

    return { splitIndex: splitIndex, firstCoordinates, secondCoordinates };
  }
};
