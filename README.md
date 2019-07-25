# Geometric Network

Library for creating and managing geometric networks. This library can be usd for managing features participating in a network. All upates to the geometry of the features inside the network are managed internaly and the connectivity between the elements is checked. You can `add, remove, update, split` elements using the appropriate methods.

## Install

You can install it with NPM (`npm install bojko108/geometric-network`) or Yarn (`yarn add bojko108/geometric-network`):

```js
import { Network, events } from 'geometric-network';

// create the network
const network = new Network();
network.addFromGeoJSON(json); // add elements from a GeoJSON file
network.addNode(coordinates); // add a single node to the network
network.addEdge(coordinates); // add a single edge to the network
```

## Network events

The network emits some events that can be used for keeping track of any changes made to it. Following events are emitted:

- `ADD_EDGE`
- `REMOVE_EDGE`
- `UPDATE_EDGE`
- `SPLIT_EDGE`
- `CONNECT_EDGE`
- `DISCONNECT_EDGE`
- `ADD_NODE`
- `REMOVE_NODE`
- `UPDATE_NODE`

### Listening to events

```js
import { Network, events } from 'geometric-network';

// create the network
const network = new Network();
network.events.on(events.ADD_EDGE, callback);
```

### ADD_EDGE event

### REMOVE_EDGE event

### UPDATE_EDGE event

### SPLIT_EDGE event

## Creating a network

A network can be created empty or from edges in GeoJSON format.

### Create empty

```js
import { Network } from 'geometric-network';

const network = new Network();
```

### Create from array of edges

```js
import { Network } from 'geometric-network';

const network = new Network();

for (edge in edges) {
  network.addEdge(edge);
}
```

### Create from GeoJSON

```js
import { Network } from 'geometric-network';

const network = new Network();
network.addFromGeoJSON(json);
```

## Managing network elements

### Adding an edge

```js
const network = new Network();

network.addEdge([
  /* coordinates */
]);
```

### Adding a node

```js
const network = new Network();

network.addNode([
  /* coordinates */
]);
```

## Test

Use `yarn test` to run all tests. You can also view the network in QGIS by adding:

```js
const json = network.toGeoJSON('network');
let networkAsJsonText = JSON.stringify(json);
debugger;
```

Run the debugger and copy `networkAsJsonText` value to `test/qgis/test.geojson` then open `test/qgis/test.qgs` in QGIS.

## Dependencies

- [rbush](https://github.com/bojko108/rbush) - forked from [mourner/rbush](https://github.com/mourner/rbush)

## License

transformations is [MIT](https://github.com/bojko108/transformations/tree/master/LICENSE) License @ bojko108
