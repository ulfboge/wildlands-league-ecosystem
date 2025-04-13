// Define AOI
var aoi = /* your AOI geometry */;

// Load Hansen Global Forest Change dataset
var hansen = ee.Image('UMD/hansen/global_forest_change_2023_v1_11');
var treeCover2000 = hansen.select('treecover2000');
var loss = hansen.select('lossyear').gt(0).selfMask();
var gain = hansen.select('gain').selfMask();

// Load GLAD GLCLU Forest Type (2000–2020)
var glclcu = ee.Image('projects/glad/GLCLU2020/Forest_type');

// Canada's forest definition: ≥30% canopy cover
var canadianForest = treeCover2000.gte(30);

// Calculate areas (in hectares)
var pixelArea = ee.Image.pixelArea().divide(10000);

var stableForest = glclcu.eq(1);
var stableForestArea = stableForest.multiply(pixelArea).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});

var canadaForestArea = canadianForest.multiply(pixelArea).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});

var lossArea = loss.multiply(pixelArea).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});

var gainArea = gain.multiply(pixelArea).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});

// Print results
print('Stable Forest Area (GLCLU, ha):', stableForestArea.get('Forest_type'));
print('Canada Definition Forest Area (ha):', canadaForestArea.get('treecover2000'));
print('Forest Loss Area (ha):', lossArea.get('lossyear'));
print('Forest Gain Area (ha):', gainArea.get('gain'));

// Visualization
Map.centerObject(aoi, 9);
Map.addLayer(stableForest.updateMask(stableForest), {palette: ['green']}, 'Stable Forest (GLCLU)');
Map.addLayer(canadianForest.updateMask(canadianForest), {palette: ['darkgreen']}, 'Canada Definition Forest');
Map.addLayer(loss, {palette: 'red'}, 'Forest Loss');
Map.addLayer(gain, {palette: 'blue'}, 'Forest Gain');
