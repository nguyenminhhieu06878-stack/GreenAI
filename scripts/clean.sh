#!/bin/bash

echo "🧹 Cleaning GreenEnergy AI..."

# Remove node_modules
echo "Removing node_modules..."
rm -rf node_modules
rm -rf apps/frontend/node_modules
rm -rf apps/backend/node_modules

# Remove dist/build folders
echo "Removing build artifacts..."
rm -rf apps/frontend/dist
rm -rf apps/backend/dist

# Remove uploads (optional)
read -p "Remove uploads folder? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf apps/backend/uploads
    echo "✅ Removed uploads"
fi

echo "✨ Clean complete!"
echo ""
echo "To reinstall:"
echo "  npm run install:all"
