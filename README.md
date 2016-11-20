lazy-command.js
===============

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
