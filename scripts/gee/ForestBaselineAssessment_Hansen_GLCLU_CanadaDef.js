// Define AOI
var aoi = ee.FeatureCollection('projects/ee-komba/assets/openForests/algonquin_park').geometry();

// Calculate area directly from geometry in hectares
var aoiArea = aoi.area().divide(10000);
print('AOI Area from geometry (ha):', aoiArea);

// Load Hansen Global Forest Change dataset
var hansen = ee.Image('UMD/hansen/global_forest_change_2023_v1_11');
var datamask = hansen.select('datamask').clip(aoi);
var landMask = datamask.eq(1); // 1 represents mapped land surface

// Load GLAD datasets
var glclcu_type = ee.Image('projects/glad/GLCLU2020/Forest_type').clip(aoi);
var forest_height_2000 = ee.Image('projects/glad/GLCLU2020/Forest_height_2000').clip(aoi);
var forest_extent_2000 = ee.Image('projects/glad/GLCLU2020/Forest_stable').clip(aoi);
var glad_loss = ee.Image('projects/glad/GLCLU2020/Forest_loss').clip(aoi);
var glad_gain = ee.Image('projects/glad/GLCLU2020/Forest_gain').clip(aoi);

// Get Hansen loss and gain
var hansen_loss = hansen.select('lossyear').clip(aoi);
var hansen_gain = hansen.select('gain').clip(aoi);

// Apply Canadian forest definition to GLAD data:
// 1. Height ≥ 5m (already in GLAD forest definition)
// 2. Minimum area of 1 hectare
// 3. Crown cover ≥ 25%
var kernel = ee.Kernel.square({
  radius: 5,
  units: 'pixels'
});

// Create GLAD-based forest mask using Canadian definition
var gladForest = forest_height_2000.gte(5) // Height requirement
    .updateMask(landMask);  // Remove water

// Apply minimum area requirement
gladForest = gladForest
  .reduceNeighborhood({
    reducer: ee.Reducer.mean(),
    kernel: kernel
  })
  .gt(0.5)
  .selfMask()
  .rename('glad_forest');

// Apply Canadian definition to Hansen data
var hansenForest = hansen.select('treecover2000')
    .gte(25)
    .updateMask(landMask)
    .rename('forest');  // Explicitly rename the band

// Calculate areas using pixelArea (in hectares)
var pixelArea = ee.Image.pixelArea().divide(10000);

var gladForestArea = gladForest
  .multiply(pixelArea)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 30,
    maxPixels: 1e13
  });

var hansenForestArea = hansenForest
  .multiply(pixelArea)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 30,
    maxPixels: 1e13
  });

// Calculate loss and gain areas
var gladLossArea = glad_loss.multiply(pixelArea).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 30,
    maxPixels: 1e13
});
var gladGainArea = glad_gain.multiply(pixelArea).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 30,
    maxPixels: 1e13
});
var hansenTotalLossArea = hansen_loss.gt(0).multiply(pixelArea).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 30,
    maxPixels: 1e13
});
var hansenGainArea = hansen_gain.multiply(pixelArea).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 30,
    maxPixels: 1e13
});

// Calculate total area
var totalArea = aoi.area().divide(10000);

// Convert to numbers and round
var totalAreaHa = ee.Number(totalArea).round();
var gladForestAreaHa = ee.Number(gladForestArea.get('glad_forest')).round();
var hansenForestAreaHa = ee.Number(hansenForestArea.get('forest')).round();
var gladLossAreaHa = ee.Number(gladLossArea.get('b1')).round();
var gladGainAreaHa = ee.Number(gladGainArea.get('b1')).round();
var hansenTotalLossAreaHa = ee.Number(hansenTotalLossArea.get('lossyear')).round();
var hansenGainAreaHa = ee.Number(hansenGainArea.get('gain')).round();

// Calculate percentages
var gladForestPercent = ee.Number(gladForestAreaHa)
    .divide(totalAreaHa)
    .multiply(100)
    .format('%.1f');

var hansenForestPercent = ee.Number(hansenForestAreaHa)
    .divide(totalAreaHa)
    .multiply(100)
    .format('%.1f');

