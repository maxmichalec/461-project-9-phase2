#!/bin/bash

# Script to set up selenium tests

log_file="selenium-test.log"

# Install dependencies
# npm install

# Compile typescript
echo "Compiling typescript..."
cd front-end
cd selenium 
tsc --skipLibCheck

# Clear log file and run selenium-test
echo "Running selenium-test..."
> "$log_file"
node selenium-test.js &

# Wait for processes to finish
wait
echo "selenium-test complete."

# Check log file for errors
if grep -q "ERROR" "$log_file"; then
    echo "ERROR: selenium-test failed."
    code "$log_file"
    exit 1
else
    echo "SUCCESS: selenium-test passed."
    code "$log_file"
    exit 0
fi