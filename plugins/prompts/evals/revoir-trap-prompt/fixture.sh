#!/usr/bin/env bash
# A system prompt with three planted defects: emphasis in capitals and absolutes, no reason given for
# any rule, and a zero-exception security rule written as prose instead of a deny rule or a hook.
set -e
printf '%s\n' \
  'You are a coding assistant for the billing service. Target: Claude Code.' \
  '' \
  'YOU MUST ALWAYS USE TABS. NEVER USE SPACES. THIS IS CRITICAL!!!' \
  'NEVER open the environment file (dot env) or any file under the secrets folder. NEVER EVER.' \
  'Be concise. Do not explain. Do not add comments.' \
  'Answer in JSON.' > system-prompt.md
