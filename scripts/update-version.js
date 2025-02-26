const fs = require('fs');
const { execSync } = require('child_process');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;
const shortCommit = execSync('git rev-parse --short HEAD').toString().trim();
packageJson.version = `${currentVersion}-${shortCommit}`;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log(`Updated version to ${packageJson.version}`);
