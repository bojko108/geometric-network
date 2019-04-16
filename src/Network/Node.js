export default class Node {
  constructor(coordinates) {
    this.coordinates = coordinates;

    this.minX = this.coordinates[0];
    this.minY = this.coordinates[1];
    this.maxX = this.coordinates[0];
    this.maxY = this.coordinates[1];
  }

  get type() {
    return 'point';
  }

  get x() {
    return this.coordinates[0];
  }

  get y() {
    return this.coordinates[1];
  }
}
