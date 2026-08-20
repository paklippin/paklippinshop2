#!/bin/bash
# Install dependencies
npm install

# Log in to Cloudflare (if not already)
npx wrangler login

# Create D1 database
npx wrangler d1 create paklippinshop-db

# Run migration
npx wrangler d1 execute paklippinshop-db --file=./migrations/001_create_tables.sql

# Deploy
npx wrangler deploy
