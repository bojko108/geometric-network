import { getNodeId } from '../Helpers';

export default class Node {
  constructor(coordinates, id) {
    this.id = id || getNodeId();
    this._adjacent = [];
    this.setCoordinates(coordinates);
  }

  /**
   * Network element type: `edge` for edges, `node` for nodes.
   * @public
   * @type {String}
   */
  get type() {
    return 'node';
  }
  /**
   * Node `x` coordinate.
   * @public
   * @type {Number}
   */
  get x() {
    return this.coordinates[0];
  }
  /**
   * Node `y` coordinate.
   * @public
   * @type {Number}
   */
  get y() {
    return this.coordinates[1];
  }

  /**
   * Returns list of all adjacent nodes to this node
   * @public
   * @type {Array.<Number>}
   */
  get adjacent() {
    return this._adjacent;
  }

  /**
   * `True` if the node has only one adjacent, otherwise `False`
   * @public
   * @type {Boolean}
   */
  get terminator() {
    return this.orphan === true || this._adjacent.length < 2;
  }

  /**
   * `True` if the node has no adjacent, otherwise `False`
   * @public
   * @type {Boolean}
   */
  get orphan() {
    return this._adjacent.length === 0;
  }

  /**
   * Adds a new adjacent to this node
   * @public
   * @param {!Node|String} nodeOrId - node to add as adjacent (you can pass a node or node ID)
   * @return {undefined}
   */
  addAdjacent(nodeOrId) {
    const id = nodeOrId instanceof Node ? nodeOrId.id : nodeOrId;
    if (this._adjacent.indexOf(id) < 0) {
      this._adjacent.push(id);
    }
  }

  /**
   * Removes an adjacent from this node
   * @public
   * @param {!Node|String} nodeOrId - node to remove from adjacent list (you can pass a node or node ID)
   * @return {undefined}
   */
  removeAdjacent(nodeOrId) {
    const id = nodeOrId instanceof Node ? nodeOrId.id : nodeOrId;
    const index = this._adjacent.indexOf(id);
    if (index > -1) {
      this._adjacent.splice(index, 1);
    }
  }

  /**
   * This method simply updates the coordinates of this node. You must call
   * `addAdjacent` or `removeAdjacent` to update the adjacency list.
   * @public
   * @param {Array.<Number>} coordinates
   * @return {undefined}
   */
  setCoordinates(coordinates) {
    this.coordinates = [...coordinates];

    this._calculateBounds();
  }

  // clone() {
  //   return new Node(this.coordinates);
  // }

  _calculateBounds() {
    this.minX = this.coordinates[0];
    this.minY = this.coordinates[1];
    this.maxX = this.coordinates[0];
    this.maxY = this.coordinates[1];
  }
}
