lazy-command.js
===============
[![Build Status](https://travis-ci.org/DoumanAsh/lazy-command.js.svg?branch=master)](https://travis-ci.org/DoumanAsh/lazy-command.js) [![Coverage Status](https://coveralls.io/repos/github/DoumanAsh/lazy-command.js/badge.svg)](https://coveralls.io/github/DoumanAsh/lazy-command.js)

Rust-like Command wrapper over node.js child_process

It provides simple & unified builder for Node.js `child_process`

## Overview

### Defaults

- Inherits parent's environment.
- Inherits parent's current directory.

### Execution methods

- **spawn** - Equal to `child_process.spawn` or `child_process.spawnSync`.
- **exec** - Equal to `child_process.exec` or `child_process.execSync`.
- **execFile** - Equal to `child_process.execFile` or `child_process.execFileSync`.
- **output** - Equal to `child_process.spawnSync` but returns only status, stdout and stderr.
- **status** - Equal to `child_process.execSync` but returns only status.

### Sync vs Async

By default Command executes asynchronously.

In order to configure command for synchronous execution you need to call method **sync**

For example to perform **exec** synchronously:
```
const status = require('lazy-command.js')('git -status').sync().exec()
```

For asynchronous version you need to omit **sync**.
```
const status = require('lazy-command.js')('git -status').exec()
```

### Async callback

Setting of callback is optional but method **callback** can be used to provide it.

The signature of callback is the same as for any corresponding child_process functions.

For example:
```
const cb = (err, stdout, stderr) => {
    console.log("Err=%s | stdout=%s | stderr=%s", err, stdout, stderr);
};
const status = require('lazy-command.js')('git -status').callback(cb).exec()
```

## Examples

#### Collect all output of command

```javascript
const Command = require('lazy-command.js');

const result = Command("git -status").encoding('utf-8').output();

console.log("status=% | stdout=%s | stderr=%s",
            result.status, result.stdout, result.stderr);
```

#### Just get status code

```javascript
const Command = require('lazy-command.js');

const result = Command("git -status").stdio_ignore().status();;

console.log("Status=%s", result);
```

#### Let's make lot of configuration

```javascript
const Command = require('lazy-command.js');

const result = Command("git").stdio_ignore()
                             .arg("-status")
                             .current_dir("lib/");
                             .timeout(1000)
                             .status();;

console.log("Status=%s", result);
```
