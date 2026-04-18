#!/bin/bash

# Define the output zip file name
OUTPUT_FILE="Cravify_Project_Bundle.zip"

# Remove existing zip if it exists
if [ -f "$OUTPUT_FILE" ]; then
    rm "$OUTPUT_FILE"
    echo "Removed existing $OUTPUT_FILE"
fi

echo "Creating $OUTPUT_FILE..."

# Zip the project, excluding node_modules, .git, and other unnecessary files
zip -r "$OUTPUT_FILE" . -x "*/node_modules/*" -x "*/.git/*" -x "*/.DS_Store" -x "*/dist/*" -x "*/.vscode/*"

echo "Done! Zip file created at $(pwd)/$OUTPUT_FILE"
