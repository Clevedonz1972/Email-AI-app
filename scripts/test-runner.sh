#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Run unit tests
echo "Running unit tests..."
npm run test:unit || exit 1

# Run integration tests
echo "Running integration tests..."
npm run test:integration || exit 1

# Run accessibility tests
echo "Running accessibility tests..."
npm run test:a11y || exit 1

# Run performance tests
echo "Running performance tests..."
npm run test:perf || exit 1

# Run E2E tests
echo "Running E2E tests..."
npm run test:e2e || exit 1

# Generate coverage report
echo "Generating coverage report..."
npm run test:coverage

# Check coverage thresholds
if [ $? -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
else
  echo -e "${RED}Tests failed!${NC}"
  exit 1
fi 