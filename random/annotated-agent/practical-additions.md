# Practical Additions for Each Chapter

Actionable advice for Claude Code and Codex users. These are things users can do today, not unshipped features.

TODO: include screenshot of `/cost` output showing cached vs uncached tokens.

---

## Chapter 1: Prompt & Extensions

### Prompt Caching
- Claude Code: run `/cost` to see cached vs uncached tokens per turn. If cached tokens are low, something is invalidating your cache (likely a changed tool or new MCP server).
- Codex: no equivalent command. Caching is server-side and invisible to the user.

### Permission Rules
- Claude Code: `cat ~/.claude/settings.json` shows your saved permission rules under `allow`, `deny`, and `ask` keys. To revoke an overly broad glob rule, edit the file directly and remove the entry. Rules persist across sessions.
- Codex: approvals are session-only exact-match. Nothing persists to disk. Every new session starts clean.

**Claude Code permission rule examples** (in `~/.claude/settings.json`):

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm test)",
      "Bash(npm run *)",
      "Read(*.ts)",
      "Write(src/**)",
      "Edit(src/**)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Write(/etc/**)",
      "Write(.env)"
    ],
    "ask": [
      "Bash(curl *)",
      "Bash(docker *)",
      "Edit(package.json)"
    ]
  }
}
```

The format is `ToolName(pattern)`. `*` matches anything within one path segment, `**` matches across segments. Some real patterns:
- `Bash(git *)` allows all git commands without prompting
- `Bash(npm run *)` allows any npm script
- `Write(src/**)` allows writing anywhere under src/
- `Bash(rm -rf *)` in deny blocks all recursive deletes
- `Edit(package.json)` in ask always prompts before editing package.json

### Hooks

Both systems support hooks that fire at lifecycle events. The configuration lives in `settings.json` (Claude Code) or `.codex/config.toml` (Codex).

**Claude Code hook example** — block `git push` without tests passing:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/check-push.py",
            "timeout": 30,
            "if": "Bash(git push*)"
          }
        ]
      }
    ]
  }
}
```

The hook script (`.claude/hooks/check-push.py`) receives the tool input as JSON on stdin. Return exit code 0 to allow, exit code 2 to block (with reason on stderr).

```python
#!/usr/bin/env python3
import json, subprocess, sys
data = json.load(sys.stdin)
cmd = data.get("tool_input", {}).get("command", "")
if "push" in cmd:
    result = subprocess.run(["npm", "test"], capture_output=True)
    if result.returncode != 0:
        print("Tests must pass before pushing", file=sys.stderr)
        sys.exit(2)
sys.exit(0)
```

**Claude Code hook example** — lint after every file write:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx eslint --fix $FILE_PATH",
            "statusMessage": "linting written file"
          }
        ]
      }
    ]
  }
}
```

Claude Code supports 4 hook types: `command` (shell script), `prompt` (LLM evaluation), `agent` (full agentic verification), and `http` (POST to a URL). 26 event types are available, including `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `SessionStart`, `Stop`, `SubagentStart`, `TaskCreated`, `FileChanged`, and more.

**Codex hook example** — block dangerous commands:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .codex/hooks/safety-check.py",
            "statusMessage": "checking command safety"
          }
        ]
      }
    ]
  }
}
```

Codex hooks follow the same JSON format but only support the `command` type (shell scripts). Hooks can return JSON with `decision: "block"` and a reason, or use exit code 2 to block. Codex hooks can gate actions but cannot modify tool inputs or inject context.

### Skills

**How to create a skill manually:**

1. Create a directory: `mkdir -p .claude/skills/my-deploy/`
2. Create `SKILL.md`:

```markdown
---
description: Deploy to staging environment
allowed-tools:
  - Bash(git *)
  - Bash(npm run deploy:*)
---

# Deploy to Staging

## Steps
1. Run tests: `npm test`
2. Build: `npm run build`
3. Deploy: `npm run deploy:staging`
4. Verify the deployment at https://staging.example.com

## Rules
- Never deploy to production from this skill
- Always run tests before deploying
- If tests fail, stop and report the failure
```

3. Invoke it: type `/my-deploy` in Claude Code.

**Supported SKILL.md frontmatter fields:**
- `description` — one-line description (required for auto-invocation)
- `allowed-tools` — restrict which tools the skill can use (array of patterns)
- `context` — `inline` (default) or `fork` (runs as a sub-agent)
- `model` — override model: `haiku`, `sonnet`, `opus`
- `paths` — glob patterns to gate visibility (e.g., `**/*.py` only shows this skill in Python projects)
- `argument-hint` — example arguments for the user
- `user-invocable` — `"true"` or `"false"` (whether `/name` works)

**How to use the agent to create a skill:**
- Claude Code: run `/skillify` or tell the agent "create a skill that does X." The built-in `skillify` skill guides you through the process interactively.
- Codex: run `$skill-creator`. The built-in skill-creator skill walks you through creating a new skill directory with the right structure.

### CLAUDE.md / AGENTS.md
- Keep it under ~2K tokens. Every token burns prompt space on every turn.
- What to include: coding standards, preferred test commands, deployment rules, project-specific context the agent can't derive from the code.
- What NOT to include: things the agent can learn by reading the code (file structure, imports, function signatures).
- Claude Code: supports 4-tier hierarchy. `~/.claude/CLAUDE.md` (global), `.claude/CLAUDE.md` (project), `.claude/local/CLAUDE.md` (local overrides, gitignored). Use `.claude/rules/*.md` for structured rules that don't clutter the main file.
- Codex: nest `AGENTS.md` files. `AGENTS.md` at repo root for project-wide rules, `src/api/AGENTS.md` for API-specific rules. Codex walks from root to CWD and concatenates all of them.

### Plan Mode

**Claude Code — three ways to enter plan mode:**
1. **Keyboard**: press `Shift+Tab` to toggle into plan mode. Press again to toggle back.
2. **Command**: type `/plan` in the input.
3. **Agent-initiated**: the agent can call `EnterPlanMode` itself when it decides the task needs planning. You'll see a permission dialog: "Claude wants to enter plan mode to explore and design an implementation approach." Approve or reject.

In plan mode, write tools (Edit, Write, Bash) are disabled. The agent can only read files, search, and think. It proposes an approach, and you approve or reject it via `ExitPlanMode`. This prevents the agent from diving into implementation before you agree on the approach.

**Codex — mode cycling:**
1. **Keyboard**: press `Shift+Tab` to cycle through modes: Default → Plan → Execute → Pair Programming → Default.
2. **Command**: type `/plan` to enter Plan mode directly.
3. **Config**: set the default mode in `~/.codex/config.toml`:
   ```toml
   [agent]
   collaboration_mode = "plan"  # or "execute", "pair", "default"
   ```

The current mode shows in the footer of the TUI. Each mode changes the system prompt:
- **Plan**: "Ask questions, propose an approach, wait for approval before acting."
- **Execute**: "Make assumptions rather than asking questions. Be mindful of time."
- **Pair**: "Assume you are a team. Work alongside the user."
- **Default**: standard behavior.

---

## Chapter 2: Context Construction and Management

### Context Window Awareness
- Claude Code: `/cost` shows token usage per turn. If costs spike, your context is full and compaction is kicking in. Watch for the agent repeating itself or forgetting earlier decisions: that's a sign compaction dropped something important.
- Codex: token counting uses a bytes/4 heuristic, not a tokenizer. The `auto_compact_token_limit` in config controls when compaction fires.

**How to add context usage to your status line (Claude Code):**

Claude Code supports a custom status line at the bottom of the terminal. Configure it in `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

Your script receives a JSON payload on stdin with context window data. Here's a script that shows model name and context usage:

```bash
#!/bin/bash
input=$(cat)
model=$(echo "$input" | jq -r '.model.display_name // "unknown"')
usage=$(echo "$input" | jq -r '.context_window.used_percentage // 0')
printf "%s [%.0f%% context]" "$model" "$usage"
```

Make it executable: `chmod +x ~/.claude/statusline.sh`. The status line updates on every turn. The JSON payload also includes `rate_limits` (5-hour and 7-day usage), `vim.mode`, `agent.name`, and `worktree` info.

You can also run `claude statusline "show model and context usage"` to generate a status line script interactively.

### Manual Compaction
- Claude Code: `/compact` forces immediate compaction. Use when the agent seems confused, repetitive, or when you've changed direction and want to clear old context. You can pass a message: `/compact focus on the auth module only` to guide what the summary preserves.
- Codex: no manual compact command. Compaction fires automatically at the token threshold.

### CLAUDE.md Structure
- Use `.claude/rules/*.md` for team rules that don't clutter the main CLAUDE.md. Each rule file is a separate concern: `testing.md`, `deploy.md`, `style.md`.
- Use `@include` to pull in external files: `@include ../docs/api-conventions.md`.
- The 4-tier precedence: managed policies (org-level, can't override) > user settings (`~/.claude/CLAUDE.md`) > project (`.claude/CLAUDE.md`) > local overrides (`.claude/local/CLAUDE.md`, gitignored).

### AGENTS.md Structure
- Nest them by directory depth. Root `AGENTS.md` for project-wide rules. `src/api/AGENTS.md` for API-specific context. Codex concatenates all files from root to CWD.
- Codex caps by byte count. Claude Code doesn't cap but relies on compaction. If your AGENTS.md is huge, the agent pays the cost every turn.

### What to Do When Context Feels Stale
- If the agent forgets a decision you made earlier, it was probably compacted. Repeat the key constraint in your next message.
- If the agent keeps re-reading files it already read, compaction cleared the tool results. This is normal for long sessions.
- Start a new session for a genuinely new task. Don't reuse a 50-turn session for unrelated work.

---

## Chapter 3: The Security Layer

### Permission Modes
- Claude Code has three modes:
  - **Default**: asks permission for everything except reads and searches.
  - **`allowEdits`**: auto-approves file edits within the project directory. Still asks for shell commands and destructive operations.
  - **`auto`**: the classifier LLM decides. Most file operations and safe commands get auto-approved. Dangerous commands still prompt. This is the fastest mode for experienced users.
  - Set mode: `claude --allowedTools 'Edit(*)' 'Write(*)'` or configure in `settings.json`.
- Codex: permission mode is set by the sandbox policy. `full-auto` auto-approves everything inside the sandbox. `suggest` asks for everything. Set in config.toml.

### Undo
- Claude Code: `/rewind` shows a list of recent file snapshots with timestamps. Pick one to restore. Each tool call that modifies files creates a snapshot. Works like time-travel for your working directory.
- Codex: uses git. Every session creates a detached commit before starting. `git stash` or `git checkout .` to revert. Check `git reflog` for the pre-session state.

### When You See a Permission Prompt You Don't Understand
- Deny it. Then ask the agent: "explain what that command would do and why you need it."
- Claude Code: the permission dialog shows the tool name, the exact input (file path, command string), and a description. Read the command string carefully.
- Codex: the TUI overlay shows the command. If it's a shell command, read it like you'd read a command before running it yourself.

### Dangerous Command Awareness
- Both systems warn before destructive commands (`rm -rf`, `git reset --hard`, `git push --force`).
- Claude Code: sed commands show a diff preview before approval so you can see what will change.
- If the agent proposes a destructive operation and you're unsure, ask it to use a safer alternative. "Use git stash instead of git checkout ." or "use rm on specific files instead of rm -rf."

---

## Chapter 4: The Swarm

### When to Use Multi-Agent
- If a task touches 3+ unrelated files or areas, multi-agent is faster than sequential.
- If you need research + implementation + verification, three agents in parallel beat one agent doing all three sequentially.
- If you're not sure, don't force it. A single agent with good context handles most tasks.

### Claude Code Teams
- Simplest way: let the agent decide. For complex tasks, it will spawn workers automatically.
- To force it: "Use a team with tmux to parallelize this." The agent creates a team with the tmux backend and you see each worker in its own terminal pane.
- In-process backend (`backend="in-process"`) is invisible and cheapest. Good for when you don't need to watch workers.
- Tasks appear in the left panel. Click to expand. Tasks persist across context compaction.

### Codex Multi-Agent
- Codex won't spawn children unless you ask. Say "use sub-agents to parallelize this" or "delegate the search to an explorer agent."
- Three roles: `explorer` (fast, read-only), `worker` (implementation), `default` (no special config).
- Fork mode: a child inherits the last N turns of parent context. Good for "continue what I was doing but focus on this part."

### Watching Agent Work
- Claude Code (tmux): each agent gets a pane with a colored border. Leader in the left 30%, workers in the right 70%. Watch them work in real time.
- Claude Code (in-process): invisible. Check progress via the task panel.
- Codex: child agents appear in the agent tree. Use the TUI to see their status.

---

## Chapter 5: The Stream and Tool Executor

### Verbose Toggle
- Claude Code: `Shift+V` switches between collapsed and expanded tool output.
- Collapsed: each tool shows a one-line summary ("Read src/auth.ts (142 lines)"). Better for long sessions where you don't need every detail.
- Expanded: full tool output visible. Better for debugging or when you want to see exactly what the agent read/wrote.

### Plan Tracking
- Ask the agent to make a plan before starting complex work: "Make a plan for this refactor before writing code."
- Both systems support plan tracking. Both produce better results when the agent plans first.
- Claude Code: tasks appear in the left panel with status indicators. The agent marks them complete as it goes.
- Codex: the plan renders as a checklist in the chat with cyan highlighting for the active step.
- If the agent skips planning on a multi-step task, ask for one. Plans force decomposition, and decomposition catches errors earlier.

### Concurrent Tool Execution
- You don't control this directly. But knowing about it explains why some operations are fast (parallel reads) and others are slow (serial writes).
- Claude Code: reads (file read, grep, glob) run in parallel. Writes (file edit, bash) run serially.
- Codex: all tools fire concurrently. The sandbox limits blast radius.

---

## Chapter 6: The Memory Layer

### View Your Agent's Memories
- Claude Code: `ls ~/.claude/projects/` shows project-specific memory directories. Each project gets its own folder (named by path hash). Inside: `memory/MEMORY.md` (index) and topic files like `feedback_testing.md`, `user_role.md`.
- Read `MEMORY.md` to see what your agent remembers about you and your project.
- Codex: memories are in the SQLite database (not yet shipped to users). `memory_summary.md` is the visible output.

### Add a Memory
- Claude Code: tell the agent "remember that I prefer explicit error handling" or "remember that we use pytest not unittest." The agent writes a markdown file and updates the index.
- You can also create memory files manually. Create `~/.claude/projects/<project>/memory/my-memory.md` with frontmatter:
  ```
  ---
  name: testing-preference
  description: User prefers pytest over unittest
  type: feedback
  ---
  Use pytest for all test files. User corrected this on 2026-04-10.
  ```
  Then add a pointer to `MEMORY.md`: `- [Testing preference](my-memory.md) — use pytest not unittest`.

### Memory Types
- `user`: your role, preferences, knowledge level. Helps the agent tailor explanations.
- `feedback`: corrections you've given. "Don't mock the database" or "stop summarizing at the end."
- `project`: ongoing work context. Sprint goals, deadlines, who owns what.
- `reference`: pointers to external systems. "Bugs tracked in Linear project INGEST."

### When Memories Go Wrong
- If the agent acts on outdated information, check the memory files. Delete or update the stale one.
- If the agent keeps doing something you corrected, check if the feedback memory was saved. Run "do you remember what I said about X?" to verify.
- Memories consolidate automatically (Claude Code: after 24h + 5 sessions). No manual trigger exposed.

---

## Chapter 7: Voice and Personality

### Voice Input
- Claude Code: hold Space to talk, release to submit. The transcription goes into the input field as if you typed it.
- Change the trigger key: edit `~/.claude/keybindings.json`. Map a different key to the voice action.
- Supports: English, Spanish, French, Japanese, German, Portuguese, Italian, Korean. Language is auto-detected.
- Codex: bidirectional voice. The agent talks back. Works on macOS and Windows (not Linux).

### When Voice is Better Than Typing
- When you're explaining context or intent: "I think the bug is related to the token refresh changes we made last week, the reconnect fires before the new token comes back."
- When typing would compress too much: voice captures your full thinking, typing trims it to "fix the reconnect logic."
- When you're reviewing code: narrate what you see and what concerns you.

### Buddy (Claude Code)
- `/buddy` shows your companion sprite in the terminal.
- `/buddy pet` interacts with it (floating hearts).
- The buddy is cosmetic. It doesn't affect agent behavior. But users report phrasing requests differently when the buddy is visible.
- Each account gets a unique buddy (species, accessories, stats) generated from your account ID. You can't change it.

---

## Chapter 8: The Future

These features are mostly unshipped or behind feature flags. No actionable advice for current users, but worth knowing about:

- **KAIROS** (Claude Code): persistent daemon mode. The agent stays alive, monitors CI, watches for review comments, consolidates learnings. Behind a feature flag.
- **Code Mode** (Codex): JavaScript execution in a V8 isolate. The agent writes code that runs in a sandbox. Behind a feature flag.
- **SpawnCsv** (Codex): batch execution. Give the agent a CSV and a template, it spawns one worker per row. Behind a feature flag.
- **Communication channels**: Claude Code is building MCP-based Slack/Discord/SMS notifications. Codex is building a curated app marketplace via ChatGPT.

If you're building on either system, these unshipped features signal where the teams think agent CLIs are heading: persistent, autonomous, multi-modal, and connected to external communication channels.
