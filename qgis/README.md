# QGIS Project Structure

This directory contains all QGIS-related files for the Wildlands League Ecosystem project.

## Directory Structure

### Main Directories
- `project/` - Contains the main QGIS project file (.qgz)
  - Recommended project file name: `wildlands_league_ecosystem_analysis.qgz`

- `layers/` - Contains input data layers used in the project
  - `vector/` - Shapefiles, GeoJSON, and other vector formats
  - `raster/` - GeoTIFF, IMG, and other raster formats
  - `tables/` - CSV, Excel, and other tabular data

- `styles/` - Contains QGIS style files (.qml) and symbology definitions
  - Store style files with the same name as their corresponding layers

- `outputs/` - Contains analysis results and exported files
  - `maps/` - Exported map compositions (.pdf, .png, etc.)
  - `vector/` - Processed vector data outputs
  - `raster/` - Processed raster data outputs
  - `tables/` - Analysis results in tabular format
  - `reports/` - Generated reports and documentation

- `processing/` - Contains QGIS processing scripts and models

## Best Practices

1. Always use relative paths in the QGIS project to ensure portability
2. Store all style files separately in the `styles/` directory
3. Keep raw data separate from processed outputs
4. Document any custom processing scripts or models
5. Use clear and consistent naming conventions for all files

## Getting Started

1. Create a new QGIS project and save it in the `project/` directory
2. Add your data layers to the `layers/` directory
3. Save any custom styles in the `styles/` directory
4. Store all outputs in the `outputs/` directory
5. Keep processing scripts and models in the `processing/` directory
