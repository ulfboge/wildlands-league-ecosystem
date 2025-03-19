#!/usr/bin/env python3
"""
Deforestation Analysis Script
----------------------------
Analyzes historical deforestation patterns using Hansen Global Forest Change dataset.
"""

import os
import numpy as np
import pandas as pd
import geopandas as gpd
import rasterio
from rasterio.mask import mask
import earthengine as ee
import logging
import matplotlib.pyplot as plt
from datetime import datetime
from scipy.ndimage import gaussian_filter

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class DeforestationAnalyzer:
    """A class for analyzing deforestation patterns and rates."""

    def __init__(self, data_dir, output_dir):
        """
        Initialize the DeforestationAnalyzer with directory paths.

        Args:
            data_dir (str): Path to the directory containing input data
            output_dir (str): Path to the directory for saving outputs
        """
        self.data_dir = data_dir
        self.output_dir = output_dir
        self.logger = logging.getLogger(__name__)

        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

    def load_forest_cover_timeseries(self, forest_cover_paths):
        """
        Load forest cover data for multiple time periods.

        Args:
            forest_cover_paths (dict): Dictionary mapping dates to file paths

        Returns:
            dict: Dictionary mapping dates to forest cover arrays and metadata
        """
        try:
            forest_data = {}
            for date, path in forest_cover_paths.items():
                if not os.path.exists(path):
                    raise FileNotFoundError(f"File not found: {path}")
                
                with rasterio.open(path) as src:
                    data = src.read(1)
                    meta = src.meta.copy()
                
                forest_data[date] = {'data': data, 'meta': meta}
            self.logger.info(f"Loaded forest cover data for {len(forest_cover_paths)} time periods")
            return forest_data
        except Exception as e:
            self.logger.error(f"Error loading forest cover timeseries: {str(e)}")
            raise

    def calculate_deforestation_rate(self, start_data, end_data, years_between):
        """
        Calculate deforestation rate between two time periods.

        Args:
            start_data (numpy.ndarray): Forest cover at start period
            end_data (numpy.ndarray): Forest cover at end period
            years_between (float): Number of years between periods

        Returns:
            tuple: Annual deforestation rate and total area deforested
        """
        try:
            if start_data.shape != end_data.shape:
                raise ValueError("Start and end raster dimensions do not match")

            deforested = np.where((start_data == 1) & (end_data == 0), 1, 0)
            total_deforested = np.sum(deforested)

            annual_rate = total_deforested / years_between if years_between > 0 else 0

            self.logger.info(f"Calculated deforestation rate over {years_between} years")
            return annual_rate, total_deforested, deforested
        except Exception as e:
            self.logger.error(f"Error calculating deforestation rate: {str(e)}")
            raise

    def identify_hotspots(self, deforestation_data, threshold=0.1):
        """
        Identify deforestation hotspots.

        Args:
            deforestation_data (numpy.ndarray): Deforestation binary map
            threshold (float): Threshold for hotspot identification

        Returns:
            numpy.ndarray: Hotspot areas
        """
        try:
            smoothed = gaussian_filter(deforestation_data.astype(float), sigma=2)
            hotspots = smoothed > threshold
            self.logger.info("Identified deforestation hotspots")
            return hotspots
        except Exception as e:
            self.logger.error(f"Error identifying hotspots: {str(e)}")
            raise

    def save_raster(self, data, meta, output_filename):
        """
        Save a numpy array as a raster file.

        Args:
            data (numpy.ndarray): Raster data to save
            meta (dict): Raster metadata
            output_filename (str): Path to save the raster
        """
        try:
            meta.update(dtype=rasterio.uint8, count=1)

            with rasterio.open(output_filename, "w", **meta) as dest:
                dest.write(data.astype(rasterio.uint8), 1)

            self.logger.info(f"Saved raster to {output_filename}")
        except Exception as e:
            self.logger.error(f"Error saving raster: {str(e)}")
            raise

    def save_results(self, results, output_prefix):
        """
        Save analysis results to files.

        Args:
            results (dict): Analysis results
            output_prefix (str): Prefix for output filenames
        """
        try:
            results_df = pd.DataFrame([results])
            output_path = os.path.join(self.output_dir, f"{output_prefix}_results.csv")
            results_df.to_csv(output_path, index=False)
            self.logger.info(f"Results saved to {output_path}")
        except Exception as e:
            self.logger.error(f"Error saving results: {str(e)}")
            raise

    def plot_hotspots(self, hotspots, output_filename):
        """
        Plot and save a map of deforestation hotspots.

        Args:
            hotspots (numpy.ndarray): Hotspot binary map
            output_filename (str): Path to save the image
        """
        try:
            plt.figure(figsize=(10, 6))
            plt.imshow(hotspots, cmap='Reds', interpolation='nearest')
            plt.colorbar(label="Hotspot Intensity")
            plt.title("Deforestation Hotspots")
            plt.savefig(output_filename, dpi=300)
            plt.close()
            self.logger.info(f"Hotspot map saved to {output_filename}")
        except Exception as e:
            self.logger.error(f"Error plotting hotspots: {str(e)}")
            raise


def main():
    """Main execution function."""
    analyzer = DeforestationAnalyzer("data", "results")

    # Define file paths
    forest_cover_paths = {
        "2000": "data/forest_2000.tif",
        "2020": "data/forest_2020.tif"
    }

    try:
        # Load data
        forest_data = analyzer.load_forest_cover_timeseries(forest_cover_paths)

        # Compute deforestation rate
        start_data = forest_data["2000"]["data"]
        end_data = forest_data["2020"]["data"]
        years_between = 2020 - 2000

        annual_rate, total_deforested, deforestation_map = analyzer.calculate_deforestation_rate(
            start_data, end_data, years_between
        )

        # Identify hotspots
        hotspots = analyzer.identify_hotspots(deforestation_map)

        # Save deforestation map as raster
        raster_output_path = "results/deforestation_map.tif"
        analyzer.save_raster(deforestation_map, forest_data["2000"]["meta"], raster_output_path)

        # Save hotspots as raster
        hotspot_output_path = "results/hotspots.tif"
        analyzer.save_raster(hotspots.astype(np.uint8), forest_data["2000"]["meta"], hotspot_output_path)

        # Save analysis results
        results = {
            "Annual Deforestation Rate": annual_rate,
            "Total Deforested Area": total_deforested
        }
        analyzer.save_results(results, "deforestation_analysis")

        # Plot and save hotspots
        analyzer.plot_hotspots(hotspots, "results/hotspot_map.png")

    except Exception as e:
        logging.error(f"Error in analysis: {str(e)}")


if __name__ == "__main__":
    main()
