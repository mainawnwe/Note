#!/bin/bash
# Script to start PHP built-in server with correct document root

cd "$(dirname "$0")"
php -S localhost:8000 -t api
