#!/usr/bin/env bash
# A small repository with one committed file to review, so the agent can write a real contract.
set -e
git init -q
git config user.email test@example.invalid
git config user.name test
git config core.hooksPath .no-hooks
mkdir -p src
printf '%s\n' \
  '// Retries fn up to `times` times. Returns the first successful result.' \
  'async function retry(fn, times) {' \
  '  let lastError;' \
  '  for (let i = 0; i <= times; i++) {' \
  '    try { return await fn(); } catch (e) { lastError = e; }' \
  '  }' \
  '  throw lastError;' \
  '}' \
  'module.exports = { retry };' > src/retry.js
git add -A
git commit -qm "add retry helper"
