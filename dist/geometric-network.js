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
        if (childBBox.type === 'line' && (bbox.minX - bbox.maxX === 0 && bbox.minY - bbox.maxY === 0)) {
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
        if (childBBox.type === 'line') {
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

const coordinatesAreEqual = (a, b) => {
  return a[0] === b[0] && a[1] === b[1];
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
  constructor(coordinates) {
    this.updateCoordinates(coordinates);
  }
  get type() {
    return 'point';
  }
  get x() {
    return this.coordinates[0];
  }
  get y() {
    return this.coordinates[1];
  }
  updateCoordinates(coordinates) {
    this.coordinates = [...coordinates];
    this._calculateBounds();
  }
  clone() {
    return new Node([...this.coordinates]);
  }
  _calculateBounds() {
    this.minX = this.coordinates[0];
    this.minY = this.coordinates[1];
    this.maxX = this.coordinates[0];
    this.maxY = this.coordinates[1];
  }
}

class Edge {
  constructor(id, coordinates) {
    this.id = id;
    this.updateCoordinates(coordinates);
  }
  get type() {
    return 'line';
  }
  updateCoordinates(coordinates) {
    this.coordinates = [...coordinates];
    this.vertexCount = this.coordinates.length;
    this.start = new Node(this.coordinates[0]);
    this.end = new Node(this.coordinates[this.vertexCount - 1]);
    this._calculateBounds();
  }
  clone() {
    return new Edge(this.id, this.coordinates);
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
const SPLIT_EDGE = 'SPLIT_EDGE';


var Events = Object.freeze({
	ADD_EDGE: ADD_EDGE,
	REMOVE_EDGE: REMOVE_EDGE,
	UPDATE_EDGE: UPDATE_EDGE,
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
  constructor(edges, maxEntries = 9) {
    this._edgesTree = new rbush_1(maxEntries);
    this._edgesIndex = 0;
    this.events = new EventEmitter();
    if (edges) {
      for (let i = 0; i < edges.length; i++) {
        this.addEdge(edges[i]);
      }
    }
  }
  static fromGeoJSON(json, maxEntries = 9) {
    let edges = json.features.map(f => {
      return f.geometry.coordinates;
    });
    return new Network(edges, maxEntries);
  }
  all() {
    return this._edgesTree.all();
  }
  getEdge(id) {
    return this._edgesTree.all().filter(edge => edge.id === id)[0];
  }
  findEdgesAt(coordinates) {
    const node = coordinates instanceof Node ? coordinates : new Node(coordinates);
    return this._edgesTree.search(node);
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
    return this._edgesTree.search(searchBox);
  }
  addEdge(coordinates) {
    const edge = new Edge(++this._edgesIndex, coordinates);
    this._edgesTree.insert(edge);
    this._checkForIntersectionWithOtherEdges(edge);
    this.events.emit(ADD_EDGE, edge);
    return edge;
  }
  updateEdge(id, coordinates) {
    const oldEdge = this.getEdge(id);
    if (!oldEdge) {
      throw `InvalidArgument: edge with ID: ${id} was not found in the network`;
    }
    this._edgesTree.remove(oldEdge);
    const updEdge = new Edge(oldEdge.id, coordinates);
    this._edgesTree.insert(updEdge);
    this._checkForIntersectionWithOtherEdges(updEdge, oldEdge);
    this.events.emit(UPDATE_EDGE, oldEdge, updEdge);
    return updEdge;
  }
  removeEdges(coordinates) {
    const edges = this.findEdgesAt(coordinates);
    for (let i = 0; i < edges.length; i++) {
      this.removeEdge(edges[i]);
    }
  }
  removeEdge(edge) {
    if (this._edgesTree.remove(edge, this._equalityFunction)) {
      this.events.emit(REMOVE_EDGE, edge);
    }
  }
  removeEdgeById(id) {
    const edge = this.getEdge(id);
    if (!edge) {
      throw `InvalidArgument: edge with ID: ${id} was not found in the network`;
    }
    if (this.removeEdge(edge)) {
      this.events.emit(REMOVE_EDGE, edge);
    }
  }
  toGeoJSON(name = 'Network') {
    const features = [];
    const edges = this.all();
    for (let i = 0; i < edges.length; i++) {
      let coordinates = [];
      for (let j = 0; j < edges[i].coordinates.length; j++) {
        const vertex = edges[i].coordinates[j];
        coordinates.push(`[${vertex[0]},${vertex[1]}]`);
      }
      let text = `
{
  "type": "Feature",
  "id": ${edges[i].id},
  "geometry": {
    "type": "LineString",
    "coordinates": [
      ${coordinates.join(',')}
    ]
  },
  "properties": {
    "minX": ${edges[i].minX},
    "minY": ${edges[i].minY},
    "maxX": ${edges[i].maxX},
    "maxY": ${edges[i].maxY}
  }
}`;
      features.push(text);
    }
    return `
{
  "type": "FeatureCollection",
  "name": "${name}",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  "features": [${features.join(',')}]
}`;
  }
  _equalityFunction(a, b) {
    return a.id === b.id;
  }
  _checkForIntersectionWithOtherEdges(edge, oldEdge) {
    const edgesOnStart = this.findEdgesAt(edge.start).filter(e => e.id !== edge.id);
    edgesOnStart.map(edgeOnStart => {
      const splitResult = split(edgeOnStart.coordinates, edge.start.coordinates);
      if (splitResult) {
        this.updateEdge(edgeOnEnd.id, splitResult.firstCoordinates);
        const edge = this.addEdge(splitResult.secondCoordinates);
        this.events.emit(event.SPLIT_EDGE, edgeOnEnd, edge);
      }
    });
    const edgesOnEnd = this.findEdgesAt(edge.end).filter(e => e.id !== edge.id);
    edgesOnEnd.map(edgeOnEnd => {
      const splitResult = split(edgeOnEnd.coordinates, edge.end.coordinates);
      if (splitResult) {
        this.updateEdge(edgeOnEnd.id, splitResult.firstCoordinates);
        const newEdge = this.addEdge(splitResult.secondCoordinates);
        this.events.emit(SPLIT_EDGE, edgeOnEnd, newEdge);
      }
    });
    if (oldEdge) {
      const oldEdgeEdgesOnStart = this.findEdgesAt(oldEdge.start).filter(e => e.id !== oldEdge.id);
      oldEdgeEdgesOnStart.map(oldEdgeEdgeOnStart => {
        if (coordinatesAreEqual(oldEdgeEdgeOnStart.start.coordinates, oldEdge.start.coordinates)) {
          if (coordinatesAreEqual(oldEdgeEdgeOnStart.start.coordinates, edge.start.coordinates) === false) {
            let coordinates = oldEdgeEdgeOnStart.coordinates;
            coordinates[0] = edge.start.coordinates;
            this.updateEdge(oldEdgeEdgeOnStart.id, coordinates);
          }
        }
        if (coordinatesAreEqual(oldEdgeEdgeOnStart.end.coordinates, oldEdge.start.coordinates)) {
          if (coordinatesAreEqual(oldEdgeEdgeOnStart.end.coordinates, edge.start.coordinates) === false) {
            let coordinates = oldEdgeEdgeOnStart.coordinates;
            coordinates[oldEdgeEdgeOnStart.vertexCount - 1] = edge.start.coordinates;
            this.updateEdge(oldEdgeEdgeOnStart.id, coordinates);
          }
        }
      });
      const oldEdgeEdgesOnEnd = this.findEdgesAt(oldEdge.end).filter(e => e.id !== oldEdge.id);
      oldEdgeEdgesOnEnd.map(oldEdgeEdgeOnEnd => {
        if (coordinatesAreEqual(oldEdgeEdgeOnEnd.start.coordinates, oldEdge.end.coordinates)) {
          if (coordinatesAreEqual(oldEdgeEdgeOnEnd.start.coordinates, edge.end.coordinates) === false) {
            let coordinates = oldEdgeEdgeOnEnd.coordinates;
            coordinates[0] = edge.end.coordinates;
            this.updateEdge(oldEdgeEdgeOnEnd.id, coordinates);
          }
        }
        if (coordinatesAreEqual(oldEdgeEdgeOnEnd.end.coordinates, oldEdge.end.coordinates)) {
          if (coordinatesAreEqual(oldEdgeEdgeOnEnd.end.coordinates, edge.end.coordinates) === false) {
            let coordinates = oldEdgeEdgeOnEnd.coordinates;
            coordinates[oldEdgeEdgeOnEnd.vertexCount - 1] = edge.end.coordinates;
            this.updateEdge(oldEdgeEdgeOnEnd.id, coordinates);
          }
        }
      });
    }
  }
}

exports.events = Events;
exports.Network = Network;
