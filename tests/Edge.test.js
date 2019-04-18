import { assert } from 'chai';
import Edge from '../src/Network/Edge';
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
  });

  it('Should clone an edge', () => {
    const id = 1;
    const coordinates = data.features[0].geometry.coordinates;
    const newCoordinates = [[0, 0], [1, 1]];

    const edge = new Edge(coordinates);
    const cloned = edge.clone();

    assert.isDefined(cloned);

    cloned.setStart(newCoordinates[0]);
    cloned.setEnd(newCoordinates[1]);
    cloned.setCoordinates(newCoordinates);

    assert.deepEqual(edge.coordinates, coordinates);
    assert.deepEqual(cloned.coordinates, newCoordinates);
  });
});
