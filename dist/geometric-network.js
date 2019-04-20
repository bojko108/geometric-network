/** 
 * geometric-network - v1.1.0
 * description: Library for creating and managing geometric networks
 * author: bojko108 <bojko108@gmail.com>
 * 
 * github: https://github.com/bojko108/geometric-network
 */
    
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var quickselect = createCommonjsModule(function (module, exports) {
(function (global, factory) {
	module.exports = factory();
}(commonjsGlobal, (function () { function quickselect(arr, k, left, right, compare) {
    quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
}
function quickselectStep(arr, k, left, right, compare) {
    while (right > left) {
        if (right - left > 600) {
            var n = right - left + 1;
            var m = k - left + 1;
            var z = Math.log(n);
            var s = 0.5 * Math.exp(2 * z / 3);
            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            quickselectStep(arr, k, newLeft, newRight, compare);
        }
        var t = arr[k];
        var i = left;
        var j = right;
        swap(arr, left, k);
        if (compare(arr[right], t) > 0) swap(arr, left, right);
        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (compare(arr[i], t) < 0) i++;
            while (compare(arr[j], t) > 0) j--;
        }
        if (compare(arr[left], t) === 0) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }
        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}
function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}
function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
return quickselect;
})));
});

var rbush_1 = rbush;
var default_1 = rbush;
function rbush(maxEntries, format) {
  if (!(this instanceof rbush)) return new rbush(maxEntries, format);
  this._maxEntries = Math.max(4, maxEntries || 9);
  this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));
  if (format) {
    this._initFormat(format);
  }
  this.clear();
}
rbush.prototype = {
  all: function() {
    return this._all(this.data, []);
  },
  search: function(bbox) {
    var node = this.data,
      result = [],
      toBBox = this.toBBox;
    if (!intersects(bbox, node)) return result;
    var nodesToSearch = [],
      i,
      len,
      child,
      childBBox;
    while (node) {
      for (i = 0, len = node.children.length; i < len; i++) {
        child = node.children[i];
        childBBox = node.leaf ? toBBox(child) : child;
        if (childBBox.type === 'edge' && (bbox.minX - bbox.maxX === 0 && bbox.minY - bbox.maxY === 0)) {
          if (intersectsLine(bbox, childBBox)) {
            if (node.leaf) result.push(child);
            else if (contains(bbox, childBBox)) this._all(child, result);
            else nodesToSearch.push(child);
          }
        } else {
          if (intersects(bbox, childBBox)) {
            if (node.leaf) result.push(child);
            else if (contains(bbox, childBBox)) this._all(child, result);
            else nodesToSearch.push(child);
          }
        }
      }
      node = nodesToSearch.pop();
    }
    return result;
  },
  collides: function(bbox) {
    var node = this.data,
      toBBox = this.toBBox;
    if (!intersects(bbox, node)) return false;
    var nodesToSearch = [],
      i,
      len,
      child,
      childBBox;
    while (node) {
      for (i = 0, len = node.children.length; i < len; i++) {
        child = node.children[i];
        childBBox = node.leaf ? toBBox(child) : child;
        if (childBBox.type === 'edge') {
          if (intersectsLine(bbox, childBBox)) {
            if (node.leaf || contains(bbox, childBBox)) return true;
            nodesToSearch.push(child);
          }
        } else {
          if (intersects(bbox, childBBox)) {
            if (node.leaf || contains(bbox, childBBox)) return true;
            nodesToSearch.push(child);
          }
        }
      }
      node = nodesToSearch.pop();
    }
    return false;
  },
  load: function(data) {
    if (!(data && data.length)) return this;
    if (data.length < this._minEntries) {
      for (var i = 0, len = data.length; i < len; i++) {
        this.insert(data[i]);
      }
      return this;
    }
    var node = this._build(data.slice(), 0, data.length - 1, 0);
    if (!this.data.children.length) {
      this.data = node;
    } else if (this.data.height === node.height) {
      this._splitRoot(this.data, node);
    } else {
      if (this.data.height < node.height) {
        var tmpNode = this.data;
        this.data = node;
        node = tmpNode;
      }
      this._insert(node, this.data.height - node.height - 1, true);
    }
    return this;
  },
  insert: function(item) {
    if (item) this._insert(item, this.data.height - 1);
    return this;
  },
  clear: function() {
    this.data = createNode([]);
    return this;
  },
  remove: function(item, equalsFn) {
    if (!item) return false;
    var node = this.data,
      bbox = this.toBBox(item),
      path = [],
      indexes = [],
      i,
      parent,
      index,
      goingUp;
    while (node || path.length) {
      if (!node) {
        node = path.pop();
        parent = path[path.length - 1];
        i = indexes.pop();
        goingUp = true;
      }
      if (node.leaf) {
        index = findItem(item, node.children, equalsFn);
        if (index !== -1) {
          node.children.splice(index, 1);
          path.push(node);
          this._condense(path);
          return true;
        }
      }
      if (!goingUp && !node.leaf && contains(node, bbox)) {
        path.push(node);
        indexes.push(i);
        i = 0;
        parent = node;
        node = node.children[0];
      } else if (parent) {
        i++;
        node = parent.children[i];
        goingUp = false;
      } else node = null;
    }
    return false;
  },
  toBBox: function(item) {
    return item;
  },
  compareMinX: compareNodeMinX,
  compareMinY: compareNodeMinY,
  toJSON: function() {
    return this.data;
  },
  fromJSON: function(data) {
    this.data = data;
    return this;
  },
  _all: function(node, result) {
    var nodesToSearch = [];
    while (node) {
      if (node.leaf) result.push.apply(result, node.children);
      else nodesToSearch.push.apply(nodesToSearch, node.children);
      node = nodesToSearch.pop();
    }
    return result;
  },
  _build: function(items, left, right, height) {
    var N = right - left + 1,
      M = this._maxEntries,
      node;
    if (N <= M) {
      node = createNode(items.slice(left, right + 1));
      calcBBox(node, this.toBBox);
      return node;
    }
    if (!height) {
      height = Math.ceil(Math.log(N) / Math.log(M));
      M = Math.ceil(N / Math.pow(M, height - 1));
    }
    node = createNode([]);
    node.leaf = false;
    node.height = height;
    var N2 = Math.ceil(N / M),
      N1 = N2 * Math.ceil(Math.sqrt(M)),
      i,
      j,
      right2,
      right3;
    multiSelect(items, left, right, N1, this.compareMinX);
    for (i = left; i <= right; i += N1) {
      right2 = Math.min(i + N1 - 1, right);
      multiSelect(items, i, right2, N2, this.compareMinY);
      for (j = i; j <= right2; j += N2) {
        right3 = Math.min(j + N2 - 1, right2);
        node.children.push(this._build(items, j, right3, height - 1));
      }
    }
    calcBBox(node, this.toBBox);
    return node;
  },
  _chooseSubtree: function(bbox, node, level, path) {
    var i, len, child, targetNode, area, enlargement, minArea, minEnlargement;
    while (true) {
      path.push(node);
      if (node.leaf || path.length - 1 === level) break;
      minArea = minEnlargement = Infinity;
      for (i = 0, len = node.children.length; i < len; i++) {
        child = node.children[i];
        area = bboxArea(child);
        enlargement = enlargedArea(bbox, child) - area;
        if (enlargement < minEnlargement) {
          minEnlargement = enlargement;
          minArea = area < minArea ? area : minArea;
          targetNode = child;
        } else if (enlargement === minEnlargement) {
          if (area < minArea) {
            minArea = area;
            targetNode = child;
          }
        }
      }
      node = targetNode || node.children[0];
    }
    return node;
  },
  _insert: function(item, level, isNode) {
    var toBBox = this.toBBox,
      bbox = isNode ? item : toBBox(item),
      insertPath = [];
    var node = this._chooseSubtree(bbox, this.data, level, insertPath);
    if (node.children.indexOf(item) > -1) return;
    node.children.push(item);
    extend(node, bbox);
    while (level >= 0) {
      if (insertPath[level].children.length > this._maxEntries) {
        this._split(insertPath, level);
        level--;
      } else break;
    }
    this._adjustParentBBoxes(bbox, insertPath, level);
  },
  _split: function(insertPath, level) {
    var node = insertPath[level],
      M = node.children.length,
      m = this._minEntries;
    this._chooseSplitAxis(node, m, M);
    var splitIndex = this._chooseSplitIndex(node, m, M);
    var newNode = createNode(node.children.splice(splitIndex, node.children.length - splitIndex));
    newNode.height = node.height;
    newNode.leaf = node.leaf;
    calcBBox(node, this.toBBox);
    calcBBox(newNode, this.toBBox);
    if (level) insertPath[level - 1].children.push(newNode);
    else this._splitRoot(node, newNode);
  },
  _splitRoot: function(node, newNode) {
    this.data = createNode([node, newNode]);
    this.data.height = node.height + 1;
    this.data.leaf = false;
    calcBBox(this.data, this.toBBox);
  },
  _chooseSplitIndex: function(node, m, M) {
    var i, bbox1, bbox2, overlap, area, minOverlap, minArea, index;
    minOverlap = minArea = Infinity;
    for (i = m; i <= M - m; i++) {
      bbox1 = distBBox(node, 0, i, this.toBBox);
      bbox2 = distBBox(node, i, M, this.toBBox);
      overlap = intersectionArea(bbox1, bbox2);
      area = bboxArea(bbox1) + bboxArea(bbox2);
      if (overlap < minOverlap) {
        minOverlap = overlap;
        index = i;
        minArea = area < minArea ? area : minArea;
      } else if (overlap === minOverlap) {
        if (area < minArea) {
          minArea = area;
          index = i;
        }
      }
    }
    return index;
  },
  _chooseSplitAxis: function(node, m, M) {
    var compareMinX = node.leaf ? this.compareMinX : compareNodeMinX,
      compareMinY = node.leaf ? this.compareMinY : compareNodeMinY,
      xMargin = this._allDistMargin(node, m, M, compareMinX),
      yMargin = this._allDistMargin(node, m, M, compareMinY);
    if (xMargin < yMargin) node.children.sort(compareMinX);
  },
  _allDistMargin: function(node, m, M, compare) {
    node.children.sort(compare);
    var toBBox = this.toBBox,
      leftBBox = distBBox(node, 0, m, toBBox),
      rightBBox = distBBox(node, M - m, M, toBBox),
      margin = bboxMargin(leftBBox) + bboxMargin(rightBBox),
      i,
      child;
    for (i = m; i < M - m; i++) {
      child = node.children[i];
      extend(leftBBox, node.leaf ? toBBox(child) : child);
      margin += bboxMargin(leftBBox);
    }
    for (i = M - m - 1; i >= m; i--) {
      child = node.children[i];
      extend(rightBBox, node.leaf ? toBBox(child) : child);
      margin += bboxMargin(rightBBox);
    }
    return margin;
  },
  _adjustParentBBoxes: function(bbox, path, level) {
    for (var i = level; i >= 0; i--) {
      extend(path[i], bbox);
    }
  },
  _condense: function(path) {
    for (var i = path.length - 1, siblings; i >= 0; i--) {
      if (path[i].children.length === 0) {
        if (i > 0) {
          siblings = path[i - 1].children;
          siblings.splice(siblings.indexOf(path[i]), 1);
        } else this.clear();
      } else calcBBox(path[i], this.toBBox);
    }
  },
  _initFormat: function(format) {
    var compareArr = ['return a', ' - b', ';'];
    this.compareMinX = new Function('a', 'b', compareArr.join(format[0]));
    this.compareMinY = new Function('a', 'b', compareArr.join(format[1]));
    this.toBBox = new Function(
      'a',
      'return {minX: a' + format[0] + ', minY: a' + format[1] + ', maxX: a' + format[2] + ', maxY: a' + format[3] + '};'
    );
  }
};
function findItem(item, items, equalsFn) {
  if (!equalsFn) return items.indexOf(item);
  for (var i = 0; i < items.length; i++) {
    if (equalsFn(item, items[i])) return i;
  }
  return -1;
}
function calcBBox(node, toBBox) {
  distBBox(node, 0, node.children.length, toBBox, node);
}
function distBBox(node, k, p, toBBox, destNode) {
  if (!destNode) destNode = createNode(null);
  destNode.minX = Infinity;
  destNode.minY = Infinity;
  destNode.maxX = -Infinity;
  destNode.maxY = -Infinity;
  for (var i = k, child; i < p; i++) {
    child = node.children[i];
    extend(destNode, node.leaf ? toBBox(child) : child);
  }
  return destNode;
}
function extend(a, b) {
  a.minX = Math.min(a.minX, b.minX);
  a.minY = Math.min(a.minY, b.minY);
  a.maxX = Math.max(a.maxX, b.maxX);
  a.maxY = Math.max(a.maxY, b.maxY);
  return a;
}
function compareNodeMinX(a, b) {
  return a.minX - b.minX;
}
function compareNodeMinY(a, b) {
  return a.minY - b.minY;
}
function bboxArea(a) {
  return (a.maxX - a.minX) * (a.maxY - a.minY);
}
function bboxMargin(a) {
  return a.maxX - a.minX + (a.maxY - a.minY);
}
function enlargedArea(a, b) {
  return (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) * (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY));
}
function intersectionArea(a, b) {
  var minX = Math.max(a.minX, b.minX),
    minY = Math.max(a.minY, b.minY),
    maxX = Math.min(a.maxX, b.maxX),
    maxY = Math.min(a.maxY, b.maxY);
  return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
}
function contains(a, b) {
  return a.minX <= b.minX && a.minY <= b.minY && b.maxX <= a.maxX && b.maxY <= a.maxY;
}
function intersects(a, b) {
  return b.minX <= a.maxX && b.minY <= a.maxY && b.maxX >= a.minX && b.maxY >= a.minY;
}
function distance(p1, p2) {
  var dy = p2[0] - p1[0];
  var dx = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
}
function isOnSegment(segment, point) {
  var sqLength = distance(segment[0], segment[1]);
  var sqDistToStart = distance(segment[0], point);
  var sqDistToEnd = distance(segment[1], point);
  return Math.abs(sqLength - (sqDistToStart + sqDistToEnd)) < Number.EPSILON;
}
function intersectsLine(node, line) {
  for (var i = 0; i < line.coordinates.length - 1; i++) {
    if (isOnSegment([line.coordinates[i], line.coordinates[i + 1]], node.coordinates)) {
      return true;
    }
  }
  return false;
}
function createNode(children) {
  return {
    children: children,
    height: 1,
    leaf: true,
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity
  };
}
function multiSelect(arr, left, right, n, compare) {
  var stack = [left, right],
    mid;
  while (stack.length) {
    right = stack.pop();
    left = stack.pop();
    if (right - left <= n) continue;
    mid = left + Math.ceil((right - left) / n / 2) * n;
    quickselect(arr, mid, left, right, compare);
    stack.push(left, mid, mid, right);
  }
}
rbush_1.default = default_1;

