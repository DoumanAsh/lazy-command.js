lazy-command.js
===============
[![Build Status](https://travis-ci.org/DoumanAsh/lazy-command.js.svg?branch=master)](https://travis-ci.org/DoumanAsh/lazy-command.js) [![Coverage Status](https://coveralls.io/repos/github/DoumanAsh/lazy-command.js/badge.svg)](https://coveralls.io/github/DoumanAsh/lazy-command.js)

Rust-like Command wrapper over node.js child_process

It provides simple & unified builder for Node.js `child_process`


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
