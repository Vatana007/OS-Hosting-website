#!/bin/bash
# setup.sh — Run this FIRST

echo "===== E-Commerce Setup ====="

# Create directory structure
mkdir -p ecommerce/backend/{config,middleware,models,routes}
mkdir -p ecommerce/frontend/{css,js}

# Install Node.js (if not installed)
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install MongoDB (if not installed)
if ! command -v mongod &> /dev/null; then
    echo "Install MongoDB from https://www.mongodb.com/docs/manual/installation/"
fi

# Install PM2 globally
sudo npm install -g pm2

cd ecommerce/backend
npm init -y

# Install backend dependencies
npm install express mongoose bcryptjs jsonwebtoken dotenv cors helmet morgan express-rate-limit

echo "===== Setup Complete ====="
echo "Now copy all the files below into their locations."