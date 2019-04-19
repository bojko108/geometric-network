const toFeature = element => {
  let geometry = {
    type: '',
    coordinates: []
  };

  if (element.type === 'edge') {
    geometry.type = 'LineString';
    for (let j = 0; j < element.coordinates.length; j++) {
      geometry.coordinates.push([...element.coordinates[j]]);
    }
  } else {
    geometry.type = 'Point';
    geometry.coordinates = [...element.coordinates];
  }

  const result = {
    type: 'Feature',
    id: element.id,
    geometry: geometry,
    properties: {
      fid: element.id,
      adjacent: element.type === 'node' ? element.adjacent.join(';') : '',
      minX: element.minX,
      minY: element.minY,
      maxX: element.maxX,
      maxY: element.maxY
    }
  };
  return result;
};

export const toGeoJSON = (name = 'Network', elements) => {
  let result = {
    type: 'FeatureCollection',
    name: name,
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features: []
  };

  for (let i = 0; i < elements.length; i++) {
    result.features.push(toFeature(elements[i]));
  }

  return result;
};
