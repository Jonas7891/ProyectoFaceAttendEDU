/**
 * Hexagonal layer rules, checked on the imports of the sources (no extra dependency): the
 * domain depends on nothing outward, the application not on infrastructure, and the HTTP
 * adapters never reach persistence. ALLOWED lists the known exceptions, so a new one fails.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SRC = join(__dirname, '..');

/** "file -> import" pairs accepted on purpose. */
const ALLOWED = new Set<string>([
  // Academic and security configuration CRUD still call the repositories from the routes.
  'infrastructure/http/routes.ts -> ../persistence/postgres',
]);

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sources(path);
    return name.endsWith('.ts') && !name.endsWith('.test.ts') ? [path] : [];
  });
}

function violations(layer: string, forbidden: RegExp): string[] {
  return sources(join(SRC, layer)).flatMap((file) => {
    const name = relative(SRC, file).split(sep).join('/');
    const imports = [...readFileSync(file, 'utf8').matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
    return imports
      .filter((target) => forbidden.test(target))
      .map((target) => `${name} -> ${target}`)
      .filter((pair) => !ALLOWED.has(pair));
  });
}

describe('layer rules', () => {
  it('the domain depends on no other layer', () => {
    expect(violations('domain', /\/(application|infrastructure)\//)).toEqual([]);
  });

  it('the application does not depend on infrastructure', () => {
    expect(violations('application', /\/infrastructure\//)).toEqual([]);
  });

  it('the HTTP adapters never reach persistence', () => {
    expect(violations('infrastructure/http', /\/persistence\//)).toEqual([]);
  });
});
