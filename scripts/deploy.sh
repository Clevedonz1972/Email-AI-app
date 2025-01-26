#!/bin/bash

# Build the application
npm run build

# Run final tests
npm run test:all

# Check bundle size
npm run analyze

# Deploy to production (example using AWS)
aws s3 sync build/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*" 