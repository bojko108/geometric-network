import Node from './Node';

export default class Edge {
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
