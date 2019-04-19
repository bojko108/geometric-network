import { assert } from 'chai';
import data from './data/data.json';
import alabak from './data/alabak.json';
import Network from '../src/Network/Network';
import Edge from '../src/Network/Edge';
import Node from '../src/Network/Node';
import * as events from '../src/Events/Events';
import { findPath } from '../src/Search/Search';

describe('Network tests', () => {
  it('TEST WITH ALABAK DATA', () => {
    const network = Network.fromGeoJSON(alabak, 16);
    assert.isDefined(network);
    assert.equal(network.all('edge').length, 190);
    // const elements = network.all();
    // assert.isArray(elements);
    // elements.forEach(e => {
    //   console.log(`edge: ${e.id}; on start: ${e.start.getEdges().join(',')}; on end: ${e.end.getEdges().join(',')}`);
    // });
    // console.log(alabak.features.length);
    // console.log(elements.length);
  });
  it('Should create a network', () => {
    const network = new Network(null, 16);
    assert.isDefined(network);
  });
  it('Should add new edge to the network', () => {
    const network = new Network(null, 16);
    debugger;
    const edge1 = network.addEdge([
      [23.900385116773919, 42.120830691660522],
      [23.903282867547048, 42.138760524569278],
      [23.913424995253013, 42.150894855931774],
      [23.930630390468483, 42.146729339195396]
    ]);
    const edge2 = network.addEdge([
      [23.952725740113618, 42.167194704030642],
      [23.948198004530596, 42.147091558042035],
      [23.930630390468483, 42.146729339195396]
    ]);
  });
  it('Should create a network from GeoJSON', () => {
    const network = Network.fromGeoJSON(data, 16);
    assert.isDefined(network);
    const elements = network.all('edge');
    assert.equal(elements.length, data.features.length);
    const json = network.toGeoJSON();
    assert.isDefined(json);
  });
  it('Should get all edges from the network', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    const elements = network.all('edge');
    assert.isArray(elements);
    // no splits are made while the network is created
    assert.equal(elements.length, edges.length);
  });
  it('Should get edge by ID', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    const elements = network.all('edge');
    const result = network.getEdge(elements[0].id);
    assert.isDefined(result);
    assert.isNotArray(result);
    assert.isTrue(result instanceof Edge);
    assert.isTrue(result === elements[0]);
    // should be undefined
    assert.isTrue(!network.getEdge(1123));
  });
  it('Should get multiple edges by ID', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    const elements = network.all('edge');
    let result = network.getEdges([elements[0].id, elements[1].id, elements[2].id]);
    assert.isDefined(result);
    assert.isArray(result);
    assert.equal(result.length, 3);
    assert.isTrue(result[0] === elements[0]);
    assert.isTrue(result[1] === elements[1]);
    assert.isTrue(result[2] === elements[2]);
    result = network.getEdges([4124, 424, elements[0].id, 321]);
    assert.isDefined(result);
    assert.isArray(result);
    assert.equal(result.length, 1);
    assert.isTrue(result[0] === elements[0]);
  });
  it('Should get all edges at specified coordinates', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    const result = network.findEdgesAt([23.930630390468483, 42.146729339195396]);
    assert.isArray(result);
    assert.equal(result.length, 2);
    for (let i = 0; i < result.length; i++) {
      assert.isTrue(result[i] instanceof Edge);
    }
  });
  it('Should get all edges intersecting bbox defined as object', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    const result = network.findEdgesIn({ minX: 23.9467, minY: 42.1637, maxX: 23.9595, maxY: 42.172 });
    assert.isArray(result);
    assert.equal(result.length, 3);
    for (let i = 0; i < result.length; i++) {
      assert.isTrue(result[i] instanceof Edge);
    }
  });
  it('Should get all edges intersecting bbox defined as array', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    const result = network.findEdgesIn([23.9467, 42.1637, 23.9595, 42.172]);
    assert.isArray(result);
    assert.equal(result.length, 3);
    for (let i = 0; i < result.length; i++) {
      assert.isTrue(result[i] instanceof Edge);
    }
  });
  it(`Should add a new edge and emit ${events.ADD_EDGE} event`, done => {
    const edge = data.features[0].geometry.coordinates;
    const network = new Network(null, 16);
    network.events.on(events.ADD_EDGE, edge => {
      assert.isTrue(edge instanceof Edge);
      assert.equal(network.all('edge').length, 1);
      done();
    });
    network.addEdge(edge);
  });
  it(`Should update an edge and emit ${events.UPDATE_EDGE} event`, done => {
    const newCoordinates = [
      [23.959789007623126, 42.143288260152296],
      [23.943670268947578, 42.117208503194114],
      [23.9246537794989, 42.131153928789807]
    ];
    const edge = data.features[2].geometry.coordinates;
    const network = new Network([edge], 16);
    network.events.on(events.UPDATE_EDGE, (oldEdge, newEdge) => {
      assert.deepEqual(newEdge.coordinates, newCoordinates);
      assert.notDeepEqual(oldEdge.coordinates, newCoordinates);
      assert.equal(network.all('edge').length, 1);
      done();
    });
    const elements = network.all().filter(e => e.type === 'edge');
    network.updateEdge(elements[0].id, newCoordinates);
  });
  it('Should remove multiple edges from the network', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    const coords = [23.952725740113618, 42.167194704030642];
    const foundEdges = network.findEdgesAt(coords);
    network.removeEdges(coords);
    assert.equal(network.all('edge').length, edges.length - foundEdges.length);
    const json = network.toGeoJSON();
    assert.isDefined(json);
  });
  it(`Should remove an edge from the network and emit ${events.REMOVE_EDGE} event`, done => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    network.events.on(events.REMOVE_EDGE, edge => {
      assert.isTrue(edge instanceof Edge);
      assert.equal(network.all('edge').length, edges.length - 1);
      done();
    });
    const elements = network.all('edge');
    const edge = network.getEdge(elements[0].id);
    assert.isTrue(network.removeEdge(edge));
    assert.isTrue(network.removeEdge({}));
  });
  it(`Should update all connected edges`, () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    assert.equal(network.all('edge').length, edges.length);
    const elements = network.all('edge');
    const movePoint = [23.95213, 42.17279];
    network.updateEdge(elements[4].id, [[23.990385361315976, 42.18143922833228], movePoint]);
    assert.equal(network.all('edge').length, edges.length);
    // edges 4 and 2 are updated as they are connected
    const edge2 = network.getEdge(elements[1].id);
    const edge4 = network.getEdge(elements[3].id);
    const edge5 = network.getEdge(elements[4].id);
    assert.deepEqual(movePoint, edge2.start.coordinates);
    assert.deepEqual(movePoint, edge4.end.coordinates);
    assert.deepEqual(movePoint, edge5.end.coordinates);
    const json = network.toGeoJSON();
    assert.isDefined(json);
    debugger;
  });
  it(`Should split existing edge at intersection point`, () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    assert.equal(network.all('edge').length, edges.length);
    const elements = network.all('edge');
    network.updateEdge(elements[2].id, [
      [23.959789007623126, 42.143288260152296],
      [23.942764721830976, 42.133689460716298],
      [23.9246537794989, 42.131153928789807],
      [23.907913863294088, 42.1443011801952]
    ]);
    assert.equal(network.all().filter(e => e.type === 'edge').length, edges.length + 1);
    const json = network.toGeoJSON();
    assert.isDefined(json);
  });
  it(`Should update all connected edges + split an existing edge`, () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    assert.equal(network.all('edge').length, edges.length);
    let elements = network.all('edge');
    debugger;
    let json = network.toGeoJSON();
    assert.isDefined(json);
    const movePoint = [23.95168102709, 42.13871673917];
    network.updateEdge(elements[4].id, [[23.990385361315976, 42.18143922833228], movePoint]);
    assert.equal(network.all('edge').length, edges.length + 1);
    json = network.toGeoJSON();
    assert.isDefined(json);
    elements = network.all('edge');
    debugger;
    // edge 3 is splitted to 3 and 6
    // edges 4 and 2 are updated as they are connected
    const edge2 = network.getEdge(elements[1].id);
    const edge3 = network.getEdge(elements[2].id);
    const edge4 = network.getEdge(elements[3].id);
    const edge5 = network.getEdge(elements[4].id);
    const edge6 = network.getEdge(elements[5].id);
    assert.deepEqual(movePoint, edge2.end.coordinates);
    assert.deepEqual(movePoint, edge3.end.coordinates);
    assert.deepEqual(movePoint, edge4.start.coordinates);
    assert.deepEqual(movePoint, edge5.start.coordinates);
    assert.deepEqual(movePoint, edge6.end.coordinates);
    // const elements = network.all();
    // assert.isArray(elements);
    // elements.forEach(e => {
    //   console.log(`edge: ${e.id}; on start: ${e.start.getEdges().join(',')}; on end: ${e.end.getEdges().join(',')}`);
    // });
  });
});
