# Prompts

Short prompts to use during a Claude Code session. Paste verbatim.

## Session start

> Read CLAUDE.md fully. Acknowledge §4 (AI collaboration rules) and §9 (commit attribution)
> back to me explicitly. Then wait.

## Feature start

> I want to build <feature>. Before any code: propose 2–3 approaches — minimum / standard /
> robust — with a one-line trade-off for each. Wait for me to pick.

## TDD cycle start

> Propose the next failing test for <X>. Just the test name, arrange, and assertion. No
> production code. Wait for me to confirm.

## After green

> Propose a refactor — or say "no refactor needed". If you propose, justify in one line
> (clarity / duplication / coupling). Wait.

## Before commit

> Propose the commit message in Conventional Commits format. No AI attribution. Wait for
> me to confirm before staging or committing.

## Feature end

> Append an entry to artifacts/ai-collaboration.md using the template at the top of that
> file. Show me the entry first.

## If unsure

> Ask one closed question. Multiple-choice or yes/no. Do not guess. Do not interrogate.
