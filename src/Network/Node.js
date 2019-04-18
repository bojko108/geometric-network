import { getNodeId } from '../helpers';

export default class Node {
  constructor(coordinates) {
    this.id = getNodeId();
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
