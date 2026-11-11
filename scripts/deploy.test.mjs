import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readlink, symlink, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const oldRevision = 'a'.repeat(40);
const revision = 'b'.repeat(40);

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-deploy-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'bin'));
  await writeFile(join(root, '.env'), 'DOMAIN=portfolio.example\n');
  for (const ref of [oldRevision, revision]) {
    await mkdir(join(root, 'releases', ref), { recursive: true });
    await writeFile(join(root, 'releases', ref, 'compose.yaml'), 'services: {}\n');
  }
  await symlink(`releases/${oldRevision}`, join(root, 'current'));
  await writeFile(
    join(root, 'bin', 'docker'),
    `#!/usr/bin/env bash
printf '%s|%s\\n' "$IMAGE_TAG" "$*" >> "$DEPLOY_TEST_LOG"
if [[ "$IMAGE_TAG" == "$DEPLOY_TEST_FAIL_REV" && "$*" == *" $DEPLOY_TEST_FAIL_COMMAND "* ]]; then exit 1; fi
`,
    { mode: 0o755 },
  );
  return {
    root,
    run(command = '') {
      return spawnSync('bash', [resolve('scripts/deploy.sh'), root, revision], {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${join(root, 'bin')}:${process.env.PATH}`,
          DEPLOY_TEST_LOG: join(root, 'calls'),
          DEPLOY_TEST_FAIL_REV: revision,
          DEPLOY_TEST_FAIL_COMMAND: command,
        },
      });
    },
    calls: () => readFile(join(root, 'calls'), 'utf8'),
    current: () => readlink(join(root, 'current')),
  };
}

test('deploys a revision-specific image and advances current only after health succeeds', async (t) => {
  const fixtureState = await fixture(t);
  const result = fixtureState.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(await fixtureState.current(), `releases/${revision}`);
  const calls = await fixtureState.calls();
  assert.match(calls, /build --pull portfolio/);
  assert.match(calls, /up -d --no-build --wait --wait-timeout 120 portfolio/);
  assert.ok(
    calls
      .split('\n')
      .filter(Boolean)
      .every((line) => line.startsWith(revision)),
  );
});

test('restores the previous image on health failure and keeps the workflow failed', async (t) => {
  const fixtureState = await fixture(t);
  const result = fixtureState.run('up');
  assert.equal(result.status, 1);
  assert.equal(await fixtureState.current(), `releases/${oldRevision}`);
  assert.ok((await fixtureState.calls()).includes(`${oldRevision}|compose`));
  assert.match(result.stderr, /retour à la version précédente/);
});

test('leaves the running release untouched when the build fails', async (t) => {
  const fixtureState = await fixture(t);
  const result = fixtureState.run('build');
  assert.equal(result.status, 1);
  assert.equal(await fixtureState.current(), `releases/${oldRevision}`);
  assert.ok(!(await fixtureState.calls()).includes('up -d'));
});
