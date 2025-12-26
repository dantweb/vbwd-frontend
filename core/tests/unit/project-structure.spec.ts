import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Project Structure', () => {
  const rootDir = path.resolve(__dirname, '../..');

  it('should have all required source directories', () => {
    const dirs = [
      'src/plugins',
      'src/api',
      'src/auth',
      'src/events',
      'src/validation',
      'src/components',
      'src/composables',
      'src/access-control',
      'src/types',
      'src/utils'
    ];

    for (const dir of dirs) {
      const fullPath = path.join(rootDir, dir);
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).isDirectory()).toBe(true);
    }
  });

  it('should have all required test directories', () => {
    const dirs = ['tests/unit', 'tests/integration', 'tests/fixtures'];

    for (const dir of dirs) {
      const fullPath = path.join(rootDir, dir);
      expect(fs.existsSync(fullPath)).toBe(true);
    }
  });

  it('should have all required config files', () => {
    const files = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'vitest.config.ts',
      '.eslintrc.cjs',
      '.prettierrc.js',
      'README.md'
    ];

    for (const file of files) {
      const fullPath = path.join(rootDir, file);
      expect(fs.existsSync(fullPath), `${file} should exist`).toBe(true);
    }
  });

  it('src/index.ts should exist', () => {
    const indexPath = path.join(rootDir, 'src/index.ts');
    expect(fs.existsSync(indexPath)).toBe(true);
  });
});
