import rbush from 'rbush';
import { toGeoJSON, resetIndices, coordinatesAreEqual, nodesAreEqual, split } from '../Helpers';
import Node from './Node';
import Edge from './Edge';
import * as events from '../Events/Events';
import EventEmitter from '../Events/EventEmitter';

export default class Network {
  constructor(maxEntries = 9, edges = []) {
    // resets nodes and edges indices to 0
    resetIndices();

    this._elementsTree = new rbush(maxEntries);

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
    const node = coordinates instanceof Node ? coordinates : new Node(coordinates);
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
    const node = coordinates instanceof Node ? coordinates : new Node(coordinates);
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
    // // These are used in this.removeEdge().
    // // If the node is connected to more than one edge
    // // these booleans will be set to false.
    // let removeStartNode = this.findEdgesAt(edge.start).filter(e => e.id !== edge.id).length < 1;
    // let removeEndNode = this.findEdgesAt(edge.end).filter(e => e.id !== edge.id).length < 1;

    return {
      removeStartNode,
      removeEndNode
    };
  }

  addEdge(coordinates) {
    let startNode = this.findNodeAt(coordinates[0]),
      endNode = this.findNodeAt(coordinates[coordinates.length - 1]);

    if (!startNode) {
      startNode = new Node(coordinates[0]);
    }

    if (!endNode) {
      endNode = new Node(coordinates[coordinates.length - 1]);
    }

    const edge = new Edge(coordinates, startNode, endNode);

    this._elementsTree.insert(edge);
    this._elementsTree.insert(edge.start);
    this._elementsTree.insert(edge.end);

    // TODO:
    // check for existing edges to be splitted at start/end node
    // connect the new edge to the network

    let edges = this.findEdgesAt(edge.start).filter(e => e.id !== edge.id);
    for (let i = 0; i < edges.length; i++) {
      const edgeAtStart = edges[i];

      // splitResult will be defined if an edge exists at edge.start node.
      // The existing edge will be them splitted.
      const splitResult = split(edgeAtStart.coordinates, edge.start.coordinates);

      if (splitResult) {
        const oldCoordinates = [...edgeAtStart.coordinates];
        this.disconnectEdge(edgeAtStart);
        this._elementsTree.remove(edgeAtStart);

        edgeAtStart.setEnd(edge.start);
        edgeAtStart.setCoordinates(splitResult.firstCoordinates);

        this._elementsTree.insert(edgeAtStart);
        this.connectEdge(edgeAtStart);

        this.events.emit(events.UPDATE_EDGE, oldCoordinates, edgeAtStart);

        const newEdge = this.addEdge(splitResult.secondCoordinates, edge.start, edgeAtStart.end);

        this.events.emit(events.SPLIT_EDGE, oldCoordinates, edgeAtStart, newEdge);
      }
    }

    edges = this.findEdgesAt(edge.end).filter(e => e.id !== edge.id);
    for (let i = 0; i < edges.length; i++) {
      const edgeAtEnd = edges[i];

      // splitResult will be defined if an edge exists at edge.end node.
      // The existing edge will be them splitted.
      const splitResult = split(edgeAtEnd.coordinates, edge.end.coordinates);

      if (splitResult) {
        const oldCoordinates = [...edgeAtEnd.coordinates];
        this.disconnectEdge(edgeAtEnd);
        this._elementsTree.remove(edgeAtEnd);

        edgeAtEnd.setEnd(edge.end);
        edgeAtEnd.setCoordinates(splitResult.firstCoordinates);

        this._elementsTree.insert(edgeAtEnd);
        this.connectEdge(edgeAtEnd);

        this.events.emit(events.UPDATE_EDGE, oldCoordinates, edgeAtEnd);

        const newEdge = this.addEdge(splitResult.secondCoordinates, edge.end, edgeAtEnd.end);

        this.events.emit(events.SPLIT_EDGE, oldCoordinates, edgeAtEnd, newEdge);
      }
    }

    this.events.emit(events.ADD_EDGE, edge);

    return edge;
  }

  ////////////////////////////////////////////////////////
  //////////////////// NOT TESTED:////////////////////////
  ////////////////////////////////////////////////////////

  // removeEdges(coordinates) {
  //   const edges = this.findEdgesAt(coordinates);
  //   for (let i = 0; i < edges.length; i++) {
  //     this.removeEdge(edges[i]);
  //   }
  // }

  removeEdgeById(id) {
    const edge = this.getEdgeById(id);
    if (!edge) {
      throw `InvalidArgument: edge with ID: ${id} was not found in the network`;
    }
    return this.removeEdge(edge);
  }

