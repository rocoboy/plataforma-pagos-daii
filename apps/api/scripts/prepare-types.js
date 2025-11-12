#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectDir = process.cwd();
const generatedDir = path.resolve(projectDir, '.generated');
const outputDir = path.resolve(generatedDir, 'types');
const localTypesDir = path.resolve(projectDir, '..', 'types');

const repoSlug =
  process.env.GITHUB_REPOSITORY || 'rocoboy/plataforma-pagos-daii';
const gitRef =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GIT_COMMIT_SHA ||
  process.env.GIT_COMMIT ||
  'HEAD';
const archiveDirName = `plataforma-pagos-daii-${gitRef.replace(
  /[^\w.-]/g,
  '-'
)}`;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanOutput() {
  fs.rmSync(outputDir, { recursive: true, force: true });
  ensureDir(generatedDir);
}

function copyLocalTypes() {
  fs.cpSync(localTypesDir, outputDir, { recursive: true });
  console.log(`[prepare-types] Copied local types from ${localTypesDir}`);
}

function extractFromGit() {
  console.log(`[prepare-types] Exporting types from git ref ${gitRef}`);
  const archive = spawnSync('git', ['archive', gitRef, 'apps/types'], {
    cwd: projectDir,
    encoding: null,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (archive.status !== 0) {
    const stderr = archive.stderr ? archive.stderr.toString() : '';
    throw new Error(
      `[prepare-types] git archive failed (status ${archive.status}): ${stderr}`
    );
  }

  const tar = spawnSync(
    'tar',
    ['-x', '--strip-components=1', '-C', generatedDir],
    {
      input: archive.stdout,
      encoding: null,
      stdio: ['pipe', 'inherit', 'inherit'],
    }
  );

  if (tar.status !== 0) {
    throw new Error(
      `[prepare-types] tar extraction failed (status ${tar.status})`
    );
  }

  if (!fs.existsSync(outputDir)) {
    throw new Error(
      '[prepare-types] Expected types folder missing after git extraction'
    );
  }

  console.log(`[prepare-types] Exported types into ${outputDir}`);
}

function downloadFromRemote() {
  const archiveUrl = `https://codeload.github.com/${repoSlug}/tar.gz/${gitRef}`;
  console.log(`[prepare-types] Downloading types from ${archiveUrl}`);

  const curl = spawnSync('curl', ['-sL', archiveUrl], {
    encoding: null,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  if (curl.status !== 0) {
    throw new Error(
      `[prepare-types] curl failed (status ${curl.status}) while fetching ${archiveUrl}`
    );
  }

  const tar = spawnSync(
    'tar',
    [
      '-x',
      '--strip-components=2',
      '-C',
      generatedDir,
      '-f',
      '-',
      `${archiveDirName}/apps/types`,
    ],
    {
      input: curl.stdout,
      encoding: null,
      stdio: ['pipe', 'inherit', 'inherit'],
    }
  );

  if (tar.status !== 0) {
    throw new Error(
      `[prepare-types] tar extraction failed (status ${tar.status}) from remote archive`
    );
  }

  if (!fs.existsSync(outputDir)) {
    throw new Error(
      '[prepare-types] Expected types folder missing after remote download'
    );
  }

  console.log(`[prepare-types] Downloaded types into ${outputDir}`);
}

try {
  cleanOutput();

  if (fs.existsSync(localTypesDir)) {
    copyLocalTypes();
  } else {
    try {
      extractFromGit();
    } catch (gitError) {
      console.warn(
        `[prepare-types] git archive unavailable, falling back to remote download: ${
          gitError instanceof Error ? gitError.message : gitError
        }`
      );
      downloadFromRemote();
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

