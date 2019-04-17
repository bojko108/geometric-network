# Geometric Network

Library for creating and managing geometric networks. This library can be usd for managing features participating in a network. All upates to the geometry of the features inside the network are managed internaly and the connectivity between the elements is checked. You can add/remove/update/split elements using the appropriate methods.

## Install

You can install it with NPM (`npm install bojko108/geometric-network`) or Yarn (`yarn add bojko108/geometric-network`):

```js
import { Network, events } from 'geometric-network';

// create the network
const network = new Network(elements);
```

## Network events

The network emits some events that can be used for keeping track of any changes made to it. Fllowing events are emitted:

- `ADD_EDGE`
- `REMOVE_EDGE`
- `UPDATE_EDGE`
- `SPLIT_EDGE`

### Listening to events

```js
import { Network, events } from 'geometric-network';

// create the network
const network = new Network(elements);
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

const network = new Network(null, 16);
```

### Create from array of edges

```js
import { Network } from 'geometric-network';

const network = new Network([edges], 16);
```

### Create from GeoJSON

```js
import { Network } from 'geometric-network';

const network = Network.fromGeoJSON(geoJsonData, 16);
```

## Managing network elements

### Adding an edge

```js
const network = new Network(null, 16);
network.addEdge([
  /* coordinates */
]);
```

## Dependencies

- [rbush](https://github.com/bojko108/rbush) - forked from [mourner/rbush](https://github.com/mourner/rbush)

## License

transformations is [MIT](https://github.com/bojko108/transformations/tree/master/LICENSE) License @ bojko108
