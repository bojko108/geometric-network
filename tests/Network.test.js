import { assert } from 'chai';
import data from './data/data.json';
import alabak from './data/alabak.json';
import Network from '../src/Network/Network';
import Edge from '../src/Network/Edge';
import * as events from '../src/Events/Events';

describe('Network tests', () => {
  it('TEST WITH ALABAK DATA', () => {
    const network = Network.fromGeoJSON(alabak, 16);
    assert.isDefined(network);

    assert.equal(network.all().length, 191);
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
    // elements.forEach(e => {
    //   console.log(`edge: ${e.id}; on start: ${e.start.getEdges().join(',')}; on end: ${e.end.getEdges().join(',')}`);
    // });
    // no splits are made while the network is created
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

  it('Should get multiple edges by ID', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);

    let result = network.getEdges([1, 2, 5]);
    assert.isDefined(result);
    assert.isArray(result);
    assert.equal(result.length, 3);
    assert.equal(result[0].id, 1);
    assert.equal(result[1].id, 2);
    assert.equal(result[2].id, 5);

    result = network.getEdges([4124, 424, 1, 321]);
    assert.isDefined(result);
    assert.isArray(result);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 1);
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

  it(`Should split existing edge at intersection point`, () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    assert.equal(network.all().length, edges.length);
    network.updateEdge(3, [
      [23.959789007623126, 42.143288260152296],
      [23.942764721830976, 42.133689460716298],
      [23.9246537794989, 42.131153928789807],
      [23.907913863294088, 42.1443011801952]
    ]);
    assert.equal(network.all().length, edges.length + 1);
  });

  it(`Should update all connected edges`, () => {
    debugger;
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    assert.equal(network.all().length, edges.length);
    const movePoint = [23.95213, 42.17279];
    network.updateEdge(5, [[23.990385361315976, 42.18143922833228], movePoint]);
    assert.equal(network.all().length, edges.length);

    // edges 4 and 2 are updated as they are connected
    const edge2 = network.getEdge(2);
    const edge4 = network.getEdge(4);
    const edge5 = network.getEdge(5);
    assert.deepEqual(movePoint, edge2.start.coordinates);
    assert.deepEqual(movePoint, edge4.end.coordinates);
    assert.deepEqual(movePoint, edge5.end.coordinates);
  });

  it(`Should update all connected edges + split an existing edge`, () => {
    debugger;
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);
    assert.equal(network.all().length, edges.length);
    const movePoint = [23.95168102709, 42.13871673917];
    network.updateEdge(5, [[23.990385361315976, 42.18143922833228], movePoint]);
    assert.equal(network.all().length, edges.length + 1);

    // edge 3 is splitted to 3 and 6
    // edges 4 and 2 are updated as they are connected
    const edge2 = network.getEdge(2);
    const edge3 = network.getEdge(3);
    const edge4 = network.getEdge(4);
    const edge5 = network.getEdge(5);
    const edge6 = network.getEdge(6);
    assert.deepEqual(movePoint, edge2.start.coordinates);
    assert.deepEqual(movePoint, edge3.end.coordinates);
    assert.deepEqual(movePoint, edge4.end.coordinates);
    assert.deepEqual(movePoint, edge5.end.coordinates);
    assert.deepEqual(movePoint, edge6.start.coordinates);

    // const elements = network.all();
    // assert.isArray(elements);
    // elements.forEach(e => {
    //   console.log(`edge: ${e.id}; on start: ${e.start.getEdges().join(',')}; on end: ${e.end.getEdges().join(',')}`);
    // });
  });

  it('Should fill adjacency in the network', () => {
    const edges = data.features.map(f => f.geometry.coordinates);
    const network = new Network(edges, 16);

    const edge1 = network.getEdge(1);
    assert.deepEqual(edge1.start.getEdges(), []);
    assert.deepEqual(edge1.end.getEdges(), [2]);
    const edge2 = network.getEdge(2);
    assert.deepEqual(edge2.start.getEdges(), [4, 5]);
    assert.deepEqual(edge2.end.getEdges(), [1]);
    const edge3 = network.getEdge(3);
    assert.deepEqual(edge3.start.getEdges(), []);
    assert.deepEqual(edge3.end.getEdges(), []);
    const edge4 = network.getEdge(4);
    assert.deepEqual(edge4.start.getEdges(), []);
    assert.deepEqual(edge4.end.getEdges(), [2, 5]);
    const edge5 = network.getEdge(5);
    assert.deepEqual(edge5.start.getEdges(), []);
    assert.deepEqual(edge5.end.getEdges(), [2, 4]);

    // insert a new edge and check updated adjecency for existing edges
    const edge6 = network.addEdge([edge1.start.coordinates, edge3.start.coordinates]);
    assert.deepEqual(edge6.start.getEdges(), [1]);
    assert.deepEqual(edge6.end.getEdges(), [3]);
    assert.deepEqual(edge1.start.getEdges(), [6]);
    assert.deepEqual(edge1.end.getEdges(), [2]);
    assert.deepEqual(edge3.start.getEdges(), [6]);
    assert.deepEqual(edge3.end.getEdges(), []);
  });

  it('Should save the network in GeoJSON format', () => {
    const edges = data.features.map(f => f.geometry.coordinates);

    const network = new Network(edges, 16);
    const json = network.toGeoJSON();
    assert.isDefined(json);
  });

  it('Should throw error when updating non existing edge', () => {
    const network = new Network(null, 16);
    assert.throws(() => {
      network.updateEdge(1, []);
    }, 'InvalidArgument: edge with ID: 1 was not found in the network');
  });

  it('Should throw error when removing non existing edge', () => {
    const network = new Network(null, 16);
    assert.throws(() => {
      network.removeEdgeById(1);
    }, 'InvalidArgument: edge with ID: 1 was not found in the network');
  });

  it('Should throw error when bbox is invalid', () => {
    const network = new Network(null, 16);
    assert.throws(() => {
      network.findEdgesIn([23.9467]);
    }, 'InvalidArgument: bbox must be defined as - [minX, minY, maxX, maxY]');
  });
});
