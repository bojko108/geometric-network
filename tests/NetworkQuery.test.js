import { assert } from 'chai';
import data from './data/data.json';
import Network from '../src/Network/Network';
import Edge from '../src/Network/Edge';
import Node from '../src/Network/Node';

describe('Network Query tests', () => {
  let network;

  beforeEach(() => {
    network = new Network(16);
    network.addFromGeoJSON(data);
    const json = network.toGeoJSON();
    assert.isDefined(json);
  });

  it('Should get all elements from the network', () => {
    const elements = network.all();
    assert.equal(elements.length, 12);
  });

  it('Should get all edges from the network', () => {
    const elements = network.all('edge');
    assert.equal(elements.length, data.features.length);
  });

  it('Should get all edges from the network', () => {
    const elements = network.all('node');
    assert.equal(elements.length, 7);
  });

  it('Should get an edge by ID', () => {
    let id = 1;
    let edge = network.getEdgeById(id);
    assert.isDefined(edge);
    assert.isTrue(edge instanceof Edge);
    assert.equal(edge.id, id);

    id = 1234;
    edge = network.getEdgeById(id);
    assert.isUndefined(edge);
  });

  it('Should get edges by ID', () => {
    let ids = [1, 2, 3];
    let edges = network.getEdgesById(ids);
    assert.isArray(edges);
    assert.equal(edges.length, ids.length);
    for (let i = 0; i < edges.length; i++) {
      assert.isTrue(edges[i] instanceof Edge);
      assert.equal(edges[i].id, ids[i]);
    }

    ids = [1, 124, 3, 235];
    edges = network.getEdgesById(ids);
    assert.isArray(edges);
    assert.equal(edges.length, ids.length - 2);

    assert.isTrue(edges[0] instanceof Edge);
    assert.equal(edges[0].id, ids[0]);
    assert.isTrue(edges[1] instanceof Edge);
    assert.equal(edges[1].id, ids[2]);
  });

  it('Should find all elements at coordinates', () => {
    // 3 edges and 1 node at
    let node = new Node([23.95272574011361755, 42.16719470403064207]);
    let elements = network.findElementsAt(node);
    assert.isArray(elements);
    assert.equal(elements.length, 4);

    // 1 edge at
    node = new Node([23.9527257402315, 42.1671947040751]);
    elements = network.findElementsAt(node);
    assert.isArray(elements);
    assert.equal(elements.length, 1);

    // 0 elements at
    node = new Node([23.9397, 42.1589]);
    elements = network.findElementsAt(node);
    assert.isArray(elements);
    assert.equal(elements.length, 0);
  });

  it('Should find all elements in BBox', () => {
    // 5 edges and 7 nodes in
    let extent = { minX: 23.8891, minY: 42.1046, maxX: 23.9985, maxY: 42.1913 };
    let elements = network.findElementsIn(extent);
    assert.isArray(elements);
    assert.equal(elements.length, 12);

    // 1 edge and 1 node in
    extent = { minX: 23.95817, minY: 42.142077, maxX: 23.960547, maxY: 42.143932 };
    elements = network.findElementsIn(extent);
    assert.isArray(elements);
    assert.equal(elements.length, 2);

    // 1 edge in
    extent = { minX: 23.95817, minY: 42.142077, maxX: 23.959621, maxY: 42.143161 };
    elements = network.findElementsIn(extent);
    assert.isArray(elements);
    assert.equal(elements.length, 1);

    // 0 elements in
    extent = { minX: 23.960409, minY: 42.144232, maxX: 23.961576, maxY: 42.145004 };
    elements = network.findElementsIn(extent);
    assert.isArray(elements);
    assert.equal(elements.length, 0);
  });

  it('Should find all edges at coordinates', () => {
    // 3 edges at
    let node = new Node([23.95272574011361755, 42.16719470403064207]);
    let edges = network.findEdgesAt(node);
    assert.isArray(edges);
    assert.equal(edges.length, 3);

    // 1 edge at
    node = new Node([23.9527257402315, 42.1671947040751]);
    edges = network.findEdgesAt(node);
    assert.isArray(edges);
    assert.equal(edges.length, 1);

    // 0 edges at
    node = new Node([23.9397, 42.1589]);
    edges = network.findEdgesAt(node);
    assert.isArray(edges);
    assert.equal(edges.length, 0);
  });

  it('Should find all edges in BBox', () => {
    // 5 edges in
    let extent = { minX: 23.8891, minY: 42.1046, maxX: 23.9985, maxY: 42.1913 };
    let edges = network.findEdgesIn(extent);
    assert.isArray(edges);
    assert.equal(edges.length, 5);

    // 1 edge in
    extent = { minX: 23.95817, minY: 42.142077, maxX: 23.960547, maxY: 42.143932 };
    edges = network.findEdgesIn(extent);
    assert.isArray(edges);
    assert.equal(edges.length, 1);

    // 1 edge in
    extent = { minX: 23.95817, minY: 42.142077, maxX: 23.959621, maxY: 42.143161 };
    edges = network.findEdgesIn(extent);
    assert.isArray(edges);
    assert.equal(edges.length, 1);

    // 0 edges in
    extent = { minX: 23.960409, minY: 42.144232, maxX: 23.961576, maxY: 42.145004 };
    edges = network.findEdgesIn(extent);
    assert.isArray(edges);
    assert.equal(edges.length, 0);
  });

  it('Should find all nodes at coordinates', () => {
    // 1 node at
    let node = new Node([23.95272574011361755, 42.16719470403064207]);
    let nodes = network.findNodesAt(node);
    assert.isArray(nodes);
    assert.equal(nodes.length, 1);

    // 0 nodes at
    node = new Node([23.9397, 42.1589]);
    nodes = network.findNodesAt(node);
    assert.isArray(nodes);
    assert.equal(nodes.length, 0);
  });

  it('Should find all nodes in BBox', () => {
    // 7 nodes in
    let extent = { minX: 23.8891, minY: 42.1046, maxX: 23.9985, maxY: 42.1913 };
    let nodes = network.findNodesIn(extent);
    assert.isArray(nodes);
    assert.equal(nodes.length, 7);

    // 1 node in
    extent = { minX: 23.95817, minY: 42.142077, maxX: 23.960547, maxY: 42.143932 };
    nodes = network.findNodesIn(extent);
    assert.isArray(nodes);
    assert.equal(nodes.length, 1);

    // 0 nodes in
    extent = { minX: 23.960409, minY: 42.144232, maxX: 23.961576, maxY: 42.145004 };
    nodes = network.findNodesIn(extent);
    assert.isArray(nodes);
    assert.equal(nodes.length, 0);
  });
});
