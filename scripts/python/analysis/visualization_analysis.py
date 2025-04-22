#!/usr/bin/env python3
"""
Visualization Analysis Script
---------------------------
Creates advanced visualizations for forest change analysis, including:
- Time series plots of forest cover change
- Comparative analysis visualizations
- Statistical distribution plots
- Interactive maps (using folium)
- Custom matplotlib-based visualizations
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import folium
from pathlib import Path
import geopandas as gpd
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class ForestVisualization:
    """A class for creating advanced visualizations of forest analysis data."""
    
    def __init__(self, data_dir, output_dir):
        """
        Initialize the visualization class.
        
        Args:
            data_dir (str): Directory containing analysis results
            output_dir (str): Directory for saving visualizations
        """
        self.data_dir = Path(data_dir)
        self.output_dir = Path(output_dir)
        self.logger = logging.getLogger(__name__)
        
        # Create output directory if it doesn't exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def plot_forest_change_timeseries(self, data, title="Forest Cover Change Over Time"):
        """
        Create a time series plot of forest cover changes.
        
        Args:
            data (pd.DataFrame): DataFrame with dates and forest cover values
            title (str): Plot title
        """
        plt.figure(figsize=(12, 6))
        sns.lineplot(data=data, x='year', y='forest_cover', marker='o')
        plt.title(title)
        plt.xlabel('Year')
        plt.ylabel('Forest Cover (ha)')
        plt.grid(True)
        
        output_path = self.output_dir / 'forest_change_timeseries.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        self.logger.info(f"Saved time series plot to {output_path}")
        
    def create_comparative_analysis(self, baseline_stats, current_stats, output_name="comparative_analysis.png"):
        """
        Create comparative visualization between baseline and current forest state.
        
        Args:
            baseline_stats (dict): Baseline forest statistics
            current_stats (dict): Current forest statistics
            output_name (str): Name for the output file
        """
        categories = list(baseline_stats.keys())
        baseline_values = list(baseline_stats.values())
        
        plt.figure(figsize=(12, 6))
        plt.bar(categories, baseline_values, color='forestgreen', alpha=0.7)
        plt.title('Forest Type Distribution')
        plt.xlabel('Forest Type')
        plt.ylabel('Area (ha)')
        plt.xticks(rotation=45)
        plt.grid(True, alpha=0.3)
        
        output_path = self.output_dir / output_name
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        self.logger.info(f"Saved comparative analysis to {output_path}")
        
    def plot_statistical_distribution(self, data, column, output_name="distribution.png"):
        """
        Create statistical distribution plots.
        
        Args:
            data (pd.DataFrame): DataFrame containing the data
            column (str): Column to analyze
            output_name (str): Name for the output file
        """
        plt.figure(figsize=(12, 7))
        
        # Create a combination of histogram and kernel density estimation
        sns.histplot(data=data, x=column, kde=True, bins=10)
        
        plt.title('Distribution of Annual Forest Loss (2001-2023)', fontsize=12, pad=15)
        plt.xlabel('Forest Loss (hectares per year)', fontsize=10)
        plt.ylabel('Number of Years with This Loss Range', fontsize=10)
        
        # Add grid for better readability
        plt.grid(True, alpha=0.3)
        
        # Adjust layout to prevent label cutoff
        plt.tight_layout()
        
        output_path = self.output_dir / output_name
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        self.logger.info(f"Saved distribution plot to {output_path}")

def main():
    """Main execution function."""
    # Initialize visualizer with appropriate directories
    visualizer = ForestVisualization(
        data_dir="data",
        output_dir="results/visualizations"
    )
    
    try:
        # 1. Create time series visualization of annual forest loss
        annual_loss_df = pd.read_csv("results/Annual_Forest_Loss_2001_2023.csv")
        
        # Create cumulative forest cover time series
        initial_forest = 690675.0  # From Overall_Forest_Statistics.csv
        annual_loss_df['cumulative_loss'] = annual_loss_df['area'].cumsum()
        annual_loss_df['forest_cover'] = initial_forest - annual_loss_df['cumulative_loss']
        
        visualizer.plot_forest_change_timeseries(
            data=annual_loss_df[['year', 'forest_cover']],
            title="Algonquin Park Forest Cover Change (2001-2023)"
        )
        
        # 2. Create forest loss trend visualization
        plt.figure(figsize=(12, 6))
        plt.bar(annual_loss_df['year'], annual_loss_df['area'], color='darkred', alpha=0.7)
        plt.title('Annual Forest Loss in Algonquin Park (2001-2023)')
        plt.xlabel('Year')
        plt.ylabel('Area Lost (ha)')
        plt.grid(True, alpha=0.3)
        plt.savefig('results/visualizations/annual_forest_loss.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 3. Create comparative analysis between forest types
        glad_stats = pd.read_csv("results/GLAD_Forest_Type_Statistics.csv")
        forest_types = dict(zip(glad_stats['forest_type'], glad_stats['area_ha']))
        
        visualizer.create_comparative_analysis(
            baseline_stats=forest_types,
            current_stats=forest_types,  # Using same data as it's current state
            output_name="forest_type_distribution.png"
        )
        
        # 4. Create statistical distribution of annual forest loss
        loss_stats = pd.DataFrame({
            'Annual Forest Loss': annual_loss_df['area']
        })
        
        visualizer.plot_statistical_distribution(
            loss_stats,
            'Annual Forest Loss',
            'annual_loss_distribution.png'
        )
        
        # 5. Create a pie chart of forest types
        plt.figure(figsize=(10, 10))
        plt.pie(glad_stats['area_ha'], 
                labels=glad_stats['forest_type'], 
                autopct='%1.1f%%',
                colors=['darkgreen', 'red', 'lightgreen', 'orange'])
        plt.title('Forest Type Distribution in Algonquin Park')
        plt.savefig('results/visualizations/forest_type_pie.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 6. Create trend analysis visualization
        # Calculate moving average of forest loss
        annual_loss_df['moving_avg'] = annual_loss_df['area'].rolling(window=5).mean()
        
        plt.figure(figsize=(12, 6))
        plt.plot(annual_loss_df['year'], annual_loss_df['area'], 'r-', label='Annual Loss', alpha=0.6)
        plt.plot(annual_loss_df['year'], annual_loss_df['moving_avg'], 'b-', 
                label='5-year Moving Average', linewidth=2)
        plt.title('Forest Loss Trend Analysis (2001-2023)')
        plt.xlabel('Year')
        plt.ylabel('Area Lost (ha)')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig('results/visualizations/forest_loss_trend.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        visualizer.logger.info("All visualizations completed successfully!")
        
    except Exception as e:
        visualizer.logger.error(f"Error in visualization process: {str(e)}")
        raise

if __name__ == "__main__":
    main()