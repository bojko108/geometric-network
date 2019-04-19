import { assert } from 'chai';
import data from './data/data.json';
import Network from '../src/Network/Network';

describe('Network Connectivity tests', () => {
  let network;

  beforeEach(() => {
    network = Network.fromGeoJSON(data, 16);
    const json = network.toGeoJSON();
    assert.isDefined(json);
  });

  it('Should disconnect edge #1', () => {
    const edge1 = network.getEdgeById(1);
    assert.isDefined(edge1);

    const result = network.disconnectEdge(edge1);
    assert.isDefined(result);
    assert.isTrue(result.removeStartNode);
    assert.isFalse(result.removeEndNode);

    assert.deepEqual(edge1.start.adjacent, []);
    assert.deepEqual(edge1.end.adjacent, [7]);

    assert.isTrue(edge1.leaf);
    assert.isTrue(edge1.start.terminator);
    assert.isTrue(edge1.start.orphan);
    assert.isTrue(edge1.end.terminator);
    assert.isFalse(edge1.end.orphan);
  });

  it('Should disconnect edge #2', () => {
    const edge2 = network.getEdgeById(2);
    assert.isDefined(edge2);

    const result = network.disconnectEdge(edge2);
    assert.isDefined(result);
    assert.isFalse(result.removeStartNode);
    assert.isFalse(result.removeEndNode);

    assert.deepEqual(edge2.start.adjacent, [14, 17]);
    assert.deepEqual(edge2.end.adjacent, [3]);
    // debugger;
    // assert.isTrue(network.getEdgeById(1).leaf);
    assert.isTrue(edge2.leaf);
    assert.isFalse(edge2.start.terminator);
    assert.isFalse(edge2.start.orphan);
    assert.isTrue(edge2.end.terminator);
    assert.isFalse(edge2.end.orphan);
  });

  it('Should disconnect edge #3', () => {
    const edge3 = network.getEdgeById(3);
    assert.isDefined(edge3);

    const result = network.disconnectEdge(edge3);
    assert.isDefined(result);
    assert.isTrue(result.removeStartNode);
    assert.isTrue(result.removeEndNode);

    assert.deepEqual(edge3.start.adjacent, []);
    assert.deepEqual(edge3.end.adjacent, []);

    assert.isTrue(edge3.leaf);
    assert.isTrue(edge3.start.terminator);
    assert.isTrue(edge3.start.orphan);
    assert.isTrue(edge3.end.terminator);
    assert.isTrue(edge3.end.orphan);
  });

  it('Should disconnect edge #4', () => {
    const edge4 = network.getEdgeById(4);
    assert.isDefined(edge4);

    const result = network.disconnectEdge(edge4);
    assert.isDefined(result);
    assert.isTrue(result.removeStartNode);
    assert.isFalse(result.removeEndNode);

    assert.deepEqual(edge4.start.adjacent, []);
    assert.deepEqual(edge4.end.adjacent, [4, 17]);

    assert.isTrue(edge4.leaf);
    assert.isTrue(edge4.start.terminator);
    assert.isTrue(edge4.start.orphan);
    assert.isFalse(edge4.end.terminator);
    assert.isFalse(edge4.end.orphan);
  });

  it('Should disconnect edge #5', () => {
    const edge5 = network.getEdgeById(5);
    assert.isDefined(edge5);

    const result = network.disconnectEdge(edge5);
    assert.isDefined(result);
    assert.isTrue(result.removeStartNode);
    assert.isFalse(result.removeEndNode);

    assert.deepEqual(edge5.start.adjacent, []);
    assert.deepEqual(edge5.end.adjacent, [4, 14]);

    assert.isTrue(edge5.leaf);
    assert.isTrue(edge5.start.terminator);
    assert.isTrue(edge5.start.orphan);
    assert.isFalse(edge5.end.terminator);
    assert.isFalse(edge5.end.orphan);
  });

  it('Should connect edge #1', () => {
    const edge1 = network.getEdgeById(1);
    assert.isDefined(edge1);
    network.disconnectEdge(edge1);
    assert.deepEqual(edge1.start.adjacent, []);
    assert.deepEqual(edge1.end.adjacent, [7]);
    assert.isTrue(edge1.start.orphan);
    assert.isFalse(edge1.end.orphan);

    network.connectEdge(edge1);
    assert.deepEqual(edge1.start.adjacent, [4]);
    assert.deepEqual(edge1.end.adjacent, [7, 3]);

    assert.isFalse(edge1.leaf);
    assert.isTrue(edge1.start.terminator);
    assert.isFalse(edge1.start.orphan);
    assert.isFalse(edge1.end.terminator);
    assert.isFalse(edge1.end.orphan);
  });

  it('Should connect edge #2', () => {
    const edge2 = network.getEdgeById(2);
    assert.isDefined(edge2);
    network.disconnectEdge(edge2);
    assert.deepEqual(edge2.start.adjacent, [14, 17]);
    assert.deepEqual(edge2.end.adjacent, [3]);
    assert.isFalse(edge2.start.orphan);
    assert.isFalse(edge2.end.orphan);

    network.connectEdge(edge2);
    assert.deepEqual(edge2.start.adjacent, [14, 17, 4]);
    assert.deepEqual(edge2.end.adjacent, [3, 7]);

    assert.isFalse(edge2.leaf);
    assert.isFalse(edge2.start.terminator);
    assert.isFalse(edge2.start.orphan);
    assert.isFalse(edge2.end.terminator);
    assert.isFalse(edge2.end.orphan);
  });

  it('Should connect edge #3', () => {
    const edge3 = network.getEdgeById(3);
    assert.isDefined(edge3);
    network.disconnectEdge(edge3);
    assert.deepEqual(edge3.start.adjacent, []);
    assert.deepEqual(edge3.end.adjacent, []);
    assert.isTrue(edge3.start.orphan);
    assert.isTrue(edge3.end.orphan);

    network.connectEdge(edge3);
    assert.deepEqual(edge3.start.adjacent, [11]);
    assert.deepEqual(edge3.end.adjacent, [10]);

    assert.isFalse(edge3.leaf);
    assert.isTrue(edge3.start.terminator);
    assert.isFalse(edge3.start.orphan);
    assert.isTrue(edge3.end.terminator);
    assert.isFalse(edge3.end.orphan);
  });

  it('Should connect edge #4', () => {
    const edge4 = network.getEdgeById(4);
    assert.isDefined(edge4);
    network.disconnectEdge(edge4);
    assert.deepEqual(edge4.start.adjacent, []);
    assert.deepEqual(edge4.end.adjacent, [4, 17]);
    assert.isTrue(edge4.start.orphan);
    assert.isFalse(edge4.end.orphan);

    network.connectEdge(edge4);
    assert.deepEqual(edge4.start.adjacent, [7]);
    assert.deepEqual(edge4.end.adjacent, [4, 17, 14]);

    assert.isFalse(edge4.leaf);
    assert.isTrue(edge4.start.terminator);
    assert.isFalse(edge4.start.orphan);
    assert.isFalse(edge4.end.terminator);
    assert.isFalse(edge4.end.orphan);
  });

  it('Should connect edge #5', () => {
    const edge5 = network.getEdgeById(5);
    assert.isDefined(edge5);
    network.disconnectEdge(edge5);
    assert.deepEqual(edge5.start.adjacent, []);
    assert.deepEqual(edge5.end.adjacent, [4, 14]);
    assert.isTrue(edge5.start.orphan);
    assert.isFalse(edge5.end.orphan);

    network.connectEdge(edge5);
    assert.deepEqual(edge5.start.adjacent, [7]);
    assert.deepEqual(edge5.end.adjacent, [4, 14, 17]);

    assert.isFalse(edge5.leaf);
    assert.isTrue(edge5.start.terminator);
    assert.isFalse(edge5.start.orphan);
    assert.isFalse(edge5.end.terminator);
    assert.isFalse(edge5.end.orphan);
  });
});
