#!/bin/bash

git config --global user.email "nobody@nobody.org"
git config --global user.name "Travis CI"
git remote remove origin
git remote add origin "https://${GITHUB_TOKEN}@github.com/DankGamesStudios/Tankr.git"

npm install
npm run-script build:dist
npm run-script deploy
