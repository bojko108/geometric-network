import { assert } from 'chai';
import data from './data/data.json';
import Network from '../src/Network/Network';
import Edge from '../src/Network/Edge';
import * as events from '../src/Events/Events';

describe('Network tests', () => {
  it('Should create a network', () => {
    const network = new Network(null, 16);
    assert.isDefined(network);
  });

  it('Should create a network from GeoJSON', () => {
    const network = Network.fromGeoJSON(data, 16);
    assert.isDefined(network);
    assert.equal(network.all().length, data.features.length);
  });

  it('Should get all elements from the network', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    const elements = network.all();
    assert.isArray(elements);
    assert.equal(elements.length, edges.length);
  });

  it('Should get edge by ID', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);

    const result = network.getEdge(1);
    assert.isDefined(result);
    assert.isNotArray(result);
    assert.isTrue(result instanceof Edge);

    // should be undefined
    assert.isTrue(!network.getEdge(1123));
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

  it('Should get all edges intersecting bbox', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    const result = network.findEdgesIn({ minX: 23.9467, minY: 42.1637, maxX: 23.9595, maxY: 42.172 });

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
      assert.equal(network.all().length, 1);
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
      assert.equal(network.all().length, 1);
      done();
    });
    network.updateEdge(1, newCoordinates);
  });

  it('Should remove multiple edges from the network', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    const coords = [23.952725740113618, 42.167194704030642];
    const foundEdges = network.findEdgesAt(coords);
    network.removeEdges(coords);
    assert.equal(network.all().length, edges.length - foundEdges.length);
  });

  it(`Should remove an edge from the network and emit ${events.REMOVE_EDGE} event`, done => {
    const edges = data.features.map(f => f.geometry.coordinates);

    const network = new Network(edges, 16);
    network.events.on(events.REMOVE_EDGE, edge => {
      assert.isTrue(edge instanceof Edge);
      assert.equal(network.all().length, edges.length - 1);
      done();
    });
    const edge = network.getEdge(1);
    assert.isTrue(network.removeEdge(edge));
    assert.isTrue(network.removeEdge({}));
  });

  it('Should save the network in GeoJSON format', () => {
    const edges = data.features.map(f => f.geometry.coordinates);

    const network = new Network(edges, 16);
    const json = network.toGeoJSON();
    assert.isDefined(json);
  });
});