let nodesIdIndex = 0;
let edgesIdIndex = 0;
const resetIndices = () => {
  nodesIdIndex = 0;
  edgesIdIndex = 0;
};
const getNodeId = () => {
  return ++nodesIdIndex;
};
const getEdgeId = () => {
  return ++edgesIdIndex;
};

const toFeature = element => {
  let geometry = {
    type: '',
    coordinates: []
  };
  if (element.type === 'edge') {
    geometry.type = 'LineString';
    for (let j = 0; j < element.coordinates.length; j++) {
      geometry.coordinates.push([...element.coordinates[j]]);
    }
  } else {
    geometry.type = 'Point';
    geometry.coordinates = [...element.coordinates];
  }
  const result = {
    type: 'Feature',
    id: element.id,
    geometry: geometry,
    properties: {
      fid: element.id,
      leaf: element.type === 'edge' ? element.leaf : false,
      terminator: element.type === 'node' ? element.terminator : false,
      orphan: element.type === 'node' ? element.orphan : false,
      adjacent: element.type === 'node' ? element.adjacent.join(';') : '',
      minX: element.minX,
      minY: element.minY,
      maxX: element.maxX,
      maxY: element.maxY
    }
  };
  return result;
};
const toGeoJSON = (name = 'Network', elements) => {
  let result = {
    type: 'FeatureCollection',
    name: name,
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features: []
  };
  for (let i = 0; i < elements.length; i++) {
    result.features.push(toFeature(elements[i]));
  }
  return result;
};

