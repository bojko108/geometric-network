let nodesIdIndex = 0;
let edgesIdIndex = 0;

export const getNodeId = () => {
  return ++nodesIdIndex;
};

export const getEdgeId = () => {
  return ++edgesIdIndex;
};

export const coordinatesAreEqual = (a, b) => {
  return a[0] === b[0] && a[1] === b[1];
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

// export const isOnSegment = (segment, point) => {
//   // The cross product of `point -> start` and `start -> end` should equal zero.

//   const dxc = point[0] - segment[0][0];
//   const dyc = point[1] - segment[0][1];
//   const dxl = segment[1][0] - segment[0][0];
//   const dyl = segment[1][1] - segment[0][1];

//   const cross = dxc * dyl - dyc * dxl;

//   if (cross === 0) {
//     if (Math.abs(dxl) >= Math.abs(dyl)) {
//       return dxl > 0 ? segment[0][0] <= point[0] && point[0] <= segment[1][0] : segment[1][0] <= point[0] && point[0] <= segment[0][0];
//     } else {
//       return dyl > 0 ? segment[0][1] <= point[1] && point[1] <= segment[1][1] : segment[1][1] <= point[1] && point[1] <= segment[0][1];
//     }
//   } else {
//     return false;
//   }
// }
