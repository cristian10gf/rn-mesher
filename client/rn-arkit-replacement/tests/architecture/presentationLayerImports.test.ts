import * as fs from 'fs';
import * as path from 'path';

function walkTsFiles(dir: string, acc: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkTsFiles(p, acc);
    else if (/\.(ts|tsx)$/.test(ent.name) && !ent.name.endsWith('.d.ts')) acc.push(p);
  }
}

function collectPresentationFiles(featuresRoot: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(featuresRoot)) return out;
  for (const ent of fs.readdirSync(featuresRoot, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const presentationDir = path.join(featuresRoot, ent.name, 'presentation');
    walkTsFiles(presentationDir, out);
  }
  return out;
}

/** Relative or absolute imports into a feature's `data/` layer from presentation (forbidden). */
const FORBIDDEN = [
  /from\s+['"][^'"]*\/features\/[^'"]+\/data\//,
  /from\s+['"]\.\.\/\.\.\/data\//,
  /from\s+['"]\.\.\/data\//,
];

describe('architecture: presentation layer', () => {
  it('does not import feature data or ../data paths', () => {
    const root = path.join(__dirname, '../../src/features');
    const files = collectPresentationFiles(root);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('import ') && !trimmed.includes(' import ')) return;
        for (const pattern of FORBIDDEN) {
          if (pattern.test(line)) {
            throw new Error(`Presentation must not import data layer: ${file}:${idx + 1}\n${line}`);
          }
        }
      });
    }
  });
});
