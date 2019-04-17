import rbush from 'rbush';
import { coordinatesAreEqual, split } from '../helpers';
import Node from './Node';
import Edge from './Edge';
import * as events from '../Events/Events';
import EventEmitter from '../Events/EventEmitter';

export default class Network {
  constructor(edges, maxEntries = 9) {
    this._edgesTree = new rbush(maxEntries);
    this._edgesIndex = 0;

    this.events = new EventEmitter();
    this.events.on(events.ADD_EDGE, edge => this._onAddEdge(edge));
    this.events.on(events.REMOVE_EDGE, edge => this._onRemoveEdge(edge));
    this.events.on(events.UPDATE_EDGE, (oldEdge, newEdge) => this._onUpdateEdge(oldEdge, newEdge));
    this.events.on(events.SPLIT_EDGE, (splitEdge, newEdge) => this._onSplitEdge(splitEdge, newEdge));

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
    return this._edgesTree.search(bbox);
  }

  addEdge(coordinates) {
    let edge = new Edge(++this._edgesIndex, coordinates);
    this._edgesTree.insert(edge);
    this.events.emit(events.ADD_EDGE, edge);
    return edge;
  }

  updateEdge(id, coordinates) {
    const oldEdge = this.getEdge(id);

    if (!oldEdge) {
      throw `Edge with ID: ${id} was not found in the network`;
    }

    this._edgesTree.remove(oldEdge);
    const updEdge = new Edge(oldEdge.id, coordinates);
    this._edgesTree.insert(updEdge);

    this.events.emit(events.UPDATE_EDGE, oldEdge, updEdge);

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
      this.events.emit(events.REMOVE_EDGE, edge);
    }
  }

  removeEdgeById(id) {
    const edge = this.getEdge(id);
    if (!edge) {
      throw `Edge with ID: ${id} was not found in the network`;
    }
    if (this.removeEdge(edge)) {
      this.events.emit(events.REMOVE_EDGE, edge);
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
  "geometry": {
    "type": "LineString",
    "coordinates": [
      ${coordinates.join(',')}
    ]
  },
  "properties": {
    "id": ${edges[i].id},
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

  _onAddEdge(edge) {
    this._checkForIntersectionWithOtherEdges(edge);
  }

  _onRemoveEdge(edge) {}

  _onUpdateEdge(oldEdge, newEdge) {
    // move all connected edges as well
    
    this._checkForIntersectionWithOtherEdges(newEdge);
  }

  _onSplitEdge(splitEdge, newEdge) {}

  _equalityFunction(a, b) {
    return a.id === b.id;
  }

  _checkForIntersectionWithOtherEdges(edge) {
    // should check for intersection, split...
    const edgesOnStart = this.findEdgesAt(edge.start).filter(e => e.id !== edge.id);
    // split edges on start node
    edgesOnStart.map(edgeOnStart => {
      const splitResult = split(edgeOnStart.coordinates, edge.start.coordinates);
      if (splitResult) {
        // this emits UPDATE_EDGE event
        this.updateEdge(edgeOnEnd.id, splitResult.firstCoordinates);

        const edge = this.addEdge(splitResult.secondCoordinates);
        this.events.emit(events.ADD_EDGE, edge);
        this.events.emit(event.SPLIT_EDGE, edgeOnEnd, edge);
      }
    });
    const edgesOnEnd = this.findEdgesAt(edge.end).filter(e => e.id !== edge.id);
    // split edges on end node
    edgesOnEnd.map(edgeOnEnd => {
      debugger;
      const splitResult = split(edgeOnEnd.coordinates, edge.end.coordinates);
      if (splitResult) {
        // this emits UPDATE_EDGE event
        this.updateEdge(edgeOnEnd.id, splitResult.firstCoordinates);

        const newEdge = this.addEdge(splitResult.secondCoordinates);
        this.events.emit(events.ADD_EDGE, newEdge);
        this.events.emit(events.SPLIT_EDGE, edgeOnEnd, newEdge);
      }
    });
  }
}

// const edgesOnStart = this.findEdgesAt(edge.start);
// // split edges on start vertex
// edgesOnStart.map(edgeOnStart => {
//   console.log(`check: ${edge.id} with: ${edgeOnStart.id}`);
//   if (
//     coordinatesAreEqual(edgeOnStart.start.coordinates, edge.start.coordinates) ||
//     coordinatesAreEqual(edgeOnStart.end.coordinates, edge.start.coordinates)
//   ) {
//     console.log('start node match existing edge');
//   } else {
//     if (
//       coordinatesAreEqual(edgeOnStart.start.coordinates, edge.end.coordinates) ||
//       coordinatesAreEqual(edgeOnStart.end.coordinates, edge.end.coordinates)
//     ) {
//       console.log('end node match existing edge');
//     } else {
//       console.log('check for split edge');
//       // split edgeOnStart by edge.end
//     }
//   }
// });

// const edgesOnEnd = this.findEdgesAt(edge.end);
// // split edges on end vertex
// edgesOnEnd.map(edgeOnEnd => {
//   console.log(`check: ${edge.id} with: ${edgeOnEnd.id}`);
//   if (
//     coordinatesAreEqual(edgeOnEnd.start.coordinates, edge.start.coordinates) ||
//     coordinatesAreEqual(edgeOnEnd.end.coordinates, edge.start.coordinates)
//   ) {
//     console.log('start node match existing edge');
//   } else {
//     if (
//       coordinatesAreEqual(edgeOnEnd.start.coordinates, edge.end.coordinates) ||
//       coordinatesAreEqual(edgeOnEnd.end.coordinates, edge.end.coordinates)
//     ) {
//       console.log('end node match existing edge');
//     } else {
//       console.log('check for split edge');
//     }
//   }
// });