const coordinatesAreEqual = (a, b) => {
  return Math.abs(a[0] - b[0]) < Number.EPSILON && Math.abs(a[1] - b[1]) < Number.EPSILON;
};
const nodesAreEqual = (a, b) => {
  return Math.abs(a.x - b.x) < Number.EPSILON && Math.abs(a.y - b.y) < Number.EPSILON;
};
const squaredDistance = (p1, p2) => {
  const dy = p2[0] - p1[0];
  const dx = p2[1] - p1[1];
  return dx * dx + dy * dy;
};
const distance$1 = (p1, p2) => {
  const sqDist = squaredDistance(p1, p2);
  return Math.sqrt(sqDist);
};
const isOnSegment$1 = (segment, point) => {
  const sqLength = distance$1(segment[0], segment[1]);
  const sqDistToStart = distance$1(segment[0], point);
  const sqDistToEnd = distance$1(segment[1], point);
  return Math.abs(sqLength - (sqDistToStart + sqDistToEnd)) < Number.EPSILON;
};
const split = (lineCoordinates, point) => {
  if (coordinatesAreEqual(point, lineCoordinates[0])) {
    return;
  }
  if (coordinatesAreEqual(point, lineCoordinates[lineCoordinates.length - 1])) {
    return;
  }
  let intersects = false;
  let splitIndex;
  for (let i = 0; i < lineCoordinates.length - 1; i++) {
    if (isOnSegment$1([lineCoordinates[i], lineCoordinates[i + 1]], point)) {
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

class Node {
  constructor(coordinates, id) {
    this.id = id || getNodeId();
    this._adjacent = [];
    this.setCoordinates(coordinates);
  }
  get type() {
    return 'node';
  }
  get x() {
    return this.coordinates[0];
  }
  get y() {
    return this.coordinates[1];
  }
  get adjacent() {
    return this._adjacent;
  }
  get terminator() {
    return this.orphan === true || this._adjacent.length < 2;
  }
  get orphan() {
    return this._adjacent.length === 0;
  }
  addAdjacent(nodeOrId) {
    const id = nodeOrId instanceof Node ? nodeOrId.id : nodeOrId;
    if (this._adjacent.indexOf(id) < 0) {
      this._adjacent.push(id);
    }
  }
  removeAdjacent(nodeOrId) {
    const id = nodeOrId instanceof Node ? nodeOrId.id : nodeOrId;
    const index = this._adjacent.indexOf(id);
    if (index > -1) {
      this._adjacent.splice(index, 1);
    }
  }
  setCoordinates(coordinates) {
    this.coordinates = [...coordinates];
    this._calculateBounds();
  }
  _calculateBounds() {
    this.minX = this.coordinates[0];
    this.minY = this.coordinates[1];
    this.maxX = this.coordinates[0];
    this.maxY = this.coordinates[1];
  }
}

class Edge {
  constructor(coordinates, start, end, id) {
    this.id = id || getEdgeId();
    this.start = start;
    this.end = end;
    this.start.addAdjacent(this.end.id);
    this.end.addAdjacent(this.start.id);
    this.setCoordinates(coordinates);
  }
  get type() {
    return 'edge';
  }
  get leaf() {
    let leaf = this.start.adjacent.indexOf(this.end.id) === -1 && this.end.adjacent.indexOf(this.start.id) === -1;
    if (leaf === false) {
      leaf = this.start.terminator && this.end.terminator;
    }
    return leaf;
  }
  setStart(newStart) {
    this.end.removeAdjacent(this.start.id);
    this.start.removeAdjacent(this.end.id);
    this.start = newStart;
    this.start.addAdjacent(this.end.id);
    this.end.addAdjacent(this.start.id);
    this.coordinates[0] = this.start.coordinates;
    this._calculateBounds();
  }
  setEnd(newEnd) {
    this.start.removeAdjacent(this.end.id);
    this.end.removeAdjacent(this.start.id);
    this.end = newEnd;
    this.end.addAdjacent(this.start.id);
    this.start.addAdjacent(this.end.id);
    this.coordinates[this.vertexCount - 1] = this.end.coordinates;
    this._calculateBounds();
  }
  setCoordinates(coordinates) {
    this.coordinates = [...coordinates];
    this.vertexCount = this.coordinates.length;
    this._calculateBounds();
  }
  clone(resetId = true) {
    return new Edge(this.coordinates, this.start, this.end, resetId ? getEdgeId() : this.id);
  }
  _calculateBounds() {
    const xs = this.coordinates.map(c => c[0]);
    const ys = this.coordinates.map(c => c[1]);
    this.minX = Math.min(...xs);
    this.minY = Math.min(...ys);
    this.maxX = Math.max(...xs);
    this.maxY = Math.max(...ys);
  }
}

const ADD_EDGE = 'ADD_EDGE';
const REMOVE_EDGE = 'REMOVE_EDGE';
const UPDATE_EDGE = 'UPDATE_EDGE';
const ADD_NODE = 'ADD_NODE';
const REMOVE_NODE = 'REMOVE_NODE';
const UPDATE_NODE = 'UPDATE_NODE';
const CONNECT_EDGE = 'CONNECT_EDGE';
const DISCONNECT_EDGE = 'DISCONNECT_EDGE';
const SPLIT_EDGE = 'SPLIT_EDGE';


var Events = Object.freeze({
	ADD_EDGE: ADD_EDGE,
	REMOVE_EDGE: REMOVE_EDGE,
	UPDATE_EDGE: UPDATE_EDGE,
	ADD_NODE: ADD_NODE,
	REMOVE_NODE: REMOVE_NODE,
	UPDATE_NODE: UPDATE_NODE,
	CONNECT_EDGE: CONNECT_EDGE,
	DISCONNECT_EDGE: DISCONNECT_EDGE,
	SPLIT_EDGE: SPLIT_EDGE
});

class EventEmitter {
  constructor() {}
  emit(name) {
    let data = [].slice.call(arguments, 1),
      evtArr = ((this.e || (this.e = {}))[name] || []).slice(),
      i = 0,
      len = evtArr.length;
    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }
    return this;
  }
  on(name, callback, ctx) {
    let e = this.e || (this.e = {});
    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });
    return this;
  }
  once(name, callback, ctx) {
    let self = this,
      listener = function() {
        self.off(name, listener);
        callback.apply(ctx, arguments);
      };
    listener._ = callback;
    return this.on(name, listener, ctx);
  }
  off(name, callback) {
    let e = this.e || (this.e = {}),
      evts = e[name],
      liveEvents = [];
    if (evts && callback) {
      for (let i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback) liveEvents.push(evts[i]);
      }
    }
    if (liveEvents.length) e[name] = liveEvents;
    else delete e[name];
    return this;
  }
}