// Print results
print('Area Statistics:');
print('Total Area (ha):', totalAreaHa);
print('GLAD Forest Area (Canadian Definition, ha):', gladForestAreaHa);
print('Hansen Forest Area (Canadian Definition, ha):', hansenForestAreaHa);

print('\nGLAD Change Statistics (2000-2020):');
print('GLAD Forest Loss (ha):', gladLossAreaHa);
print('GLAD Forest Gain (ha):', gladGainAreaHa);

print('\nHansen Change Statistics (2000-2023):');
print('Hansen Total Forest Loss (ha):', hansenTotalLossAreaHa);
print('Hansen Forest Gain (ha):', hansenGainAreaHa);

// Print annual loss
print('\nHansen Annual Forest Loss (ha):');
var annualLoss = ee.List.sequence(1, 23); // 2001-2023
var annualLossFeatures = annualLoss.map(function(year) {
  var yearLoss = hansen_loss.eq(ee.Number(year));
  var areaImage = yearLoss.multiply(pixelArea);
  var area = areaImage.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoi,
    scale: 30,
    maxPixels: 1e13
  });
  return ee.Feature(null, {
    'year': ee.Number(year).add(2000),
    'loss_area_ha': ee.Number(area.get('lossyear')).round()
  });
});
print(ee.FeatureCollection(annualLossFeatures));

// Visualization
Map.centerObject(aoi, 9);

// Create visualization parameters
var waterVis = {palette: ['0000FF'], opacity: 0.3};

// Define water mask from datamask
var waterMask = datamask.neq(1);

// Create masks for each GLAD Forest_type class
// The glclcu_type image has values 1-4 representing different forest conditions
var stableForest = glclcu_type.eq(1).updateMask(landMask);  // Stable forest
var forestLoss = glclcu_type.eq(2).updateMask(landMask);    // Forest loss
var forestGain = glclcu_type.eq(3).updateMask(landMask);    // Forest gain
var forestDisturbed = glclcu_type.eq(4).updateMask(landMask); // Disturbed forest

// Let's print the unique values in the GLAD Forest_type layer to verify
var uniqueValues = glclcu_type.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});
print('GLAD Forest_type unique values:', uniqueValues);

// Calculate areas for GLAD classes
var pixelArea = ee.Image.pixelArea().divide(10000); // Convert to hectares

var stableForestArea = stableForest.multiply(pixelArea).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});

var forestLossArea = forestLoss.multiply(pixelArea).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});

var forestGainArea = forestGain.multiply(pixelArea).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});

var forestDisturbedArea = forestDisturbed.multiply(pixelArea).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi,
  scale: 30,
  maxPixels: 1e13
});

// Print GLAD Forest Type areas
print('GLAD Forest Type Areas (2000-2020):');
print('1. Stable Forest Area (ha):', ee.Number(stableForestArea.get('b1')).round());
print('2. Forest Loss Area (ha):', ee.Number(forestLossArea.get('b1')).round());
print('3. Forest Gain Area (ha):', ee.Number(forestGainArea.get('b1')).round());
print('4. Disturbed Forest Area (ha):', ee.Number(forestDisturbedArea.get('b1')).round());

// Add layers in order
Map.addLayer(waterMask, waterVis, 'Water Bodies');

// Add Hansen forest layer
Map.addLayer(hansenForest, {palette: ['green'], opacity: 0.6}, 'Hansen Forest (2000)');

// Display the raw GLAD Forest_type classification
Map.addLayer(glclcu_type, {
  min: 1,
  max: 4,
  palette: ['darkgreen', 'red', 'blue', 'purple']
}, 'GLAD Forest Types (Raw)');

// Add individual GLAD forest type layers with self-masking
Map.addLayer(stableForest.selfMask(), 
  {palette: ['darkgreen'], opacity: 0.8}, 
  'GLAD Stable Forest (2000-2020)');

Map.addLayer(forestLoss.selfMask(), 
  {palette: ['red'], opacity: 0.7}, 
  'GLAD Forest Loss (2001-2020)');

Map.addLayer(forestGain.selfMask(), 
  {palette: ['blue'], opacity: 0.7}, 
  'GLAD Forest Gain (2001-2020)');

Map.addLayer(forestDisturbed.selfMask(), 
  {palette: ['purple'], opacity: 0.7}, 
  'GLAD Disturbed Forest (2001-2020)');

