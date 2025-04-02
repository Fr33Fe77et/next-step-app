# Create a PowerShell script to list all files and directories
function Get-DirectoryStructure {
    param (
        [string]$Path = "."
    )
    
    # Get all items (files and folders) in the current directory
    $items = Get-ChildItem -Path $Path
    
    foreach ($item in $items) {
        # Create proper indentation based on path depth
        $depth = ($item.FullName -split "\\").Count - ($Path -split "\\").Count
        $indent = "  " * $depth
        
        # Output item name with proper prefix
        if ($item.PSIsContainer) {
            # It's a directory
            Write-Output "$indent📂 $($item.Name)"
            
            # Recursively process subdirectories
            Get-DirectoryStructure -Path $item.FullName
        }
        else {
            # It's a file
            Write-Output "$indent📄 $($item.Name)"
        }
    }
}

# Save the output to a file
Get-DirectoryStructure -Path "." | Out-File -FilePath "directory_structure.txt"

Write-Output "Directory structure has been saved to directory_structure.txt"