import rbush from 'rbush';
import { toGeoJSON, resetIndices, nodesAreEqual, split } from '../Helpers';
import Node from './Node';
import Edge from './Edge';
import * as events from '../Events/Events';
import EventEmitter from '../Events/EventEmitter';
import { MAX_ENTRIES } from './defaultOptions';

/**
 * Main class for creating and managing a geometric network.
 * @public
 * @example
 * const network = new Network()
 *
 */
export default class Network {
  /**
   * Creates a new geometric network.
   * @param {Object.<String,*>} [options] - parameters for the geoemtric network
   * @param {Number} [maxEntries] - maxumum number of elements in a single node from
   * the spatial index. Default is {@link MAX_ENTRIES}.
   */
  constructor(options = {}) {
    // resets nodes and edges indices to 0
    resetIndices();

    /**
     * Network's spatial index
     * @private
     * @type {rbush}
     */
    this._elementsTree = new rbush(options.maxEntries || MAX_ENTRIES);

    /**
     * Object for listening to network events such as `addnode`, `addedge`...
     * @public
     * @type {EventEmitter}
     */
    this.events = new EventEmitter();

    this.events.on(events.UPDATE_NODE, (node, oldCoordinates) => this._onUpdateNode(node, oldCoordinates));
  }

  addFromGeoJSON(json) {
    let elements = json.features.map(f => {
      return { type: f.geometry.type, coordinates: f.geometry.coordinates };
    });

    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type === 'Point') {
        this.addNode(elements[i].coordinates);
      } else {
        this.addEdge(elements[i].coordinates);
      }
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

  getNodeById(id) {
    return this.all('node').filter(node => node.id === id)[0];
  }

  getNodesById(ids) {
    return this.all('node').filter(node => ids.indexOf(node.id) > -1);
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
    const node = coordinates instanceof Node ? coordinates : new Node(coordinates, -1); // WTF!!!
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

    // connect to all other edges located at start/end nodes of this edge
    let edges = this.findEdgesAt(edge.start).filter(e => e.id !== edge.id);
    for (let i = 0; i < edges.length; i++) {
      this._fillAdjacency(edge, edges[i]);
    }
    edges = this.findEdgesAt(edge.end).filter(e => e.id !== edge.id);
    for (let i = 0; i < edges.length; i++) {
      this._fillAdjacency(edge, edges[i]);
    }

    this.events.emit(events.CONNECT_EDGE, edge);
  }

  /**
   * Disconnects an edge from the network. This function removes the adjacency between
   * `start` and `end` nodes of the processed edge.
   * @param {!Edge|Number} edgeOrId - edge or ID of an edge to be disconnected from the network
   * @return {undefined}
   */
  disconnectEdge(edgeOrId) {
    const edge = edgeOrId instanceof Edge ? edgeOrId : this.getEdgeById(edgeOrId);

    if (!edge) {
      throw `InvalidArgument: edge with ID: ${edgeOrId} was not found in the network`;
    }

    edge.start.removeAdjacent(edge.end);
    edge.end.removeAdjacent(edge.start);

    this.events.emit(events.DISCONNECT_EDGE, edge);
  }

  /**
   * Adds a new node to the network. If the network have an edge on the coordinates of the
   * node the edge will be splitted. The split operation works this way:
   *  A          C            B
   *  x----------X------------x
   *  If C is the new node then the edge from A to B will be modified:
   *    - from A to C
   *    - new edge will be created from C to B
   * @param {!Array.<Number>} coordinates - coordinates of the node in format `[x, y]`
   */
  addNode(coordinates = []) {
    if (coordinates.length !== 2) {
      throw `InvalidArgument: addNode() - coordinates must be in format [x, y]`;
    }
    const node = new Node(coordinates);
    this._elementsTree.insert(node);

    let edges = this.findEdgesAt(node);
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];

      // splitResult will be defined if an edge exists at `node` location.
      // The existing edge will be then splitted.
      const splitResult = split(edge.coordinates, node.coordinates);

