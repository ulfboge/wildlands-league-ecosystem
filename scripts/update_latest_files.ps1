# Define source and destination paths
$sourceRoot = "C:\Users\galag\GitHub\wildlands-league-ecosystem"
$destRoot = "I:\My Drive\wildlands-league-ecosystem"

# Files to update
$filesToUpdate = @(
    # Documentation files
    @{
        Source = "docs\Progress_Report_2025.md"
        Destination = "docs\Progress_Report_2025.md"
    },
    @{
        Source = "docs\Proposal Wildlands League 2025.md"
        Destination = "docs\Proposal Wildlands League 2025.md"
    },
    @{
        Source = "docs\methodology.md"
        Destination = "docs\methodology.md"
    },
    @{
        Source = "docs\Progress_Report_2025.pdf"
        Destination = "docs\Progress_Report_2025.pdf"
    },
    @{
        Source = "docs\pdf-styles.css"
        Destination = "docs\pdf-styles.css"
    },
    # Results files
    @{
        Source = "results\Overall_Forest_Statistics.csv"
        Destination = "results\Overall_Forest_Statistics.csv"
    },
    @{
        Source = "results\Combined_Forest_Statistics.csv"
        Destination = "results\Combined_Forest_Statistics.csv"
    },
    @{
        Source = "results\Annual_Forest_Loss_2001_2023.csv"
        Destination = "results\Annual_Forest_Loss_2001_2023.csv"
    },
    @{
        Source = "results\GLAD_Forest_Type_Statistics.csv"
        Destination = "results\GLAD_Forest_Type_Statistics.csv"
    }
)

# First verify I: drive is accessible
if (-not (Test-Path "I:\My Drive")) {
    Write-Host "Error: Cannot access I:\My Drive. Please ensure the drive is connected." -ForegroundColor Red
    exit 1
}

# Update each file
foreach ($file in $filesToUpdate) {
    $sourcePath = Join-Path $sourceRoot $file.Source
    $destPath = Join-Path $destRoot $file.Destination
    
    if (Test-Path $sourcePath) {
        # Create destination directory if it doesn't exist
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        # Copy the file
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "Updated: $($file.Source)"
    } else {
        Write-Host "Warning: Source file not found: $sourcePath" -ForegroundColor Yellow
    }
}

Write-Host "`nUpdate complete! Please verify the contents of $destRoot" 