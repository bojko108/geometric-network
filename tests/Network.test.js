import { assert } from 'chai';
import data from './data/data.json';
import alabak from './data/alabak.json';
import Network from '../src/Network/Network';
import Edge from '../src/Network/Edge';
import Node from '../src/Network/Node';
import * as events from '../src/Events/Events';

describe('Network tests', () => {
  it('Should create a network', () => {
    const network = new Network(16);
    assert.isDefined(network);
  });

  it('Should create a network from GeoJSON', () => {
    const network = new Network([], 16);
    network.addFromGeoJSON(data);
    assert.isDefined(network);
    const elements = network.all('edge');
    assert.equal(elements.length, data.features.length);
  });

  it('Should export the network in GeoJSON', () => {
    const network = new Network([], 16);
    network.addFromGeoJSON(data);
    const elements = network.all();
    const json = network.toGeoJSON('network');
    assert.isDefined(json);
    assert.equal(json.type, 'FeatureCollection');
    assert.equal(json.name, 'network');
    assert.equal(json.features.length, elements.length);
  });
});
