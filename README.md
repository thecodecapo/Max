# Max (`@codecapo/max`)



[![npm version](https://img.shields.io/npm/v/@codecapo/max.svg)](https://www.npmjs.com/package/@codecapo/max)
[![npm downloads](https://img.shields.io/npm/dt/@codecapo/max.svg)](https://www.npmjs.com/package/@codecapo/max)
[![License: MIT](https://img.shields.io/npm/l/@codecapo/max.svg)](https://opensource.org/licenses/MIT)

**The package manager with the prune command we always wanted.** Max is a fast, local-first tool that safely finds and removes unused dependencies from your `node_modules`.

---

## Why Max?

The Node.js ecosystem is powerful, but `node_modules` bloat is a chronic problem. It wastes disk space, increases security risks, and complicates maintenance. Existing tools only prune "extraneous" packages, not declared-but-unused ones.

Max solves this by:
* **🧠 Using AST Parsing:** It reads your code to understand which modules are *actually* used, providing near-perfect accuracy.
* **🛡️ Being Safe by Default:** The `prune` command is a dry-run by default. It will never delete anything without your explicit `--apply` command.
* **🌍 Being Local-First:** No accounts, no cloud, no telemetry. It's a tool that runs on your machine, for your machine.

## Supported Frameworks

Max is built to be intelligent. It automatically detects the following projects and applies a set of rules to avoid incorrectly pruning their essential dependencies:

* Next.js
* Vite
* Astro
* Generic Node.js

*Support for more frameworks (like SvelteKit, Remix, etc.) is coming soon!*

## Installation

```bash
npm install -g @codecapo/max
```
## Usage

Navigate to your project directory and run the prune command.

1. Dry Run (See what's unused)
This is the default command. It's 100% safe and will only report what it finds.

```
Bash

max prune

```

2. Apply (Remove unused packages)
To permanently remove the unused dependencies, use the --apply flag.

```
Bash

max prune --apply

```

## Contributing
We'd love your help! Please see our CONTRIBUTING.md to get started.