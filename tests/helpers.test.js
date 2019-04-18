import { assert } from 'chai';
import { getNodeId, getEdgeId, coordinatesAreEqual, isOnSegment, split } from '../src/helpers';

describe('Helpers tests', () => {
  it('Should generate Node ID', () => {
    const id1 = getNodeId();
    const id2 = getNodeId();

    assert.notEqual(id1, id2);
    assert.equal(id2 - id1, 1);
  });
  
  it('Should generate Edge ID', () => {
    const id1 = getEdgeId();
    const id2 = getEdgeId();

    assert.notEqual(id1, id2);
    assert.equal(id2 - id1, 1);
  });

  it('Should compare coordinates', () => {
    let a = [23.90328286754705, 42.13876052456928];
    let b = [23.90328286754705, 42.13876052456928];
    let result = coordinatesAreEqual(a, b);
    assert.isTrue(result);

    a = [23.90328286754705, 42.13876052456928];
    b = [23.90328286754706, 42.13876052456928];
    result = coordinatesAreEqual(a, b);
    assert.isFalse(result);

    a = [23.90328286754706, 42.13876052456928];
    b = [23.90328286754705, 42.13876052456928];
    result = coordinatesAreEqual(a, b);
    assert.isFalse(result);

    a = [23.90328286754705, 42.13876052456929];
    b = [23.90328286754705, 42.13876052456928];
    result = coordinatesAreEqual(a, b);
    assert.isFalse(result);

    a = [23.90328286754705, 42.13876052456928];
    b = [23.90328286754705, 42.13876052456929];
    result = coordinatesAreEqual(a, b);
    assert.isFalse(result);

    a = [23.90328286754705, 42.13876052456929];
    b = [23.90328286754706, 42.13876052456928];
    result = coordinatesAreEqual(a, b);
    assert.isFalse(result);
  });

  it('Should check if point is on a segment', () => {
    const segment = [[23.9246537794989, 42.131153928789807], [23.942764721830976, 42.133689460716298]];
    let point = [23.932304930671815, 42.134475863410451];
    assert.isFalse(isOnSegment(segment, point));
    point = [23.933817973515932, 42.132436915952191];
    assert.isTrue(isOnSegment(segment, point));
    point = [23.9246537794989, 42.131153928789807];
    assert.isTrue(isOnSegment(segment, point));
  });

  it('Should split line at coordinates', () => {
    let line = [
      [23.900385116773919, 42.120830691660522],
      [23.903282867547048, 42.138760524569278],
      [23.913424995253013, 42.150894855931774],
      [23.930630390468483, 42.146729339195396]
    ];
    let splitPoint = [23.9087545456, 42.145306996];
    let result = split(line, splitPoint);
    assert.isDefined(result);
    assert.equal(result.splitIndex, 2);
    assert.equal(result.firstCoordinates.length, 3);
    assert.deepEqual(result.firstCoordinates, [
      [23.900385116773919, 42.120830691660522],
      [23.903282867547048, 42.138760524569278],
      [23.9087545456, 42.145306996]
    ]);
    assert.equal(result.secondCoordinates.length, 3);
    assert.deepEqual(result.secondCoordinates, [
      [23.9087545456, 42.145306996],
      [23.913424995253013, 42.150894855931774],
      [23.930630390468483, 42.146729339195396]
    ]);

    line = [[0, 0], [1, 1], [2, 2]];
    splitPoint = [1, 1];
    result = split(line, splitPoint);
    assert.isDefined(result);
    assert.equal(result.splitIndex, 1);
    assert.equal(result.firstCoordinates.length, 2);
    assert.deepEqual(result.firstCoordinates, [[0, 0], [1, 1]]);
    assert.equal(result.secondCoordinates.length, 2);
    assert.deepEqual(result.secondCoordinates, [[1, 1], [2, 2]]);

    line = [[0, 0], [1, 1], [2, 2]];
    splitPoint = [1.5, 1.5];
    result = split(line, splitPoint);
    assert.isDefined(result);
    assert.equal(result.splitIndex, 2);
    assert.equal(result.firstCoordinates.length, 3);
    assert.deepEqual(result.firstCoordinates, [[0, 0], [1, 1], [1.5, 1.5]]);
    assert.equal(result.secondCoordinates.length, 2);
    assert.deepEqual(result.secondCoordinates, [[1.5, 1.5], [2, 2]]);

    // split point = end point
    line = [[0, 0], [1, 1], [2, 2]];
    splitPoint = [2, 2];
    result = split(line, splitPoint);
    assert.isUndefined(result);

    // split point = start point
    line = [[0, 0], [1, 1], [2, 2]];
    splitPoint = [0, 0];
    result = split(line, splitPoint);
    assert.isUndefined(result);

    // split point not on line
    line = [[0, 0], [1, 1], [2, 2]];
    splitPoint = [5, 5];
    result = split(line, splitPoint);
    assert.isUndefined(result);
  });
});
