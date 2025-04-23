# Define source and destination paths
$sourceRoot = "C:\Users\galag\GitHub\wildlands-league-ecosystem"
$destRoot = "I:\My Drive\wildlands-league-ecosystem"
$logFile = "sync_log.txt"

# Create log file
"=== Sync started at $(Get-Date) ===" | Out-File -FilePath $logFile

# Function to log messages
function Write-Log {
    param (
        [string]$Message,
        [string]$Type = "INFO"
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp - $Type - $Message"
    $logMessage | Out-File -FilePath $logFile -Append
    Write-Host $logMessage
}

# First verify I: drive is accessible
if (-not (Test-Path "I:\My Drive")) {
    Write-Log -Message "Cannot access I:\My Drive. Please ensure the drive is connected." -Type "ERROR"
    exit 1
}

# Create main directory structure
$directories = @(
    "",
    "data",
    "docs",
    "maps",
    "results",
    "results\visualizations",
    "scripts",
    "scripts\gee",
    "scripts\notebooks",
    "scripts\python",
    "qgis",
    "references"
)

# Create directories
Write-Log "Creating directory structure..."
foreach ($dir in $directories) {
    $path = Join-Path $destRoot $dir
    if (-not (Test-Path $path)) {
        try {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
            Write-Log "Created directory: $path"
        } catch {
            Write-Log "Failed to create directory: $path. Error: $_" -Type "ERROR"
        }
    }
}

# Function to copy files with progress and error handling
function Copy-WithProgress {
    param (
        [string]$source,
        [string]$destination,
        [string]$type,
        [string]$filter = "*"
    )
    
    if (Test-Path $source) {
        Write-Log "Copying $type from $source to $destination"
        try {
            $files = Get-ChildItem -Path $source -Filter $filter -Recurse -ErrorAction Stop
            $total = $files.Count
            $current = 0
            
            foreach ($file in $files) {
                $current++
                $percent = [math]::Round(($current / $total) * 100, 2)
                Write-Progress -Activity "Copying $type" -Status "$percent% Complete" -PercentComplete $percent
                
                $destPath = $file.FullName.Replace($sourceRoot, $destRoot)
                $destDir = Split-Path $destPath -Parent
                
                if (-not (Test-Path $destDir)) {
                    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
                }
                
                Copy-Item -Path $file.FullName -Destination $destPath -Force -ErrorAction Stop
            }
            Write-Progress -Activity "Copying $type" -Completed
            Write-Log "Successfully copied $type"
        } catch {
            Write-Log "Error copying $type: $_" -Type "ERROR"
        }
    } else {
        Write-Log "Warning: Source path not found: $source" -Type "WARNING"
    }
}

# Copy files in stages with specific file types
# 1. Documentation and Code
Copy-WithProgress -source "$sourceRoot\docs" -destination "$destRoot\docs" -type "documentation" -filter "*.md"
Copy-WithProgress -source "$sourceRoot\docs" -destination "$destRoot\docs" -type "documentation" -filter "*.pdf"
Copy-WithProgress -source "$sourceRoot\scripts" -destination "$destRoot\scripts" -type "scripts" -filter "*.py"
Copy-WithProgress -source "$sourceRoot\scripts" -destination "$destRoot\scripts" -type "scripts" -filter "*.sh"
Copy-WithProgress -source "$sourceRoot\scripts" -destination "$destRoot\scripts" -type "scripts" -filter "*.ps1"
Copy-WithProgress -source "$sourceRoot\README.md" -destination "$destRoot" -type "README"

# 2. Results and Visualizations
Copy-WithProgress -source "$sourceRoot\results" -destination "$destRoot\results" -type "CSV files" -filter "*.csv"
Copy-WithProgress -source "$sourceRoot\results\visualizations" -destination "$destRoot\results\visualizations" -type "visualizations" -filter "*.png"
Copy-WithProgress -source "$sourceRoot\results\visualizations" -destination "$destRoot\results\visualizations" -type "visualizations" -filter "*.jpg"

# 3. Reference Materials and Maps
Copy-WithProgress -source "$sourceRoot\references" -destination "$destRoot\references" -type "references"
Copy-WithProgress -source "$sourceRoot\maps" -destination "$destRoot\maps" -type "maps"

# 4. QGIS Projects and Files
Write-Log "Copying QGIS directory and all its contents..."
Copy-WithProgress -source "$sourceRoot\qgis" -destination "$destRoot\qgis" -type "QGIS directory" -filter "*"
Copy-WithProgress -source "$sourceRoot\qgis\project" -destination "$destRoot\qgis\project" -type "QGIS projects" -filter "*"
Copy-WithProgress -source "$sourceRoot\qgis\templates" -destination "$destRoot\qgis\templates" -type "QGIS templates" -filter "*"
Copy-WithProgress -source "$sourceRoot\qgis\images" -destination "$destRoot\qgis\images" -type "QGIS images" -filter "*"
Copy-WithProgress -source "$sourceRoot\qgis\outputs" -destination "$destRoot\qgis\outputs" -type "QGIS outputs" -filter "*"
Copy-WithProgress -source "$sourceRoot\qgis\layers" -destination "$destRoot\qgis\layers" -type "QGIS layers" -filter "*"
Copy-WithProgress -source "$sourceRoot\qgis\processing" -destination "$destRoot\qgis\processing" -type "QGIS processing" -filter "*"
Copy-WithProgress -source "$sourceRoot\qgis\styles" -destination "$destRoot\qgis\styles" -type "QGIS styles" -filter "*"

# Verify the copy operation
Write-Log "Verifying directory structure..."
Get-ChildItem -Path $destRoot -Recurse -Directory | 
    Select-Object FullName | 
    ForEach-Object { Write-Log "Verified directory: $($_.FullName)" }

Write-Log "Sync completed at $(Get-Date)"
"=== Sync completed ===" | Out-File -FilePath $logFile -Append
Write-Host "`nSetup complete! Please verify the contents of $destRoot" 