#!/bin/bash
# fix-errorboundary.sh
# This script replaces all relative imports of ErrorBoundary with the alias import,
# clears caches, reinstalls packages, and rebuilds the project.

echo "Replacing relative imports of ErrorBoundary with alias version..."

# The following command finds all .ts and .tsx files under src/ and performs a search and replace.
# Note: The sed command below is for macOS. If you're on Linux, remove the empty quotes after -i.
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | xargs -0 sed -i '' "s|import { ErrorBoundary } from '../ErrorBoundary';|import { ErrorBoundary } from '@/ErrorBoundary';|g"

echo "Replacement complete."

echo "Clearing caches..."
rm -rf node_modules/.cache
rm -rf build

echo "Reinstalling packages..."
npm install

echo "Rebuilding project..."
npm run build

echo "Fix complete. Please check the build output for success."