      if (splitResult) {
        const oldCoordinates = [...edge.coordinates];
        this.disconnectEdge(edge);
        this._elementsTree.remove(edge);

        // The newly added edge will have this node as end node.
        const oldEnd = edge.end;

        edge.setEnd(node);
        edge.setCoordinates(splitResult.firstCoordinates);

        this._elementsTree.insert(edge);
        this.connectEdge(edge);

        this.events.emit(events.UPDATE_EDGE, oldCoordinates, edge);

        const newEdge = this.addEdge(splitResult.secondCoordinates, node, oldEnd);

        this.events.emit(events.SPLIT_EDGE, oldCoordinates, edge, newEdge);
      }
    }

    this.events.emit(events.ADD_NODE, node);

    return node;
  }

  addEdge(coordinates = []) {
    if (coordinates.length < 2) {
      throw `InvalidArgument: addEdge() - coordinates must be in format [[x1, y1], [x2, y2], ...]`;
    }

    // listen to events once and add the results to the result of this function!

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

    this.events.emit(events.ADD_EDGE, edge);

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
      this.disconnectEdge(edge);

      if (edge.start.orphan) {
        this._elementsTree.remove(edge.start);
      }
      if (edge.end.orphan) {
        this._elementsTree.remove(edge.end);
      }

      this.events.emit(events.REMOVE_EDGE, edge);

      return true;
    }

    return false;
  }

  // use this method when updating start/end nodes for an edge
  updateNode(id, newCoordinates) {
    const node = this.getNodeById(id);
    if (!node) {
      throw `InvalidArgument: node with ID: ${id} was not found in the network`;
    }

    // TODO:
    // WHAT IF A NODE ALREADY EXISTS ON newCoordinates???

    const oldCoordinates = [...node.coordinates];

    this._elementsTree.remove(node);
    node.setCoordinates(newCoordinates);
    this._elementsTree.insert(node);

    this.events.emit(events.UPDATE_NODE, node, oldCoordinates);

    return node;
  }

  // use this method when updating coordinates for an edge, except start/end nodes
  updateEdgeCoordinates(id, newCoordinates) {

    // TODO should also update start/end nodes...

    const edge = this.getEdgeById(id);

    if (!edge) {
      throw `InvalidArgument: edge with ID: ${id} was not found in the network`;
    }

    if (edge.start.x !== newCoordinates[0][0] && edge.start.y !== newCoordinates[0][1]) {
      throw `This method is designed to update coordinates of an edge except start/end nodes. To update the start node of this edge you must call: updateNode(${
        edge.start.id
      }, [${newCoordinates[0]}])`;
    }

    if (edge.end.x !== newCoordinates[newCoordinates.length - 1][0] && edge.end.y !== newCoordinates[newCoordinates.length - 1][1]) {
      throw `This method is designed to update coordinates of an edge except start/end nodes. To update the end node of this edge you must call: updateNode(${
        edge.end.id
      }, [${newCoordinates[newCoordinates.length - 1]}])`;
    }

    const oldCoordinates = [...edge.coordinates];

    this._elementsTree.remove(edge);
    edge.setCoordinates(newCoordinates);
    this._elementsTree.insert(edge);

    this.events.emit(events.UPDATE_EDGE, edge, oldCoordinates);

    return edge;
  }


  _onUpdateNode(node, oldCoordinates) {
    const edges = this.findEdgesAt(oldCoordinates);
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const oldCoordinates = [...edge.coordinates];
      const newCoordinates = [...edge.coordinates];

      if (edge.start === node) {
        newCoordinates[0] = [...node.coordinates];
      }

      if (edge.end === node) {
        newCoordinates[edge.vertexCount - 1] = [...node.coordinates];
      }

      this._elementsTree.remove(edge);
      edge.setCoordinates(newCoordinates);
      this._elementsTree.insert(edge);

      this.events.emit(events.UPDATE_EDGE, edge, oldCoordinates);
    }
  }

  _equalityFunction(a, b) {
    return a.id === b.id && a.type === b.type;
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

  ////////////////////////////////////////////////////////
  //////////////////// NOT TESTED ////////////////////////
  ////////////////////////////////////////////////////////

  removeOrphanNodes() {}
}
