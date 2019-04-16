import { assert } from 'chai';
import Node from '../src/Network/Node';

describe('Node tests', () => {
  it('Should create a node', () => {
    const coordinates = [24.12029027938842773, 42.15276002883911133];
    const node = new Node(coordinates);

    assert.isDefined(node);
    assert.equal(node.type, 'point');
    assert.equal(node.x, coordinates[0]);
    assert.equal(node.y, coordinates[1]);
    assert.equal(node.maxX, coordinates[0]);
    assert.equal(node.minX, coordinates[0]);
    assert.equal(node.maxY, coordinates[1]);
    assert.equal(node.minY, coordinates[1]);
  });
});
