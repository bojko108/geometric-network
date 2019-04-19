import { assert } from 'chai';
import Edge from '../src/Network/Edge';
import Node from '../src/Network/Node';
import data from './data/data.json';

describe('Edge tests', () => {
  let edge;
  let minX = 23.900385116773919;
  let minY = 42.120830691660522;
  let maxX = 23.930630390468483;
  let maxY = 42.150894855931774;
  let coordinates = data.features[0].geometry.coordinates;

  beforeEach(() => {
    let startNode = new Node(coordinates[0]);
    let endNode = new Node(coordinates[coordinates.length - 1]);
    edge = new Edge(coordinates, startNode, endNode);
  });

  it('Should create an edge', () => {
    assert.isDefined(edge);
    assert.equal(edge.type, 'edge');
    assert.equal(edge.coordinates.length, coordinates.length);
    assert.equal(edge.maxX, maxX);
    assert.equal(edge.minX, minX);
    assert.equal(edge.maxY, maxY);
    assert.equal(edge.minY, minY);
    assert.isDefined(edge.start);
    assert.isDefined(edge.end);
    assert.deepEqual(edge.start.x, coordinates[0][0]);
    assert.deepEqual(edge.start.y, coordinates[0][1]);
    assert.deepEqual(edge.end.x, coordinates[coordinates.length - 1][0]);
    assert.deepEqual(edge.end.y, coordinates[coordinates.length - 1][1]);
    assert.deepEqual(edge.start.adjacent, [edge.end.id]);
    assert.deepEqual(edge.end.adjacent, [edge.start.id]);
  });

  it('Should update coordinates of an edge', () => {
    const startCoordinates = edge.start.coordinates;
    const endCoordinates = edge.end.coordinates;
    const newCoordinates = [
      [23.900385116773919, 42.120830691660522],
      [0.123124124513, 0.12351512515],
      [100.1251651616, 100.12616125615],
      [23.930630390468483, 42.146729339195396]
    ];

    edge.setCoordinates(newCoordinates);

    assert.equal(edge.coordinates.length, newCoordinates.length);
    assert.deepEqual(edge.start.coordinates, startCoordinates);
    assert.deepEqual(edge.end.coordinates, endCoordinates);
    assert.deepEqual(edge.coordinates, newCoordinates);
    assert.deepEqual(edge.start.adjacent, [edge.end.id]);
    assert.deepEqual(edge.end.adjacent, [edge.start.id]);
  });

  it('Should update start node of an edge', () => {
    const newStartNode = new Node([0, 0]);
    edge.setStart(newStartNode);

    assert.equal(edge.start, newStartNode);
    assert.deepEqual(edge.coordinates[0], [0, 0]);
    assert.deepEqual(edge.start.adjacent, [edge.end.id]);
    assert.deepEqual(edge.end.adjacent, [edge.start.id]);
  });

  it('Should update end node of an edge', () => {
    const newEndNode = new Node([0, 0]);
    edge.setEnd(newEndNode);

    assert.equal(edge.end, newEndNode);
    assert.deepEqual(edge.coordinates[edge.vertexCount - 1], [0, 0]);
    assert.deepEqual(edge.start.adjacent, [edge.end.id]);
    assert.deepEqual(edge.end.adjacent, [edge.start.id]);
  });

  it('Should update start and end nodes of an edge', () => {
    const newStartNode = new Node([0, 0]);
    edge.setStart(newStartNode);
    const newEndNode = new Node([100, 100]);
    edge.setEnd(newEndNode);

    assert.equal(edge.start, newStartNode);
    assert.equal(edge.end, newEndNode);
    assert.deepEqual(edge.coordinates[0], [0, 0]);
    assert.deepEqual(edge.coordinates[edge.vertexCount - 1], [100, 100]);
    assert.deepEqual(edge.start.adjacent, [edge.end.id]);
    assert.deepEqual(edge.end.adjacent, [edge.start.id]);
  });

  it('Should update start/end nodes and coordinates of an edge', () => {
    const newStartNode = new Node([100.2353265236, 100.123412455]);
    edge.setStart(newStartNode);
    const newEndNode = new Node([100.2353265236, 100.123412455]);
    edge.setEnd(newEndNode);
    const newCoordinates = [
      [100.2353265236, 100.123412455],
      [23.903282867547048, 42.138760524569278],
      [23.913424995253013, 42.150894855931774],
      [100.2353265236, 100.123412455]
    ];
    edge.setCoordinates(newCoordinates);

    assert.equal(edge.start, newStartNode);
    assert.equal(edge.end, newEndNode);
    assert.deepEqual(edge.coordinates, newCoordinates);
    assert.deepEqual(edge.start.adjacent, [edge.end.id]);
    assert.deepEqual(edge.end.adjacent, [edge.start.id]);
  });
});
