#!/bin/bash

# Skip if SKIP_POSTINSTALL is set (useful for CI environments)
if [ "${SKIP_POSTINSTALL}" = "1" ]; then
    echo "Skipping submodule initialization (SKIP_POSTINSTALL=1)"
    exit 0
fi

# Only attempt to initialize submodules if .gitmodules exists and is not empty
if [ -s .gitmodules ]; then
    echo "Initializing git submodules..."
    git submodule update --init --recursive
    status=$?
else
    echo "No git submodules configured. Skipping initialization."
    status=0
fi

# Check if initialization was successful
if [ $status -eq 0 ]; then
    echo "Git submodules initialized successfully"
else
    echo "Error: Failed to initialize git submodules"
    exit 1
fi
