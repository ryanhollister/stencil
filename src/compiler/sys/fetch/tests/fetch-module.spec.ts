import { getNodeModuleFetchUrl, getStencilInternalDtsUrl, getStencilModuleUrl, getStencilRootUrl, skipFilePathFetch } from '../fetch-utils';

describe('fetch module', () => {
  let compilerExe: string;

  beforeEach(() => {
    compilerExe = 'http://localhost:3333/@stencil/core/compiler/stencil.js';
  });

  it('getStencilInternalDtsUrl', () => {
    expect(getStencilInternalDtsUrl(compilerExe)).toBe('http://localhost:3333/@stencil/core/internal/index.d.ts');

    compilerExe = 'https://cdn.jsdelivr.net/npm/@stencil/core@1.2.3/compiler/stencil.js';
    expect(getStencilInternalDtsUrl(compilerExe)).toBe('https://cdn.jsdelivr.net/npm/@stencil/core@1.2.3/internal/index.d.ts');
  });

  it('getStencilRootUrl', () => {
    expect(getStencilRootUrl(compilerExe)).toBe('http://localhost:3333/@stencil/core/');

    compilerExe = 'https://cdn.jsdelivr.net/npm/@stencil/core@1.2.3/compiler/stencil.js';
    expect(getStencilRootUrl(compilerExe)).toBe('https://cdn.jsdelivr.net/npm/@stencil/core@1.2.3/');
  });

  describe('getStencilModulePath', () => {
    it('cdn w/ version w/out node_module prefix', () => {
      compilerExe = 'https://cdn.jsdelivr.net/npm/@stencil/core@1.2.3/compiler/stencil.js';
      const p = 'internal/client/index.mjs';
      const m = getStencilModuleUrl(compilerExe, p);
      expect(m).toBe('https://cdn.jsdelivr.net/npm/@stencil/core@1.2.3/internal/client/index.mjs');
    });

    it('cdn w/ version', () => {
      compilerExe = 'https://cdn.jsdelivr.net/npm/@stencil/core@1.2.3/compiler/stencil.js';
      const p = '/node_modules/@stencil/core/package.json';
      const m = getStencilModuleUrl(compilerExe, p);
      expect(m).toBe('https://cdn.jsdelivr.net/npm/@stencil/core@1.2.3/package.json');
    });

    it('cdn w/out version', () => {
      compilerExe = 'https://cdn.jsdelivr.net/npm/@stencil/core/compiler/stencil.js';
      const p = '/node_modules/@stencil/core/internal/client/index.mjs';
      const m = getStencilModuleUrl(compilerExe, p);
      expect(m).toBe('https://cdn.jsdelivr.net/npm/@stencil/core/internal/client/index.mjs');
    });

    it('local w/out version w/out node_module prefix', () => {
      const p = 'package.json';
      const m = getStencilModuleUrl(compilerExe, p);
      expect(m).toBe('http://localhost:3333/@stencil/core/package.json');
    });

    it('local w/out version', () => {
      const p = '/node_modules/@stencil/core/package.json';
      const m = getStencilModuleUrl(compilerExe, p);
      expect(m).toBe('http://localhost:3333/@stencil/core/package.json');
    });
  });
});

describe('getNodeModuleFetchUrl', () => {
  let compilerExe: string;
  const pkgVersions = new Map<string, string>();

  beforeEach(() => {
    compilerExe = 'http://localhost:3333/@stencil/core/compiler/stencil.js';
    pkgVersions.clear();
  });

  it('cdn @stencil/core', () => {
    compilerExe = 'https://cdn.jsdelivr.net/npm/@stencil/core@1.2.3/compiler/stencil.js';
    const filePath = '/node_modules/@stencil/core/internal/hydrate/index.mjs';
    const url = getNodeModuleFetchUrl(compilerExe, pkgVersions, filePath);
    expect(url).toBe('https://cdn.jsdelivr.net/npm/@stencil/core@1.2.3/internal/hydrate/index.mjs');
  });

  it('local @stencil/core', () => {
    const filePath = '/node_modules/@stencil/core/package.json';
    const url = getNodeModuleFetchUrl(compilerExe, pkgVersions, filePath);
    expect(url).toBe('http://localhost:3333/@stencil/core/package.json');
  });

  it('w/ version number', () => {
    pkgVersions.set('/lodash/', '1.2.3');
    const filePath = '/node_modules/lodash/package.json';
    const url = getNodeModuleFetchUrl(compilerExe, pkgVersions, filePath);
    expect(url).toBe('https://cdn.jsdelivr.net/npm/lodash@1.2.3/package.json');
  });

  it('w/out version number', () => {
    const filePath = '/node_modules/lodash/package.json';
    const url = getNodeModuleFetchUrl(compilerExe, pkgVersions, filePath);
    expect(url).toBe('https://cdn.jsdelivr.net/npm/lodash/package.json');
  });

  it('w/ scoped package', () => {
    const filePath = '/node_modules/@ionic/core/package.json';
    const url = getNodeModuleFetchUrl(compilerExe, pkgVersions, filePath);
    expect(url).toBe('https://cdn.jsdelivr.net/npm/@ionic/core/package.json');
  });

  it('version w/ scoped package', () => {
    pkgVersions.set('/@ionic/core/', '1.2.3');
    const filePath = '/node_modules/@ionic/core/package.json';
    const url = getNodeModuleFetchUrl(compilerExe, pkgVersions, filePath);
    expect(url).toBe('https://cdn.jsdelivr.net/npm/@ionic/core@1.2.3/package.json');
  });
});

describe('skipFilePathFetch', () => {
  it('skip for known bogus node_module paths', () => {
    expect(skipFilePathFetch('/node_modules/index.mjs')).toBe(true);
    expect(skipFilePathFetch('/node_modules/lodash.js')).toBe(true);
    expect(skipFilePathFetch('/node_modules/lodash.md')).toBe(true);
    expect(skipFilePathFetch('/node_modules/lodash.json')).toBe(true);
    expect(skipFilePathFetch('/asdf/gadsf/aessd/gaes/node_modules/lodash.js')).toBe(true);
    expect(skipFilePathFetch('/asdf/node_modules/whatever/lodash.js')).toBe(false);
  });

  it('skip for ts and tsx', () => {
    expect(skipFilePathFetch('whatever.ts')).toBe(true);
    expect(skipFilePathFetch('whatever.tsx')).toBe(true);
  });
});
