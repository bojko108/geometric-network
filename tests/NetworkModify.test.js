import { assert } from 'chai';
import data from './data/data.json';
import alabak from './data/alabak.json';
import Network from '../src/Network/Network';
import Edge from '../src/Network/Edge';
import Node from '../src/Network/Node';
import * as events from '../src/Events/Events';

describe('Network Modifications tests', () => {
  let network;

  beforeEach(() => {
    network = new Network();
    assert.isDefined(network);
  });

  it('Should add a new edge', () => {
    assert.equal(network.all().length, 0);

    network.addEdge(data.features[0].geometry.coordinates);
    assert.equal(network.all().length, 3);
    assert.equal(network.all('edge').length, 1);
    assert.equal(network.all('node').length, 2);

    network.addEdge(data.features[1].geometry.coordinates);
    assert.equal(network.all().length, 5);
    assert.equal(network.all('edge').length, 2);
    assert.equal(network.all('node').length, 3);
  });

  it('Should remove an edge', () => {
    assert.equal(network.all().length, 0);

    data.features.forEach(f => {
      network.addEdge(f.geometry.coordinates);
    });

    assert.equal(network.all().length, 12);
    assert.equal(network.all('edge').length, 5);
    assert.equal(network.all('node').length, 7);

    network.removeEdgeById(2);
    assert.equal(network.all().length, 11);
    assert.equal(network.all('edge').length, 4);
    assert.equal(network.all('node').length, 7);

    const edge1 = network.getEdgeById(1);
    assert.isDefined(edge1);
    const edge4 = network.getEdgeById(4);
    assert.isDefined(edge4);
    const edge5 = network.getEdgeById(5);
    assert.isDefined(edge5);

    assert.deepEqual(edge1.start.adjacent, [edge1.end.id]);
    assert.deepEqual(edge1.end.adjacent, [edge1.start.id]);
    assert.isTrue(edge1.leaf);
  });

  it('Should add a new edge with start at existing node', () => {
    assert.equal(network.all().length, 0);
    const coordinates = [...data.features[2].geometry.coordinates];
    coordinates[0] = [23.990385361315976, 42.18143922833228];

    const edge5 = network.addEdge(data.features[4].geometry.coordinates);
    assert.equal(network.all().length, 3);
    assert.equal(network.all('edge').length, 1);
    assert.equal(network.all('node').length, 2);

    const edge3 = network.addEdge(coordinates);
    assert.equal(network.all().length, 5);
    assert.equal(network.all('edge').length, 2);
    assert.equal(network.all('node').length, 3);

    const newEdge = network.getEdgeById(3);
    assert.isUndefined(newEdge);

    assert.equal(edge5.start, edge3.start);
    assert.deepEqual(edge5.start.adjacent, [edge5.end.id, edge3.end.id]);
    assert.deepEqual(edge5.end.adjacent, [edge5.start.id]);
    assert.deepEqual(edge3.start.adjacent, [edge5.end.id, edge3.end.id]);
    assert.deepEqual(edge3.end.adjacent, [edge3.start.id]);
  });

  it('Should add a new edge with end at existing node', () => {
    assert.equal(network.all().length, 0);
    const coordinates = [...data.features[2].geometry.coordinates];
    coordinates[coordinates.length - 1] = [23.900385116773919, 42.120830691660522];

    const edge1 = network.addEdge(data.features[0].geometry.coordinates);
    assert.equal(network.all().length, 3);
    assert.equal(network.all('edge').length, 1);
    assert.equal(network.all('node').length, 2);

    const edge3 = network.addEdge(coordinates);
    assert.equal(network.all().length, 5);
    assert.equal(network.all('edge').length, 2);
    assert.equal(network.all('node').length, 3);

    assert.equal(edge1.start, edge3.end);
    assert.deepEqual(edge1.start.adjacent, [edge1.end.id, edge3.start.id]);
    assert.deepEqual(edge1.end.adjacent, [edge1.start.id]);
    assert.deepEqual(edge3.start.adjacent, [edge3.end.id]);
    assert.deepEqual(edge3.end.adjacent, [edge1.end.id, edge3.start.id]);
  });

  it('Should add a new edge and split existing edge at start node', () => {
    assert.equal(network.all().length, 0);
    const coordinates = [...data.features[2].geometry.coordinates];
    coordinates[0] = [23.972796923846, 42.174786508074];

    const edge5 = network.addEdge(data.features[4].geometry.coordinates);
    assert.equal(network.all().length, 3);
    assert.equal(network.all('edge').length, 1);
    assert.equal(network.all('node').length, 2);

    const edge3 = network.addEdge(coordinates);
    assert.equal(network.all().length, 7);
    assert.equal(network.all('edge').length, 3);
    assert.equal(network.all('node').length, 4);

    const newEdge = network.getEdgeById(2);
    assert.isDefined(newEdge);

    assert.equal(edge5.end, edge3.start);
    assert.equal(edge3.start, newEdge.start);
    assert.deepEqual(edge5.start.adjacent, [edge5.end.id]);
    assert.deepEqual(edge5.end.adjacent, [edge5.start.id, newEdge.end.id, edge3.end.id]);
    assert.deepEqual(edge3.start.adjacent, [edge5.start.id, newEdge.end.id, edge3.end.id]);
    assert.deepEqual(edge3.end.adjacent, [edge3.start.id]);
    assert.deepEqual(newEdge.start.adjacent, [edge5.start.id, newEdge.end.id, edge3.end.id]);
    assert.deepEqual(newEdge.end.adjacent, [newEdge.start.id]);
  });

  it('Should add a new edge and split existing edge at end node', () => {
    assert.equal(network.all().length, 0);
    const coordinates = [...data.features[2].geometry.coordinates];
    coordinates[coordinates.length - 1] = [23.907648420288, 42.143983596599];

    const edge1 = network.addEdge(data.features[0].geometry.coordinates);
    assert.equal(network.all().length, 3);
    assert.equal(network.all('edge').length, 1);
    assert.equal(network.all('node').length, 2);

    const edge3 = network.addEdge(coordinates);
    assert.equal(network.all().length, 7);
    assert.equal(network.all('edge').length, 3);
    assert.equal(network.all('node').length, 4);

    const newEdge = network.getEdgeById(2);
    assert.isDefined(newEdge);

    assert.equal(edge1.end, edge3.end);
    assert.equal(edge3.end, newEdge.start);
    assert.deepEqual(edge1.start.adjacent, [edge1.end.id]);
    assert.deepEqual(edge1.end.adjacent, [edge1.start.id, newEdge.end.id, edge3.start.id]);
    assert.deepEqual(edge3.start.adjacent, [edge3.end.id]);
    assert.deepEqual(edge3.end.adjacent, [edge1.start.id, newEdge.end.id, edge3.start.id]);
    assert.deepEqual(newEdge.start.adjacent, [edge1.start.id, newEdge.end.id, edge3.start.id]);
    assert.deepEqual(newEdge.end.adjacent, [newEdge.start.id]);
  });

  it('Should split two edges at intersection point', () => {
    assert.equal(network.all().length, 0);
    const coordinates1 = [[0, 0], [5, 5]];
    const coordinates2 = [[0, 5], [5, 0]];

    const edge1 = network.addEdge(coordinates1);
    assert.equal(network.all().length, 3);
    assert.equal(network.all('edge').length, 1);
    assert.equal(network.all('node').length, 2);

    const edge2 = network.addEdge(coordinates2);
    assert.equal(network.all().length, 6);
    assert.equal(network.all('edge').length, 2);
    assert.equal(network.all('node').length, 4);

    const edge5 = network.addEdge([[2.5, 2.5], [2.5, 5]]);
    assert.equal(network.all().length, 11);
    assert.equal(network.all('edge').length, 5);
    assert.equal(network.all('node').length, 6);

    const edge3 = network.getEdgeById(3);
    assert.isDefined(edge3);
    const edge4 = network.getEdgeById(4);
    assert.isDefined(edge4);

    assert.equal(edge1.end, edge5.start);
    assert.equal(edge2.end, edge5.start);
    assert.equal(edge3.start, edge5.start);
    assert.equal(edge4.start, edge5.start);
    assert.deepEqual(edge1.start.adjacent, [edge3.start.id]);
    assert.deepEqual(edge2.start.adjacent, [edge3.start.id]);
    assert.deepEqual(edge3.end.adjacent, [edge3.start.id]);
    assert.deepEqual(edge4.end.adjacent, [edge3.start.id]);
    assert.deepEqual(edge5.end.adjacent, [edge3.start.id]);
    assert.deepEqual(edge3.start.adjacent, [edge1.start.id, edge3.end.id, edge2.start.id, edge4.end.id, edge5.end.id]);
    debugger;
    let node = network.getNodeById(6);
    network.updateNode(5, [4, 2.5]);

    let a = JSON.stringify(network.toGeoJSON('asd'));

    // network.removeEdgeById(5);

    // assert.equal(network.all().length, 9);
    // assert.equal(network.all('edge').length, 4);
    // assert.equal(network.all('node').length, 5);
    // assert.deepEqual(edge3.start.adjacent, [edge1.start.id, edge3.end.id, edge2.start.id, edge4.end.id]);
  });

  it('Should update a node and all connected edges', () => {
    assert.equal(network.all().length, 0);
    const coordinates1 = [[0, 0], [5, 5]];
    const coordinates2 = [[0, 5], [5, 0]];

    const edge1 = network.addEdge(coordinates1);
    assert.equal(network.all().length, 3);
    assert.equal(network.all('edge').length, 1);
    assert.equal(network.all('node').length, 2);

    const edge2 = network.addEdge(coordinates2);
    assert.equal(network.all().length, 6);
    assert.equal(network.all('edge').length, 2);
    assert.equal(network.all('node').length, 4);

    const edge5 = network.addEdge([[2.5, 2.5], [2.5, 5]]);
    assert.equal(network.all().length, 11);
    assert.equal(network.all('edge').length, 5);
    assert.equal(network.all('node').length, 6);

    const edge3 = network.getEdgeById(3);
    assert.isDefined(edge3);
    const edge4 = network.getEdgeById(4);
    assert.isDefined(edge4);

    assert.equal(edge1.end, edge5.start);
    assert.equal(edge2.end, edge5.start);
    assert.equal(edge3.start, edge5.start);
    assert.equal(edge4.start, edge5.start);
    assert.deepEqual(edge1.start.adjacent, [edge3.start.id]);
    assert.deepEqual(edge2.start.adjacent, [edge3.start.id]);
    assert.deepEqual(edge3.end.adjacent, [edge3.start.id]);
    assert.deepEqual(edge4.end.adjacent, [edge3.start.id]);
    assert.deepEqual(edge5.end.adjacent, [edge3.start.id]);
    assert.deepEqual(edge3.start.adjacent, [edge1.start.id, edge3.end.id, edge2.start.id, edge4.end.id, edge5.end.id]);

    // UDPATE A NODE: node with ID 6 is edge5.start
    network.updateNode(5, [4, 2.5]);

    assert.equal(edge1.end, edge5.start);
    assert.equal(edge2.end, edge5.start);
    assert.equal(edge3.start, edge5.start);
    assert.equal(edge4.start, edge5.start);
    assert.deepEqual(edge1.coordinates[edge1.vertexCount - 1], edge5.start.coordinates);
    assert.deepEqual(edge2.coordinates[edge2.vertexCount - 1], edge5.start.coordinates);
    assert.deepEqual(edge3.coordinates[0], edge5.start.coordinates);
    assert.deepEqual(edge4.coordinates[0], edge5.start.coordinates);

    let a = JSON.stringify(network.toGeoJSON('asd'));

    // network.removeEdgeById(5);

    // assert.equal(network.all().length, 9);
    // assert.equal(network.all('edge').length, 4);
    // assert.equal(network.all('node').length, 5);
    // assert.deepEqual(edge3.start.adjacent, [edge1.start.id, edge3.end.id, edge2.start.id, edge4.end.id]);
  });

  it('Should update all edges when start node is moved', () => {
    assert.equal(network.all().length, 0);

    // except edge.leaf = true
  });

  it('Should update all edges when end node is moved', () => {
    assert.equal(network.all().length, 0);

    // except edge.leaf = true
  });
});
