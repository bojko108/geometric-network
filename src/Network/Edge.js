import { getEdgeId } from '../helpers';
import Node from './Node';

export default class Edge {
  constructor(coordinates, start, end) {
    this.id = getEdgeId();

    this.setStart(start || coordinates[0]);
    this.setEnd(end || coordinates[coordinates.length - 1]);
    this.setCoordinates(coordinates);
  }

  get type() {
    return 'edge';
  }

  setStart(start) {
    this.start = start instanceof Node ? start : new Node(start);
  }

  setEnd(end) {
    this.end = end instanceof Node ? end : new Node(end);
  }

  setCoordinates(coordinates, start, end) {
    this.coordinates = [...coordinates];
    this.vertexCount = this.coordinates.length;

    this._calculateBounds();

    if (start) {
      this.setStart(start);
    }
    if (end) {
      this.setEnd(end);
    }
  }

  clone() {
    return new Edge(this.coordinates, this.start.clone(), this.end.clone());
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
