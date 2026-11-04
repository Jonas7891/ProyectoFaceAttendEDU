import { PostgresDeviceTokenRepository } from '../infrastructure/persistence/postgres/device-token.repository';

jest.mock('../infrastructure/db/database', () => ({ runQuery: jest.fn() }));
const database = require('../infrastructure/db/database');

/** AUD-33: device_token carries deleted_at (logical delete); reads must ignore those rows. */
describe('PostgresDeviceTokenRepository soft delete (deleted_at)', () => {
  const repo = new PostgresDeviceTokenRepository();

  beforeEach(() => {
    database.runQuery.mockReset();
    database.runQuery.mockResolvedValue([{ device_token_id: 1 }]);
  });

  const lastSql = (): string => String(database.runQuery.mock.calls[0][0]);

  it('findActiveByActor never returns a logically deleted token', async () => {
    await repo.findActiveByActor(7);
    expect(lastSql()).toMatch(/revoked_at IS NULL/);
    expect(lastSql()).toMatch(/deleted_at IS NULL/);
  });

  it('upsert re-activates a token and clears a previous logical delete', async () => {
    await repo.upsert(7, 'ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]', 'ios', 'es');
    expect(lastSql()).toMatch(/deleted_at = NULL/);
    expect(lastSql()).toMatch(/deleted_by = NULL/);
  });

  it('revoke queries only touch live rows', async () => {
    await repo.revokeOwned('t', [7]);
    expect(lastSql()).toMatch(/deleted_at IS NULL/);
    database.runQuery.mockClear();
    await repo.revokeTokens(['t']);
    expect(lastSql()).toMatch(/deleted_at IS NULL/);
  });
});
