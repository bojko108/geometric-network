import { assert } from 'chai';
import Node from '../src/Network/Node';

describe('Node tests', () => {
  let node;
  const coordinates = [24.12029027938842773, 42.15276002883911133];

  beforeEach(() => {
    node = new Node(coordinates);
  });

  it('Should create a node', () => {
    assert.isDefined(node);
    assert.equal(node.type, 'node');
    assert.equal(node.x, coordinates[0]);
    assert.equal(node.y, coordinates[1]);
    assert.equal(node.maxX, coordinates[0]);
    assert.equal(node.minX, coordinates[0]);
    assert.equal(node.maxY, coordinates[1]);
    assert.equal(node.minY, coordinates[1]);
  });

  it('Should update coordinates of a node', () => {
    const newCoordinates = [124.12029027938842773, 142.15276002883911133];
    node.setCoordinates(newCoordinates);

    assert.isDefined(node);
    assert.equal(node.type, 'node');
    assert.equal(node.x, newCoordinates[0]);
    assert.equal(node.y, newCoordinates[1]);
    assert.equal(node.maxX, newCoordinates[0]);
    assert.equal(node.minX, newCoordinates[0]);
    assert.equal(node.maxY, newCoordinates[1]);
    assert.equal(node.minY, newCoordinates[1]);
  });

  // it('Should clone a node', () => {
  //   const coordinates = [24.12029027938842773, 42.15276002883911133];
  //   const newCoordinates = [[0, 0], [1, 1]];

  //   const node = new Node(coordinates);
  //   const cloned = node.clone();

  //   assert.isDefined(cloned);

  //   cloned.setCoordinates(newCoordinates);

  //   assert.deepEqual(node.coordinates, coordinates);
  //   assert.deepEqual(cloned.coordinates, newCoordinates);
  // });
});
