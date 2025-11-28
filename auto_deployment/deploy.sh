#!/bin/bash
cd /var/www/portfolio
git fetch --all
git reset --hard origin/main

# Set correct permissions (optional)
chown -R www-data:www-data /var/www/portfolio
chmod -R 755 /var/www/portfolio
