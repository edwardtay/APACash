#!/bin/bash
# Script to push to GitHub

echo "🔗 Connecting to GitHub..."
git remote remove origin 2> /dev/null
git remote add origin https://github.com/edwardtay/APACash.git

echo "🌿 Setting main branch..."
git branch -M main

echo "🚀 Pushing code..."
echo "You may be asked for your GitHub username and password (PAT)."
git push -u origin main