// Add Hansen loss by year
Map.addLayer(hansen_loss.updateMask(hansen_loss), 
  {
    min: 1,
    max: 23,
    palette: [
      '#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a',
      '#ef3b2c', '#cb181d', '#a50f15', '#67000d'
    ]
  }, 
  'Hansen Forest Loss by Year (2001-2023)');

// Add AOI boundary
Map.addLayer(ee.Image().byte().paint({
  featureCollection: ee.FeatureCollection(aoi), 
  color: 1, 
  width: 2
}), 
{palette: ['yellow']}, 
'AOI Boundary');

// Create legend panels
var legend = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px',
    backgroundColor: 'white'
  }
});

// Create year legend panel
var yearLegend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px',
    backgroundColor: 'white'
  }
});

// Main legend
var makeRow = function(color, name) {
  var colorBox = ui.Label({
    style: {
      backgroundColor: color,
      padding: '8px',
      margin: '0 0 4px 0'
    }
  });
  var description = ui.Label({
    value: name,
    style: {margin: '0 0 4px 6px'}
  });
  return ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};

legend.add(ui.Label('Legend'));
legend.add(makeRow('green', 'Hansen Forest (2000)'));
legend.add(makeRow('darkgreen', 'GLAD Stable Forest (2000-2020)'));
legend.add(makeRow('red', 'GLAD Forest Loss (2001-2020)'));
legend.add(makeRow('blue', 'GLAD Forest Gain (2001-2020)'));
legend.add(makeRow('purple', 'GLAD Disturbed Forest (2001-2020)'));
legend.add(makeRow('lightblue', 'Water Bodies'));
legend.add(makeRow('yellow', 'AOI Boundary'));

// Year legend for Hansen loss
yearLegend.add(ui.Label('Hansen Forest Loss Year', {fontWeight: 'bold'}));

// Create gradient legend for years
var years = [2001, 2005, 2010, 2015, 2020, 2023];
var colors = ['#fff5f0', '#fcbba1', '#fb6a4a', '#cb181d', '#a50f15', '#67000d'];

years.forEach(function(year, index) {
  yearLegend.add(
    makeRow(colors[index], year.toString())
  );
});

// Calculate percentages of total area
var totalArea = ee.Number(aoi.area()).divide(10000);
print('Total Area (ha):', totalArea.round());

// Calculate and print percentages
var stableForestPercent = ee.Number(stableForestArea.get('b1')).divide(totalArea).multiply(100).format('%.1f');
var forestLossPercent = ee.Number(forestLossArea.get('b1')).divide(totalArea).multiply(100).format('%.1f');
var forestGainPercent = ee.Number(forestGainArea.get('b1')).divide(totalArea).multiply(100).format('%.1f');
var forestDisturbedPercent = ee.Number(forestDisturbedArea.get('b1')).divide(totalArea).multiply(100).format('%.1f');

print('\nGLAD Forest Type Percentages:');
print('1. Stable Forest (% of total area):', stableForestPercent);
print('2. Forest Loss (% of total area):', forestLossPercent);
print('3. Forest Gain (% of total area):', forestGainPercent);
print('4. Disturbed Forest (% of total area):', forestDisturbedPercent);

// Add legends to map
Map.add(legend);
Map.add(yearLegend);

// Create a chart of annual forest loss
var annualLossChart = ui.Chart.feature.byFeature(ee.FeatureCollection(annualLossFeatures), 'year', ['loss_area_ha'])
  .setChartType('ColumnChart')
  .setOptions({
    title: 'Annual Forest Loss (2001-2023)',
    vAxis: {title: 'Area (hectares)'},
    hAxis: {
      title: 'Year',
      format: '####',
      ticks: annualLoss.map(function(year) {
        return ee.Number(year).add(2000)
      })
    },
    colors: ['red'],
    legend: {position: 'none'},
    backgroundColor: '#ffffff',
    fontSize: 12
  });

print(annualLossChart);

// Print projection information
print('Projection:', hansen.projection());

// Create a feature collection for the annual loss data
var annualLossCollection = ee.FeatureCollection(annualLossFeatures);

