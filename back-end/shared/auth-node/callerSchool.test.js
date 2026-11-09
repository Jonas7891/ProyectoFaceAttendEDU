'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { ROLES, ScopeError, createCallerSchoolResolver, clearCallerSchoolCache } = require('./index');

/** A getJson that answers by URL fragment and records every call. */
function stubGetJson(routes) {
  const calls = [];
  const getJson = async (url) => {
    calls.push(url);
    for (const [part, answer] of routes) {
      if (url.includes(part)) {
        if (answer instanceof Error) throw answer;
        return answer;
      }
    }
    return { status: 404, body: null };
  };
  return { getJson, calls };
}

const roles = (...names) => ({ status: 200, body: names.map((roleName) => ({ roleName })) });
const user = (personId) => ({ status: 200, body: { personId } });
const req = (userId) => ({ userId, authToken: 't' });

test.beforeEach(() => clearCallerSchoolCache());

test('a Super Administrador is unrestricted without looking up a person or an actor', async () => {
  const { getJson, calls } = stubGetJson([['/roles', roles(ROLES.SUPER_ADMIN)]]);
  const resolve = createCallerSchoolResolver({ getJson, actorsOf: async () => assert.fail('no actor lookup') });

  assert.deepEqual(await resolve(req('u1')), { isSuperAdmin: true, schoolId: null });
  assert.equal(calls.length, 1);
});

test('an Administrador gets the school of their first actor that has one', async () => {
  const { getJson } = stubGetJson([['/roles', roles(ROLES.SCHOOL_ADMIN)], ['/users/u2', user('p2')]]);
  const resolve = createCallerSchoolResolver({
    getJson,
    actorsOf: async (personId) => (personId === 'p2' ? [{ schoolId: null }, { schoolId: 7 }] : []),
  });

  assert.deepEqual(await resolve(req('u2')), { isSuperAdmin: false, schoolId: 7 });
});

test('a caller without a person or an actor fails secure to no school', async () => {
  const noPerson = createCallerSchoolResolver({
    getJson: stubGetJson([['/roles', roles(ROLES.SCHOOL_ADMIN)], ['/users/u3', { status: 404, body: null }]]).getJson,
    actorsOf: async () => assert.fail('no actor lookup'),
  });
  assert.deepEqual(await noPerson(req('u3')), { isSuperAdmin: false, schoolId: null });

  const noActor = createCallerSchoolResolver({
    getJson: stubGetJson([['/roles', roles(ROLES.INSTRUCTOR)], ['/users/u4', user('p4')]]).getJson,
    actorsOf: async () => [],
  });
  assert.deepEqual(await noActor(req('u4')), { isSuperAdmin: false, schoolId: null });
});

test('the answer is cached per user', async () => {
  const { getJson, calls } = stubGetJson([['/roles', roles(ROLES.SCHOOL_ADMIN)], ['/users/u5', user('p5')]]);
  const resolve = createCallerSchoolResolver({ getJson, actorsOf: async () => [{ schoolId: 1 }] });

  await resolve(req('u5'));
  await resolve(req('u5'));
  assert.equal(calls.length, 2);
});

test('failures answer 503 and an anonymous request 403, never unrestricted', async () => {
  const down = new Error('down');
  const rolesDown = createCallerSchoolResolver({ getJson: stubGetJson([['/roles', down]]).getJson, actorsOf: async () => [] });
  await assert.rejects(rolesDown(req('u6')), (e) => e instanceof ScopeError && e.statusCode === 503 && e.message === 'Cannot verify roles');

  const identityDown = createCallerSchoolResolver({
    getJson: stubGetJson([['/roles', roles(ROLES.SCHOOL_ADMIN)], ['/users/u7', down]]).getJson,
    actorsOf: async () => [],
  });
  await assert.rejects(identityDown(req('u7')), (e) => e.statusCode === 503 && e.message === 'Cannot resolve the user person');

  await assert.rejects(rolesDown({}), (e) => e instanceof ScopeError && e.statusCode === 403);
});
