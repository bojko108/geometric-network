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

  getEdges(ids) {
    return this._edgesTree.all().filter(edge => ids.indexOf(edge.id) > -1);
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
    this._processEdge(edge);
    this.events.emit(events.ADD_EDGE, edge);
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

    this._processEdge(updEdge, oldEdge);

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
      throw `InvalidArgument: edge with ID: ${id} was not found in the network`;
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

  _fillAdjacency(edge, other) {
    if (coordinatesAreEqual(edge.start.coordinates, other.start.coordinates)) {
      edge.start.addEdge(other.id);
      other.start.addEdge(edge.id);
    }
    if (coordinatesAreEqual(edge.end.coordinates, other.start.coordinates)) {
      edge.end.addEdge(other.id);
      other.start.addEdge(edge.id);
    }
    if (coordinatesAreEqual(edge.start.coordinates, other.end.coordinates)) {
      edge.start.addEdge(other.id);
      other.end.addEdge(edge.id);
    }
    if (coordinatesAreEqual(edge.end.coordinates, other.end.coordinates)) {
      edge.end.addEdge(other.id);
      other.end.addEdge(edge.id);
    }
  }

  _tryToSplitEdge(edge, splitPoint) {
    const splitResult = split(edge.coordinates, splitPoint);
    if (splitResult) {
      // this emits UPDATE_EDGE event
      this.updateEdge(edge.id, splitResult.firstCoordinates);
      // this emits ADD_EDGE event
      const newEdge = this.addEdge(splitResult.secondCoordinates);
      return newEdge;
    }
  }

  _processEdge(edge, oldEdge) {
    const edgesOnStart = this.findEdgesAt(edge.start).filter(e => e.id !== edge.id);
    // split edges on start node
    edgesOnStart.map(edgeOnStart => {
      this._fillAdjacency(edge, edgeOnStart);

      const newEdge = this._tryToSplitEdge(edgeOnStart, edge.start.coordinates);
      if (newEdge) {
        this.events.emit(events.SPLIT_EDGE, edgeOnStart, newEdge);
      }
    });
    const edgesOnEnd = this.findEdgesAt(edge.end).filter(e => e.id !== edge.id);
    // split edges on end node
    edgesOnEnd.map(edgeOnEnd => {
      this._fillAdjacency(edge, edgeOnEnd);

      const newEdge = this._tryToSplitEdge(edgeOnEnd, edge.end.coordinates);
      if (newEdge) {
        this.events.emit(events.SPLIT_EDGE, edgeOnEnd, newEdge);
      }
    });

    if (oldEdge) {
      // check for start/end nodes and update them

      // spatial search
      // const oldEdgeEdgesOnStart = this.findEdgesAt(oldEdge.start).filter(e => e.id !== oldEdge.id);
      // OR
      // by ID
      const oldEdgeEdgesOnStart = this.getEdges(oldEdge.start.getEdges()).filter(e => e.id !== oldEdge.id);
      oldEdgeEdgesOnStart.map(oldEdgeEdgeOnStart => {
        if (coordinatesAreEqual(oldEdgeEdgeOnStart.start.coordinates, oldEdge.start.coordinates)) {
          if (coordinatesAreEqual(oldEdgeEdgeOnStart.start.coordinates, edge.start.coordinates) === false) {
            let coordinates = oldEdgeEdgeOnStart.coordinates;
            coordinates[0] = edge.start.coordinates;
            // this emits UPDATE_EDGE event
            this.updateEdge(oldEdgeEdgeOnStart.id, coordinates);
          }
        }
        if (coordinatesAreEqual(oldEdgeEdgeOnStart.end.coordinates, oldEdge.start.coordinates)) {
          if (coordinatesAreEqual(oldEdgeEdgeOnStart.end.coordinates, edge.start.coordinates) === false) {
            let coordinates = oldEdgeEdgeOnStart.coordinates;
            coordinates[oldEdgeEdgeOnStart.vertexCount - 1] = edge.start.coordinates;
            // this emits UPDATE_EDGE event
            this.updateEdge(oldEdgeEdgeOnStart.id, coordinates);
          }
        }
      });

      // check for start/end nodes and update them

      // spatial search
      // const oldEdgeEdgesOnEnd = this.findEdgesAt(oldEdge.end).filter(e => e.id !== oldEdge.id);
      // OR
      // by ID
      const oldEdgeEdgesOnEnd = this.getEdges(oldEdge.end.getEdges()).filter(e => e.id !== oldEdge.id);
      oldEdgeEdgesOnEnd.map(oldEdgeEdgeOnEnd => {
        if (coordinatesAreEqual(oldEdgeEdgeOnEnd.start.coordinates, oldEdge.end.coordinates)) {
          if (coordinatesAreEqual(oldEdgeEdgeOnEnd.start.coordinates, edge.end.coordinates) === false) {
            let coordinates = oldEdgeEdgeOnEnd.coordinates;
            coordinates[0] = edge.end.coordinates;
            // this emits UPDATE_EDGE event
            this.updateEdge(oldEdgeEdgeOnEnd.id, coordinates);
          }
        }
        if (coordinatesAreEqual(oldEdgeEdgeOnEnd.end.coordinates, oldEdge.end.coordinates)) {
          if (coordinatesAreEqual(oldEdgeEdgeOnEnd.end.coordinates, edge.end.coordinates) === false) {
            let coordinates = oldEdgeEdgeOnEnd.coordinates;
            coordinates[oldEdgeEdgeOnEnd.vertexCount - 1] = edge.end.coordinates;
            // this emits UPDATE_EDGE event
            this.updateEdge(oldEdgeEdgeOnEnd.id, coordinates);
          }
        }
      });
    }
  }
}
