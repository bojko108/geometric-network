import { getEdgeId } from '../Helpers';
import Node from './Node';

export default class Edge {
  /**
   * Creates a new Edge element
   * @param {!Array.<Number>} coordinates
   * @param {Node|Array.<Number>} start - sets start node for this edge, default is
   * the first item in `coordinates` array
   * @param {Node|Array.<Number>} end - sets end node for this edge, default is the
   * last item in `coordinates` array
  //  * @param {Number} id - optional ID value, by default the value is generated
  //  * automatically from an internal idex but in some cases (for example clonning
  //  * an edge) we need to set the ID manually.
   */
  constructor(coordinates, start, end, id) {
    this.id = id || getEdgeId();

    this.start = start;
    this.end = end;

    // this.leaf = true;

    // by default the start and end nodes are connected
    this.start.addAdjacent(this.end.id);
    this.end.addAdjacent(this.start.id);

    this.setCoordinates(coordinates);
  }

  /**
   * Network element type: `edge` for edges, `node` for nodes.
   * @public
   * @type {String}
   */
  get type() {
    return 'edge';
  }

  /**
   * `True` if the edge is disconnected from the network (start and end nodes are not adjacent), otherwise `False`
   * @public
   * @type {Boolean}
   */
  get leaf() {
    return this.start.adjacent.indexOf(this.end.id) < 0 && this.end.adjacent.indexOf(this.start.id) < 0;
  }

  setStart(newStart) {
    // remove connectivity to the previous node
    this.end.removeAdjacent(this.start.id);
    this.start.removeAdjacent(this.end.id);

    this.start = newStart;

    // add connectivity to the new node
    this.start.addAdjacent(this.end.id);
    this.end.addAdjacent(this.start.id);

    this.coordinates[0] = this.start.coordinates;
    this._calculateBounds();
  }

  setEnd(newEnd) {
    // remove connectivity to the previous node
    this.start.removeAdjacent(this.end.id);
    this.end.removeAdjacent(this.start.id);

    this.end = newEnd;

    // add connectivity to the new node
    this.end.addAdjacent(this.start.id);
    this.start.addAdjacent(this.end.id);

    this.coordinates[this.vertexCount - 1] = this.end.coordinates;
    this._calculateBounds();
  }

  /**
   * This method simply updates the coordinates array of this edge. If you
   * plan to update start/end nodes as well, call `setStart` or `setEnd`
   * before or after calling this method.
   * @param {Array.<Number>} coordinates
   */
  setCoordinates(coordinates) {
    this.coordinates = [...coordinates];
    this.vertexCount = this.coordinates.length;

    this._calculateBounds();
  }

  clone(resetId = true) {
    return new Edge(this.coordinates, this.start, this.end, resetId ? getEdgeId() : this.id);
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
