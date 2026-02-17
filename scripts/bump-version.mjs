import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const bump = process.argv[2];

if (!bump || !['patch', 'minor', 'major'].includes(bump)) {
    console.error('Usage: node scripts/bump-version.mjs <patch|minor|major>');
    process.exit(1);
}

function bumpVersion(version, type) {
    const [major, minor, patch] = version.split('.').map(Number);
    switch (type) {
        case 'major': return `${major + 1}.0.0`;
        case 'minor': return `${major}.${minor + 1}.0`;
        case 'patch': return `${major}.${minor}.${patch + 1}`;
    }
}

const rootPkg = JSON.parse(readFileSync('package.json', 'utf8'));
const workspaceDirs = rootPkg.workspaces;

// Bump version in each workspace and build a name -> version map
const workspaceVersions = new Map();

for (const dir of workspaceDirs) {
    const pkgPath = join(dir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    pkg.version = bumpVersion(pkg.version, bump);
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');
    workspaceVersions.set(pkg.name, pkg.version);
    console.log(`${pkg.name} -> ${pkg.version}`);
}

// Update cross-workspace dependency references
const depFields = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];

for (const dir of workspaceDirs) {
    const pkgPath = join(dir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    let changed = false;

    for (const field of depFields) {
        if (!pkg[field]) continue;
        for (const [name, newVersion] of workspaceVersions) {
            if (name in pkg[field]) {
                pkg[field][name] = `^${newVersion}`;
                changed = true;
            }
        }
    }

    if (changed) {
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');
    }
}

const version = workspaceVersions.values().next().value;
console.log(`\nAll packages bumped to ${version}`);
