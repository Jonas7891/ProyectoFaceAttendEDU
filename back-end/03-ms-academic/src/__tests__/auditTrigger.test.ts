import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * The academic repositories never write `row_version`: they expose it as read-only
 * and delegate it to `academic.fn_audit_timestamps()`. These checks walk the
 * Liquibase changelog in include order and inspect the last definition, which is
 * the one that stays deployed, so a later changeset can replace an earlier body
 * without the test pinning the historical file.
 */
const TCL_DIR = resolve(__dirname, '../../../../database/03-ms-academic-db/04-tcl');
const FUNCTION_HEADER = 'CREATE OR REPLACE FUNCTION academic.fn_audit_timestamps()';
const FUNCTION_END = '$$ LANGUAGE plpgsql;';

function auditFunctionDefinitions(): string[] {
  const changelog = readFileSync(join(TCL_DIR, 'changelog.yaml'), 'utf8');
  const definitions: string[] = [];

  for (const include of changelog.matchAll(/file:\s*(\S+\.yaml)/g)) {
    const yaml = readFileSync(join(TCL_DIR, include[1]), 'utf8');
    const sources = [yaml];
    for (const sqlFile of yaml.matchAll(/path:\s*(\S+\.sql)/g)) {
      sources.push(readFileSync(join(TCL_DIR, sqlFile[1]), 'utf8'));
    }

    for (const source of sources) {
      // A changeset may recreate the function again in its rollback block; only the
      // forward `changes` section defines what stays deployed.
      const forward = source.split(/\n\s*rollback:/)[0];
      let start = forward.indexOf(FUNCTION_HEADER);
      while (start !== -1) {
        const end = forward.indexOf(FUNCTION_END, start);
        definitions.push(forward.slice(start, end === -1 ? undefined : end));
        start = forward.indexOf(FUNCTION_HEADER, start + 1);
      }
    }
  }

  return definitions;
}

describe('academic audit trigger (AUD-23)', () => {
  it('the deployed definition starts row_version at 1 on insert', () => {
    const definitions = auditFunctionDefinitions();
    expect(definitions).not.toHaveLength(0);
    expect(definitions[definitions.length - 1]).toMatch(
      /NEW\.row_version\s*:?=\s*COALESCE\(NEW\.row_version,\s*1\)/,
    );
  });

  it('the deployed definition increments row_version on update', () => {
    const definitions = auditFunctionDefinitions();
    expect(definitions).not.toHaveLength(0);
    expect(definitions[definitions.length - 1]).toMatch(
      /NEW\.row_version\s*:?=\s*OLD\.row_version\s*\+\s*1/,
    );
  });
});