  removeEdge(edge) {
    if (this._elementsTree.remove(edge, this._equalityFunction)) {
      // TODO remove the connections as well

      const { removeStartNode, removeEndNode } = this.disconnectEdge(edge);

      // const edgesOnStart = this.findEdgesAt(edge.start).filter(e => e.id !== edge.id);
      // edgesOnStart.map(edgeOnStart => {
      //   edgeOnStart.start.removeAdjacent(edge.start);
      //   edgeOnStart.end.removeAdjacent(edge.start);
      //   removeStartNode = true;
      // });

      // const edgesOnEnd = this.findEdgesAt(edge.end).filter(e => e.id !== edge.id);
      // edgesOnEnd.map(edgeOnEnd => {
      //   edgeOnEnd.start.removeAdjacent(edge.end);
      //   edgeOnEnd.end.removeAdjacent(edge.end);
      //   removeEndNode = true;
      // });

      if (removeStartNode) {
        this._elementsTree.remove(edge.start);
      }
      if (removeEndNode) {
        this._elementsTree.remove(edge.end);
      }

      this.events.emit(events.REMOVE_EDGE, edge);

      return true;
    }

    return false;
  }

  // TODO
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
      // edgeStartNode = new Node(coordinates[0]);
      // this._elementsTree.insert(edgeStartNode);
    }

    if (!edgeEndNode) {
      edgeEndNode = oldEdge.end.clone();
      edgeEndNode.setCoordinates(coordinates[coordinates.length - 1]);
      // edgeEndNode = new Node(coordinates[coordinates.length - 1]);
      // this._elementsTree.insert(edgeEndNode);
    }

    // if (coordinatesAreEqual(coordinates[0], oldEdge.start.coordinates) === false) {
    //   oldEdge.start.setCoordinates(coordinates[0]);
    //   edgeStartNode = startNode || oldEdge.start;
    // }
    // if (coordinatesAreEqual(coordinates[coordinates.length - 1], oldEdge.end.coordinates) === false) {
    //   oldEdge.start.setCoordinates(coordinates[coordinates.length - 1]);
    //   edgeEndNode = endNode || oldEdge.end;
    // }

    const updEdge = oldEdge.clone();
    this._elementsTree.remove(oldEdge);

    updEdge.setCoordinates(coordinates, edgeStartNode, edgeEndNode);
    this._elementsTree.insert(updEdge);

    this._processEdge(updEdge, oldEdge);

    this.events.emit(events.UPDATE_EDGE, oldEdge, updEdge);

    return updEdge;
  }

  _equalityFunction(a, b) {
    return a.id === b.id;
  }

  _fillAdjacency(edge, other) {
    // if (nodesAreEqual(edge.start, other.start)) {
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
    // if (nodesAreEqual(edge.start, other.start)) {
    if (edge.start === other.start) {
      edge.start.removeAdjacent(other.end);
      // other.start.removeAdjacent(edge.end);
    }
    if (edge.end === other.start) {
      edge.end.removeAdjacent(other.end);
      // other.start.removeAdjacent(edge.start);
    }
    if (edge.start === other.end) {
      edge.start.removeAdjacent(other.start);
      // other.end.removeAdjacent(edge.end);
    }
    if (edge.end === other.end) {
      edge.end.removeAdjacent(other.start);
      // other.end.removeAdjacent(edge.start);
    }
  }

  _tryToSplitEdge(edge, splitPoint) {
    const splitResult = split(edge.coordinates, splitPoint);
    return splitResult;
    // if (splitResult) {
    //   const newNode =
    //     this.findNodesAt(splitResult.firstCoordinates[splitResult.firstCoordinates.length - 1])[0] ||
    //     new Node(splitResult.firstCoordinates[splitResult.firstCoordinates.length - 1]);
    //   // this emits UPDATE_EDGE event
    //   this.updateEdge(edge.id, splitResult.firstCoordinates, edge.start, newNode);
    //   // this emits ADD_EDGE event
    //   const newEdge = this.addEdge(splitResult.secondCoordinates, newNode, edge.end);
    //   return newEdge;
    // }
  }

  _processEdge(edge, oldEdge) {
    const edgesOnStart = this.findEdgesAt(edge.start).filter(e => e.id !== edge.id);
    // split edges on start node
    edgesOnStart.map(edgeOnStart => {
      const splitResult = this._tryToSplitEdge(edgeOnStart, edge.start.coordinates);
      if (splitResult) {
        this.disconnectEdge(edgeOnStart);

        let splitNode = this.findNodeAt(splitResult.secondCoordinates[0]);
        if (!splitNode) {
          splitNode = new Node(splitResult.secondCoordinates[0]);
          this._elementsTree.insert(splitNode);
        }

        const updEdge = edgeOnStart.clone();
        this._elementsTree.remove(edgeOnStart);

        updEdge.setCoordinates(splitResult.firstCoordinates, edgeOnStart.start, splitNode);
        this._elementsTree.insert(updEdge);

        this.connectEdge(updEdge);

        this.events.emit(events.UPDATE_EDGE, edgeOnStart, updEdge);

        const newEdge = this.addEdge(splitResult.secondCoordinates, splitNode, edgeOnStart.start);

        this.events.emit(events.SPLIT_EDGE, edgeOnStart, newEdge);
      }

      // const newEdge = this._tryToSplitEdge(edgeOnStart, edge.start.coordinates);
      // if (newEdge) {
      //   this.events.emit(events.SPLIT_EDGE, edgeOnStart, newEdge);
      // }
    });
    const edgesOnEnd = this.findEdgesAt(edge.end).filter(e => e.id !== edge.id);
    // split edges on end node
    edgesOnEnd.map(edgeOnEnd => {
      const splitResult = this._tryToSplitEdge(edgeOnEnd, edge.end.coordinates);
      if (splitResult) {
        this.disconnectEdge(edgeOnEnd);

        let splitNode = this.findNodeAt(splitResult.secondCoordinates[0]);
        if (!splitNode) {
          splitNode = new Node(splitResult.secondCoordinates[0]);
          this._elementsTree.insert(splitNode);
        }

        const updEdge = edgeOnEnd.clone();
        this._elementsTree.remove(edgeOnEnd);

        updEdge.setCoordinates(splitResult.firstCoordinates, edgeOnEnd.start, splitNode);
        this._elementsTree.insert(updEdge);

        this.connectEdge(updEdge);

        edgeOnEnd.end.removeAdjacent(updEdge.start);
        updEdge.end.addAdjacent(edgeOnEnd.end);

        this.events.emit(events.UPDATE_EDGE, edgeOnEnd, updEdge);

        const newEdge = this.addEdge(splitResult.secondCoordinates, splitNode, edgeOnEnd.end);

        this.events.emit(events.SPLIT_EDGE, edgeOnEnd, newEdge);
      }

      // const newEdge = this._tryToSplitEdge(edgeOnEnd, edge.end.coordinates);
      // if (newEdge) {
      //   this._fillAdjacency(edge, newEdge);
      //   this.events.emit(events.SPLIT_EDGE, edgeOnEnd, newEdge);
      // }
      // this._fillAdjacency(edge, edgeOnEnd);
    });

    this.connectEdge(edge);

    if (oldEdge) {
      // check for start/end nodes and update them

      const oldEdgeEdgesOnStart = this.findEdgesAt(oldEdge.start).filter(e => e.id !== oldEdge.id);
      oldEdgeEdgesOnStart.map(oldEdgeEdgeOnStart => {
        if (nodesAreEqual(oldEdgeEdgeOnStart.start, oldEdge.start)) {
          if (nodesAreEqual(oldEdgeEdgeOnStart.start, edge.start) === false) {
            let coordinates = oldEdgeEdgeOnStart.coordinates;
            coordinates[0] = edge.start.coordinates;
            // this emits UPDATE_EDGE event
            this.updateEdge(oldEdgeEdgeOnStart.id, coordinates, edge.start, oldEdgeEdgeOnStart.end);
          }
        }
        if (nodesAreEqual(oldEdgeEdgeOnStart.end, oldEdge.start)) {
          if (nodesAreEqual(oldEdgeEdgeOnStart.end, edge.start) === false) {
            let coordinates = oldEdgeEdgeOnStart.coordinates;
            coordinates[oldEdgeEdgeOnStart.vertexCount - 1] = edge.start.coordinates;
            // this emits UPDATE_EDGE event
            this.updateEdge(oldEdgeEdgeOnStart.id, coordinates, oldEdgeEdgeOnStart.start, edge.start);
          }
        }
      });

      // check for start/end nodes and update them

      const oldEdgeEdgesOnEnd = this.findEdgesAt(oldEdge.end).filter(e => e.id !== oldEdge.id);
      oldEdgeEdgesOnEnd.map(oldEdgeEdgeOnEnd => {
        if (nodesAreEqual(oldEdgeEdgeOnEnd.start, oldEdge.end)) {
          if (nodesAreEqual(oldEdgeEdgeOnEnd.start, edge.end) === false) {
            let coordinates = oldEdgeEdgeOnEnd.coordinates;
            coordinates[0] = edge.end.coordinates;
            // this emits UPDATE_EDGE event
            this.updateEdge(oldEdgeEdgeOnEnd.id, coordinates, edge.end, oldEdgeEdgeOnEnd.end);
          }
        }
        if (nodesAreEqual(oldEdgeEdgeOnEnd.end, oldEdge.end)) {
          if (nodesAreEqual(oldEdgeEdgeOnEnd.end, edge.end) === false) {
            let coordinates = oldEdgeEdgeOnEnd.coordinates;
            coordinates[oldEdgeEdgeOnEnd.vertexCount - 1] = edge.end.coordinates;
            // this emits UPDATE_EDGE event
            this.updateEdge(oldEdgeEdgeOnEnd.id, coordinates, oldEdgeEdgeOnEnd.start, edge.end);
          }
        }
      });
    }
  }
}