class Network {
  constructor(maxEntries = 9, edges = []) {
    resetIndices();
    this._elementsTree = new rbush_1(maxEntries);
    this.events = new EventEmitter();
    if (edges) {
      for (let i = 0; i < edges.length; i++) {
        this.addEdge(edges[i]);
      }
    }
  }
  addFromGeoJSON(json) {
    let edges = json.features.map(f => {
      return f.geometry.coordinates;
    });
    for (let i = 0; i < edges.length; i++) {
      this.addEdge(edges[i]);
    }
  }
  toGeoJSON(name = 'Network', elementType) {
    const elements = this.all(elementType);
    return toGeoJSON(name, elements);
  }
  all(elementType) {
    if (elementType) {
      return this._elementsTree.all().filter(element => element.type === elementType);
    } else {
      return this._elementsTree.all();
    }
  }
  getEdgeById(id) {
    return this.all('edge').filter(edge => edge.id === id)[0];
  }
  getEdgesById(ids) {
    return this.all('edge').filter(edge => ids.indexOf(edge.id) > -1);
  }
  findElementsAt(node, elementType) {
    return this._elementsTree.search(node, elementType);
  }
  findElementsIn(bbox, elementType) {
    return this._elementsTree.search(bbox, elementType);
  }
  findEdgesAt(coordinates) {
    const node = coordinates instanceof Node ? coordinates : new Node(coordinates, -1);
    return this.findElementsAt(node, 'edge').filter(e => e.type === 'edge');
  }
  findEdgesIn(bbox) {
    let searchBox = {};
    if (Array.isArray(bbox)) {
      if (bbox.length !== 4) {
        throw 'InvalidArgument: bbox must be defined as - [minX, minY, maxX, maxY]';
      }
      searchBox.minX = bbox[0];
      searchBox.minY = bbox[1];
      searchBox.maxX = bbox[2];
      searchBox.maxY = bbox[3];
    } else {
      searchBox = bbox;
    }
    return this.findElementsIn(searchBox, 'edge').filter(e => e.type === 'edge');
  }
  findNodeAt(coordinates) {
    return this.findNodesAt(coordinates)[0];
  }
  findNodesAt(coordinates) {
    const node = coordinates instanceof Node ? coordinates : new Node(coordinates, -1);
    return this.findElementsAt(node, 'node').filter(e => e.type === 'node');
  }
  findNodesIn(bbox) {
    let searchBox = {};
    if (Array.isArray(bbox)) {
      if (bbox.length !== 4) {
        throw 'InvalidArgument: bbox must be defined as - [minX, minY, maxX, maxY]';
      }
      searchBox.minX = bbox[0];
      searchBox.minY = bbox[1];
      searchBox.maxX = bbox[2];
      searchBox.maxY = bbox[3];
    } else {
      searchBox = bbox;
    }
    return this.findElementsIn(searchBox, 'node').filter(e => e.type === 'node');
  }
  connectEdge(edgeOrId) {
    const edge = edgeOrId instanceof Edge ? edgeOrId : this.getEdgeById(edgeOrId);
    if (!edge) {
      throw `InvalidArgument: edge with ID: ${edgeOrId} was not found in the network`;
    }
    edge.start.addAdjacent(edge.end);
    edge.end.addAdjacent(edge.start);
    let edges = this.findEdgesAt(edge.start).filter(e => e.id !== edge.id);
    for (let i = 0; i < edges.length; i++) {
      this._fillAdjacency(edge, edges[i]);
    }
    edges = this.findEdgesAt(edge.end).filter(e => e.id !== edge.id);
    for (let i = 0; i < edges.length; i++) {
      this._fillAdjacency(edge, edges[i]);
    }
    this.events.emit(CONNECT_EDGE, edge);
  }
  disconnectEdge(edgeOrId) {
    const edge = edgeOrId instanceof Edge ? edgeOrId : this.getEdgeById(edgeOrId);
    if (!edge) {
      throw `InvalidArgument: edge with ID: ${edgeOrId} was not found in the network`;
    }
    edge.start.removeAdjacent(edge.end);
    edge.end.removeAdjacent(edge.start);
    let removeStartNode = edge.start.orphan;
    let removeEndNode = edge.end.orphan;
    const result = {
      removeStartNode,
      removeEndNode
    };
    this.events.emit(DISCONNECT_EDGE, edge, result);
    return result;
  }
  addNode(coordinates) {
    if (coordinates.length !== 2) {
      throw `InvalidArgument: addNode() - coordinates must be in format [x, y]`;
    }
    const node = new Node(coordinates);
    this.events.emit(ADD_NODE, node);
    return node;
  }
  addEdge(coordinates) {
    if (coordinates.length < 2) {
      throw `InvalidArgument: addEdge() - coordinates must be in format [[x1, y1], [x2, y2], ...]`;
    }
    let startNode = this.findNodeAt(coordinates[0]),
      endNode = this.findNodeAt(coordinates[coordinates.length - 1]);
    if (!startNode) {
      startNode = this.addNode(coordinates[0]);
    }
    if (!endNode) {
      endNode = this.addNode(coordinates[coordinates.length - 1]);
    }
    const edge = new Edge(coordinates, startNode, endNode);
    this._elementsTree.insert(edge);
    this._elementsTree.insert(edge.start);
    this._elementsTree.insert(edge.end);
    let edges = this.findEdgesAt(edge.start).filter(e => e.id !== edge.id);
    for (let i = 0; i < edges.length; i++) {
      const edgeAtStart = edges[i];
      const splitResult = split(edgeAtStart.coordinates, edge.start.coordinates);
      if (splitResult) {
        const oldCoordinates = [...edgeAtStart.coordinates];
        this.disconnectEdge(edgeAtStart);
        this._elementsTree.remove(edgeAtStart);
        edgeAtStart.setEnd(edge.start);
        edgeAtStart.setCoordinates(splitResult.firstCoordinates);
        this._elementsTree.insert(edgeAtStart);
        this.connectEdge(edgeAtStart);
        this.events.emit(UPDATE_EDGE, oldCoordinates, edgeAtStart);
        const newEdge = this.addEdge(splitResult.secondCoordinates, edge.start, edgeAtStart.end);
        this.events.emit(SPLIT_EDGE, oldCoordinates, edgeAtStart, newEdge);
      }
    }
    edges = this.findEdgesAt(edge.end).filter(e => e.id !== edge.id);
    for (let i = 0; i < edges.length; i++) {
      const edgeAtEnd = edges[i];
      const splitResult = split(edgeAtEnd.coordinates, edge.end.coordinates);
      if (splitResult) {
        const oldCoordinates = [...edgeAtEnd.coordinates];
        this.disconnectEdge(edgeAtEnd);
        this._elementsTree.remove(edgeAtEnd);
        edgeAtEnd.setEnd(edge.end);
        edgeAtEnd.setCoordinates(splitResult.firstCoordinates);
        this._elementsTree.insert(edgeAtEnd);
        this.connectEdge(edgeAtEnd);
        this.events.emit(UPDATE_EDGE, oldCoordinates, edgeAtEnd);
        const newEdge = this.addEdge(splitResult.secondCoordinates, edge.end, edgeAtEnd.end);
        this.events.emit(SPLIT_EDGE, oldCoordinates, edgeAtEnd, newEdge);
      }
    }
    this.events.emit(ADD_EDGE, edge);
    return edge;
  }
  removeEdgeById(id) {
    const edge = this.getEdgeById(id);
    if (!edge) {
      throw `InvalidArgument: edge with ID: ${id} was not found in the network`;
    }
    return this.removeEdge(edge);
  }
  removeEdge(edge) {
    if (this._elementsTree.remove(edge, this._equalityFunction)) {
      const { removeStartNode, removeEndNode } = this.disconnectEdge(edge);
      if (removeStartNode) {
        this._elementsTree.remove(edge.start);
      }
      if (removeEndNode) {
        this._elementsTree.remove(edge.end);
      }
      this.events.emit(REMOVE_EDGE, edge);
      return true;
    }
    return false;
  }
  removeOrphanNodes() {}
  updateEdge(id, coordinates, startNode, endNode) {
    const oldEdge = this.getEdgeById(id);
    if (!oldEdge) {
      throw `InvalidArgument: edge with ID: ${id} was not found in the network`;
    }
    let edgeStartNode = startNode || this.findNodesAt(coordinates[0])[0],
      edgeEndNode = endNode || this.findNodesAt(coordinates[coordinates.length - 1])[0];
    if (!edgeStartNode) {
      edgeStartNode = oldEdge.start.clone();
      edgeStartNode.setCoordinates(coordinates[0]);
    }
    if (!edgeEndNode) {
      edgeEndNode = oldEdge.end.clone();
      edgeEndNode.setCoordinates(coordinates[coordinates.length - 1]);
    }
    const updEdge = oldEdge.clone();
    this._elementsTree.remove(oldEdge);
    updEdge.setCoordinates(coordinates, edgeStartNode, edgeEndNode);
    this._elementsTree.insert(updEdge);
    this._processEdge(updEdge, oldEdge);
    this.events.emit(UPDATE_EDGE, oldEdge, updEdge);
    return updEdge;
  }
  _equalityFunction(a, b) {
    return a.id === b.id && a.type === b.type;
  }
  _fillAdjacency(edge, other) {
    if (edge.start === other.start) {
      edge.start.addAdjacent(other.end);
      other.start.addAdjacent(edge.end);
    }
    if (edge.end === other.start) {
      edge.end.addAdjacent(other.end);
      other.start.addAdjacent(edge.start);
    }
    if (edge.start === other.end) {
      edge.start.addAdjacent(other.start);
      other.end.addAdjacent(edge.end);
    }
    if (edge.end === other.end) {
      edge.end.addAdjacent(other.start);
      other.end.addAdjacent(edge.start);
    }
  }
  _clearAdjacency(edge, other) {
    if (edge.start === other.start) {
      edge.start.removeAdjacent(other.end);
    }
    if (edge.end === other.start) {
      edge.end.removeAdjacent(other.end);
    }
    if (edge.start === other.end) {
      edge.start.removeAdjacent(other.start);
    }
    if (edge.end === other.end) {
      edge.end.removeAdjacent(other.start);
    }
  }
  _tryToSplitEdge(edge, splitPoint) {
    const splitResult = split(edge.coordinates, splitPoint);
    return splitResult;
  }
  _processEdge(edge, oldEdge) {
    const edgesOnStart = this.findEdgesAt(edge.start).filter(e => e.id !== edge.id);
    edgesOnStart.map(edgeOnStart => {
      const splitResult = this._tryToSplitEdge(edgeOnStart, edge.start.coordinates);
      if (splitResult) {
        this.disconnectEdge(edgeOnStart);
        let splitNode = this.findNodeAt(splitResult.secondCoordinates[0]);
        if (!splitNode) {
          splitNode = this.addNode(splitResult.secondCoordinates[0]);
          this._elementsTree.insert(splitNode);
        }
        const updEdge = edgeOnStart.clone();
        this._elementsTree.remove(edgeOnStart);
        updEdge.setCoordinates(splitResult.firstCoordinates, edgeOnStart.start, splitNode);
        this._elementsTree.insert(updEdge);
        this.connectEdge(updEdge);
        this.events.emit(UPDATE_EDGE, edgeOnStart, updEdge);
        const newEdge = this.addEdge(splitResult.secondCoordinates, splitNode, edgeOnStart.start);
        this.events.emit(SPLIT_EDGE, edgeOnStart, newEdge);
      }
    });
    const edgesOnEnd = this.findEdgesAt(edge.end).filter(e => e.id !== edge.id);
    edgesOnEnd.map(edgeOnEnd => {
      const splitResult = this._tryToSplitEdge(edgeOnEnd, edge.end.coordinates);
      if (splitResult) {
        this.disconnectEdge(edgeOnEnd);
        let splitNode = this.findNodeAt(splitResult.secondCoordinates[0]);
        if (!splitNode) {
          splitNode = this.addNode(splitResult.secondCoordinates[0]);
          this._elementsTree.insert(splitNode);
        }
        const updEdge = edgeOnEnd.clone();
        this._elementsTree.remove(edgeOnEnd);
        updEdge.setCoordinates(splitResult.firstCoordinates, edgeOnEnd.start, splitNode);
        this._elementsTree.insert(updEdge);
        this.connectEdge(updEdge);
        edgeOnEnd.end.removeAdjacent(updEdge.start);
        updEdge.end.addAdjacent(edgeOnEnd.end);
        this.events.emit(UPDATE_EDGE, edgeOnEnd, updEdge);
        const newEdge = this.addEdge(splitResult.secondCoordinates, splitNode, edgeOnEnd.end);
        this.events.emit(SPLIT_EDGE, edgeOnEnd, newEdge);
      }
    });
    this.connectEdge(edge);
    if (oldEdge) {
      const oldEdgeEdgesOnStart = this.findEdgesAt(oldEdge.start).filter(e => e.id !== oldEdge.id);
      oldEdgeEdgesOnStart.map(oldEdgeEdgeOnStart => {
        if (nodesAreEqual(oldEdgeEdgeOnStart.start, oldEdge.start)) {
          if (nodesAreEqual(oldEdgeEdgeOnStart.start, edge.start) === false) {
            let coordinates = oldEdgeEdgeOnStart.coordinates;
            coordinates[0] = edge.start.coordinates;
            this.updateEdge(oldEdgeEdgeOnStart.id, coordinates, edge.start, oldEdgeEdgeOnStart.end);
          }
        }
        if (nodesAreEqual(oldEdgeEdgeOnStart.end, oldEdge.start)) {
          if (nodesAreEqual(oldEdgeEdgeOnStart.end, edge.start) === false) {
            let coordinates = oldEdgeEdgeOnStart.coordinates;
            coordinates[oldEdgeEdgeOnStart.vertexCount - 1] = edge.start.coordinates;
            this.updateEdge(oldEdgeEdgeOnStart.id, coordinates, oldEdgeEdgeOnStart.start, edge.start);
          }
        }
      });
      const oldEdgeEdgesOnEnd = this.findEdgesAt(oldEdge.end).filter(e => e.id !== oldEdge.id);
      oldEdgeEdgesOnEnd.map(oldEdgeEdgeOnEnd => {
        if (nodesAreEqual(oldEdgeEdgeOnEnd.start, oldEdge.end)) {
          if (nodesAreEqual(oldEdgeEdgeOnEnd.start, edge.end) === false) {
            let coordinates = oldEdgeEdgeOnEnd.coordinates;
            coordinates[0] = edge.end.coordinates;
            this.updateEdge(oldEdgeEdgeOnEnd.id, coordinates, edge.end, oldEdgeEdgeOnEnd.end);
          }
        }
        if (nodesAreEqual(oldEdgeEdgeOnEnd.end, oldEdge.end)) {
          if (nodesAreEqual(oldEdgeEdgeOnEnd.end, edge.end) === false) {
            let coordinates = oldEdgeEdgeOnEnd.coordinates;
            coordinates[oldEdgeEdgeOnEnd.vertexCount - 1] = edge.end.coordinates;
            this.updateEdge(oldEdgeEdgeOnEnd.id, coordinates, oldEdgeEdgeOnEnd.start, edge.end);
          }
        }
      });
    }
  }
}

exports.events = Events;
exports.Network = Network;
