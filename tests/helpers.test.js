import { assert } from 'chai';
import { coordinatesAreEqual, isOnSegment, squaredDistance, distance } from '../src/helpers';

describe('Helpers tests', () => {
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
  });
});
