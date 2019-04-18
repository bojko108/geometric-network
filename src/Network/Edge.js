import { getEdgeId } from '../helpers';
import Node from './Node';

export default class Edge {
  /**
   * Creates a new Edge element
   * @param {!Array.<Number>} coordinates
   * @param {Node|Array.<Number>} start - sets start node for this edge, default is
   * the first item in `coordinates` array
   * @param {Node|Array.<Number>} end - sets end node for this edge, default is the
   * last item in `coordinates` array
   * @param {Number} id - optional ID value, by default the value is generated
   * automatically from an internal idex but in some cases (for example clonning
   * an edge) we need to set the ID manually.
   */
  constructor(coordinates, start, end, id) {
    this.id = id || getEdgeId();

    if (start) {
      this.start = start instanceof Node ? start : new Node(start);
    } else {
      this.start = new Node(coordinates[0]);
    }
    if (end) {
      this.end = end instanceof Node ? end : new Node(end);
    } else {
      this.end = new Node(coordinates[coordinates.length - 1]);
    }

    // by default the start and end nodes are connected
    this.start.addAdjacent(this.end.id);
    this.end.addAdjacent(this.start.id);

    this.setCoordinates(coordinates);
  }

  get type() {
    return 'edge';
  }

  setStart(start) {
    // remove connectivity to the previous node
    this.end.removeAdjacent(this.start.id);

    this.start = start;

    // add connectivity to the new node
    this.end.addAdjacent(this.start.id);
  }

  setEnd(end) {
    // remove connectivity to the previous node
    this.start.removeAdjacent(this.end.id);

    this.end = end;

    // add connectivity to the new node
    this.start.addAdjacent(this.end.id);
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
    return new Edge(this.coordinates, this.start, this.end, this.id);
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
