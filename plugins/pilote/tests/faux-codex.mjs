#!/usr/bin/env node
// A fake `codex` for tests. It records its arguments, then behaves as FAUX_CODEX says:
//   ok        a turn that completes with a final message
//   ecrit     same, but writes a file in the workdir (to trip the read-only wire)
//   reecrit   same, but rewrites deja-modifie.txt in the workdir, a file already dirty before the run
//   echoue    turn.failed
//   quota     turn.failed with a rate-limit message
//   muet      completes with no final message
//   lent      sleeps longer than any test deadline
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const arg = (flag) => { const i = args.indexOf(flag); return i === -1 ? null : args[i + 1]; };
if (process.env.FAUX_CODEX_ARGS) fs.appendFileSync(process.env.FAUX_CODEX_ARGS, `${JSON.stringify(args)}\n`);
const mode = process.env.FAUX_CODEX || 'ok';
const emit = (e) => process.stdout.write(`${JSON.stringify(e)}\n`);

emit({ type: 'thread.started', thread_id: 't-1' });
emit({ type: 'item.completed', item: { type: 'error', message: 'skills budget exceeded (notice)' } });
emit({ type: 'item.completed', item: { type: 'command_execution', command: 'git status' } });

if (mode === 'lent') await new Promise((r) => setTimeout(r, 60000));
if (mode === 'echoue') { emit({ type: 'turn.failed', error: { message: 'boom' } }); process.exit(1); }
if (mode === 'quota') {
  const model = arg('-m');
  if (model !== 'secours') { emit({ type: 'turn.failed', error: { message: 'rate limit reached' } }); process.exit(1); }
}
if (mode === 'ecrit') fs.writeFileSync(path.join(arg('-C'), 'ecrit-par-le-worker.txt'), 'x\n');
if (mode === 'reecrit') fs.writeFileSync(path.join(arg('-C'), 'deja-modifie.txt'), 'rewritten by the worker\n');
if (mode !== 'muet') fs.writeFileSync(arg('-o'), `answer from ${arg('-m')}`);
emit({ type: 'turn.completed', usage: { input_tokens: 100, output_tokens: 20, cached_input_tokens: 50 } });
