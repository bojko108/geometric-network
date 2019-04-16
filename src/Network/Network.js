import rbush from 'rbush';
import { coordinatesAreEqual } from '../helpers';
import Node from './Node';
import Edge from './Edge';
import * as events from '../Events/Events';
import EventEmitter from '../Events/EventEmitter';

export default class Network {
  constructor(edges, maxEntries = 9) {
    this._edgesTree = new rbush(maxEntries);
    this._edgesIndex = 0;

    this.events = new EventEmitter();
    this.events.on(events.ADD_EDGE, this._onAddEdge);
    this.events.on(events.REMOVE_EDGE, this._onRemoveEdge);
    this.events.on(events.UPDATE_EDGE, this._onUpdateEdge);
    this.events.on(events.SPLIT_EDGE, this._onSplitEdge);

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

  findEdges(coordinates) {
    const node = new Node(coordinates);
    return this._edgesTree.search(node);
  }

  addEdge(coordinates) {
    let edge = new Edge(++this._edgesIndex, coordinates);
    this._edgesTree.insert(edge);

    this.events.emit(events.ADD_EDGE, edge);
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
  }

  removeEdges(coordinates) {
    const edges = this.findEdges(coordinates);
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

      // if (i !== edges.length - 1) {
      //   text += ',';
      // }

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

  _onAddEdge(edge) {}

  _onRemoveEdge(edge) {}

  _onUpdateEdge(oldEdge, newEdge) {
    // should check for intersection, split...
  }

  _onSplitEdge(oldEdge, newEdge) {}

  _equalityFunction(a, b) {
    return a.id === b.id;
  }
}