// Create a feature collection for the GLAD forest type statistics
var gladStats = ee.FeatureCollection([
  ee.Feature(null, {
    'forest_type': 'Stable Forest',
    'area_ha': ee.Number(stableForestArea.get('b1')).round(),
    'percent_total': ee.Number(stableForestArea.get('b1')).divide(totalArea).multiply(100).format('%.1f')
  }),
  ee.Feature(null, {
    'forest_type': 'Forest Loss',
    'area_ha': ee.Number(forestLossArea.get('b1')).round(),
    'percent_total': ee.Number(forestLossArea.get('b1')).divide(totalArea).multiply(100).format('%.1f')
  }),
  ee.Feature(null, {
    'forest_type': 'Forest Gain',
    'area_ha': ee.Number(forestGainArea.get('b1')).round(),
    'percent_total': ee.Number(forestGainArea.get('b1')).divide(totalArea).multiply(100).format('%.1f')
  }),
  ee.Feature(null, {
    'forest_type': 'Disturbed Forest',
    'area_ha': ee.Number(forestDisturbedArea.get('b1')).round(),
    'percent_total': ee.Number(forestDisturbedArea.get('b1')).divide(totalArea).multiply(100).format('%.1f')
  })
]);

// Create a feature for overall statistics
var overallStats = ee.FeatureCollection([
  ee.Feature(null, {
    'metric': 'Total Area',
    'value_ha': totalArea.round(),
    'percent': 100
  }),
  ee.Feature(null, {
    'metric': 'Hansen Forest Cover 2000',
    'value_ha': ee.Number(hansenForestArea.get('forest')).round(),
    'percent': ee.Number(hansenForestArea.get('forest')).divide(totalArea).multiply(100).format('%.1f')
  })
]);

// Define the projection for Chile Zone 3
var projection = 'EPSG:3161';

// Export spatial layers with specified projection
Export.image.toDrive({
  image: glclcu_type.reproject(projection, null, 30),
  description: 'GLAD_Forest_Types_2000_2020',
  folder: 'earthengine',
  scale: 30,
  region: aoi,
  crs: projection,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: hansen_loss.updateMask(hansen_loss).reproject(projection, null, 30),
  description: 'Hansen_Forest_Loss_2001_2023',
  folder: 'earthengine',
  scale: 30,
  region: aoi,
  crs: projection,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: hansenForest.reproject(projection, null, 30),
  description: 'Hansen_Forest_Cover_2000',
  folder: 'earthengine',
  scale: 30,
  region: aoi,
  crs: projection,
  maxPixels: 1e13
});

// Export tables to CSV
Export.table.toDrive({
  collection: annualLossCollection,
  description: 'Annual_Forest_Loss_2001_2023',
  folder: 'earthengine',
  fileFormat: 'CSV'
});

Export.table.toDrive({
  collection: gladStats,
  description: 'GLAD_Forest_Type_Statistics',
  folder: 'earthengine',
  fileFormat: 'CSV'
});

Export.table.toDrive({
  collection: overallStats,
  description: 'Overall_Forest_Statistics',
  folder: 'earthengine',
  fileFormat: 'CSV'
});

// Create a combined feature collection with all statistics
var allStats = ee.FeatureCollection([
  ee.Feature(null, {
    'category': 'Summary Statistics',
    'total_area_ha': totalArea.round(),
    'hansen_forest_2000_ha': ee.Number(hansenForestArea.get('forest')).round(),
    'hansen_forest_2000_percent': ee.Number(hansenForestArea.get('forest')).divide(totalArea).multiply(100).format('%.1f'),
    'glad_stable_forest_ha': ee.Number(stableForestArea.get('b1')).round(),
    'glad_stable_forest_percent': ee.Number(stableForestArea.get('b1')).divide(totalArea).multiply(100).format('%.1f'),
    'glad_forest_loss_ha': ee.Number(forestLossArea.get('b1')).round(),
    'glad_forest_gain_ha': ee.Number(forestGainArea.get('b1')).round(),
    'glad_disturbed_forest_ha': ee.Number(forestDisturbedArea.get('b1')).round()
  })
]);

Export.table.toDrive({
  collection: allStats,
  description: 'Combined_Forest_Statistics',
  folder: 'earthengine',
  fileFormat: 'CSV'
});
