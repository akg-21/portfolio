#!/bin/bash

cd /var/www/portfolio

echo "Pulling latest changes..."
git pull

echo "Setting permissions..."
chown -R www-data:www-data /var/www/portfolio
chmod -R 755 /var/www/portfolio

echo "Deployment complete!"
