let nodesIdIndex = 0;
let edgesIdIndex = 0;

export const resetIndices = () => {
  nodesIdIndex = 0;
  edgesIdIndex = 0;
};

export const getNodeId = () => {
  return ++nodesIdIndex;
};

export const getEdgeId = () => {
  return ++edgesIdIndex;
};
