'use strict';

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const akita = require('akita-node');
const read = require('read-promise');
const utils = require('./utils');
const dir = process.cwd() + '/packages';

const libVersions = {};

async function getVersions(pkg) {
  if (!libVersions[pkg]) {
    let json = await akita.get('http://registry.npm.taobao.org/' + pkg);
    if (json['dist-tags']) {
      libVersions[pkg] = json['dist-tags'];
    }
  }
  return libVersions[pkg];
}

async function update(pkg) {
  let pkgFile = path.join(dir, pkg, 'package.json');
  if (!utils.isFile(pkgFile)) return;
  let info = require(pkgFile);
  console.log('update ' + info.name + '...');
  for (let p of ['dependencies', 'devDependencies', 'peerDependencies']) {
    let libs = info[p];
    if (!libs) continue;
    for (let name in libs) {
      try {
        if (libs[name] === '*' || libs[name][0] !== '^') continue;
        let v = await getVersions(name, libs[name]);
        if (!v) {
          console.log(name + ' last version not found');
          continue;
        }
        let latest = v.latest;
        let old = libs[name].substr(1);
        if (semver.gte(old, latest)) continue;

        try {
          let yes = await read({
            prompt: `${name} : ^${old} => ^${latest} ?`,
            default: 'yes'
          });
          if (yes === 'yes') {
            info[p][name] = '^' + latest;
            fs.writeFileSync(pkgFile, JSON.stringify(info, null, 2));
          }
        } catch (err) {
          console.error(err);
          process.exit();
          continue;
        }
      } catch (err) {
        console.log(err.stack);
      }
    }
  }
}

async function start() {
  let pkgs = fs.readdirSync(dir);
  for (let pkg of pkgs) {
    await update(pkg);
  }
  console.log('done');
}

start();
