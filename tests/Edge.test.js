import { assert } from 'chai';
import Edge from '../src/Network/Edge';
import Node from '../src/Network/Node';
import data from './data/data.json';

describe('Edge tests', () => {
  it('Should create an edge', () => {
    const minX = 23.900385116773919;
    const minY = 42.120830691660522;
    const maxX = 23.930630390468483;
    const maxY = 42.150894855931774;
    const coordinates = data.features[0].geometry.coordinates;

    const edge = new Edge(coordinates);

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

  it('Should clone an edge', () => {
    const coordinates = data.features[0].geometry.coordinates;
    const newCoordinates = [[0, 0], [1, 1]];

    const edge = new Edge(coordinates);
    const cloned = edge.clone();

    assert.isDefined(cloned);

    cloned.setStart(new Node(newCoordinates[0]));
    cloned.setEnd(new Node(newCoordinates[1]));
    cloned.setCoordinates(newCoordinates);

    assert.equal(cloned.id, edge.id);
    assert.deepEqual(edge.coordinates, coordinates);
    assert.deepEqual(cloned.coordinates, newCoordinates);
  });
});
