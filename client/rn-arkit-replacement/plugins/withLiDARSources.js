const { withXcodeProject } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const SOURCE_SUBDIRS = ['Export', 'Mesh', 'Native', 'Scanning'];

function collectSwiftFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.swift') || f.endsWith('.m'))
    .map(f => path.join(dir, f));
}

const withLiDARSources = (config) =>
  withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const iosDir = cfg.modRequest.platformProjectRoot;
    // modules/LiDAR/ios/ sits one level above ios/
    const lidarIosDir = path.join(iosDir, '..', 'modules', 'LiDAR', 'ios');

    const allFiles = [];
    for (const sub of SOURCE_SUBDIRS) {
      const dir = path.join(lidarIosDir, 'Sources', sub);
      allFiles.push(...collectSwiftFiles(dir));
    }

    const testDir = path.join(lidarIosDir, 'Tests', 'UniWhereLiDARTests');
    const testFiles = collectSwiftFiles(testDir);

    const targetName = cfg.modRequest.projectName;
    const target = project.pbxTargetByName(targetName);
    if (!target) {
      console.warn(`[withLiDARSources] target "${targetName}" not found — skipping`);
      return cfg;
    }

    for (const filePath of allFiles) {
      const relPath = path.relative(iosDir, filePath);
      project.addSourceFile(relPath, { target: target.uuid }, targetName);
    }

    const testTargetName = `${targetName}Tests`;
    const testTarget = project.pbxTargetByName(testTargetName);
    if (!testTarget && testFiles.length > 0) {
      console.warn(`[withLiDARSources] test target "${testTargetName}" not found but ${testFiles.length} test file(s) exist — they will NOT be compiled. Verify target name in project.pbxproj.`);
    } else if (testTarget) {
      for (const filePath of testFiles) {
        const relPath = path.relative(iosDir, filePath);
        project.addSourceFile(relPath, { target: testTarget.uuid }, testTargetName);
      }
    }

    return cfg;
  });

module.exports = withLiDARSources;
