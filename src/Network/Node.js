import { getNodeId } from '../helpers';

export default class Node {
  constructor(coordinates) {
    this.id = getNodeId();
    this._edges = [];
    this.updateCoordinates(coordinates);
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

  addEdge(id) {
    if (this._edges.indexOf(id) < 0) {
      this._edges.push(id);
    }
  }

  getEdges() {
    return this._edges;
  }

  updateCoordinates(coordinates) {
    this.coordinates = [...coordinates];

    this._calculateBounds();
  }

  clone() {
    return new Node(this.coordinates);
  }

  _calculateBounds() {
    this.minX = this.coordinates[0];
    this.minY = this.coordinates[1];
    this.maxX = this.coordinates[0];
    this.maxY = this.coordinates[1];
  }
}
