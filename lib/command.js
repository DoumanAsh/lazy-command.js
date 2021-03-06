"use strict";

/** @module Command */

const child_process = require('child_process');

const shell_split = require('./shell_split.js');

/**
 * Represents command to execute.
 *
 * Wraps node.js child_process and provides simple builder.
 *
 * Each builder method returns this and therefore they can be chained.
 */
class Command {
    /**
     * Creates Command.
     *
     * By default Command:
     * - Runs asynchronously.
     * - Inherits parent's environment.
     * - Inherits parent's current directory.
     *
     * @constructor
     *
     * @param {String} command Command or Program to execute.
     */
    constructor(command) {
        /**
         * @private
         */
        this._command = command;
        /**
         * @private
         */
        this._args = [];
        /**
         * @private
         */
        this._options = {};

        /**
         * @private
         */
        this._spawn = () => {
            return child_process.spawn(this._command, this._args, this._options);
        };

        /**
         * @private
         */
        this._exec = () => {
            return child_process.exec(this._command + this._args.join(' '),
                                      this._options, this._callback);
        };

        /**
         * @private
         */
        this._execFile = () => {
            return child_process.execFile(this._command, this._args,
                                          this._options, this._callback);
        };

        /**
         * @private
         */
        this._callback = function() {};
    }

    /**
     * Adds argument to Command.
     *
     * @param {String} arg Argument to add.
     *
     * @returns {this}
     */
    arg(arg) {
        this._args.push(arg);
        return this;
    }

    /**
     * Adds array of arguments to Command.
     *
     * @param {Array} args Array of arguments to add.
     *
     * @returns {this}
     */
    args(args) {
        this._args = this._args.concat(args);
        return this;
    }

    /**
     * Sets default environment once.
     *
     * @private
     */
    _default_env_if() {
        this._options.env = process.env;

        this._default_env_if = function() {};
    }

    /**
     * Inserts or updates environment variable.
     *
     * @param {String} key Name of variable.
     * @param {String} val Value of variable.
     *
     * @return {this}
     */
    env(key, val) {
        this._default_env_if();

        this._options.env[key] = val;

        return this;
    }

    /**
     * Removes environment variable.
     *
     * @param {String} key Name of variable.
     *
     * @return {this}
     */
    env_remove(key) {
        this._default_env_if();

        delete this._options.env[key];

        return this;
    }

    /**
     * Clears environment variables.
     *
     * @return {this}
     */
    env_clear() {
        this._default_env_if();

        this._options.env = {};

        return this;
    }

    /**
     * Sets current working directory.
     *
     * @param {String} path Path of directory. No validation is done.
     *
     * @return {this}
     */
    current_dir(path) {
        this._options.cwd = path;

        return this;
    }

    /**
     * Sets encoding for Command's output.
     *
     * **Note:**
     * - Async Command uses by default 'utf8'
     * - Sync Command uses by default 'buffer'
     *
     * @param {String} encoding Encoding to use.
     *
     * @returns {this}
     */
    encoding(encoding) {
        this._options.encoding = encoding;

        return this;
    }

    /**
     * Sets shell mode for Command.
     *
     * **Note:**
     * - exec() Accepts String.
     * - spawn() Accepts String & Boolean. Boolean means to use default.
     *
     * @param {Boolean|String} shell Shell to use.
     *
     * @returns {this}
     */
    shell(shell) {
        this._options.shell = shell;

        return this;
    }

    /**
     * Sets default stdio once.
     *
     * @private.
     */
    _default_stdio_if() {
        this._options.stdio = ['pipe', 'pipe', 'pipe'];

        this._default_stdio_if = function () {};
    }

    /**
     * Sets stdio for Command.
     *
     * @see {@link https://nodejs.org/api/child_process.html#child_process_options_stdio | Details about stdio array}
     *
     * @param {Array} stdio Array with Command's stdio configuration.
     *
     * @returns {this}
     */
    stdio(stdio) {
        this._default_stdio_if();

        this._options.stdio = stdio;

        return this;
    }

    /**
     * Sets stdio to pipe for Command.
     *
     * @returns {this}
     */
    stdio_pipe() {
        return this.stdio(['pipe', 'pipe', 'pipe']);
    }

    /**
     * Sets stdio to ignore for Command.
     *
     * Means that output is redirected to /dev/null
     *
     * @returns {this}
     */
    stdio_ignore() {
        return this.stdio(['ignore', 'ignore', 'ignore']);
    }

    /**
     * Sets stdio to inherit for Command.
     *
     * @returns {this}
     */
    stdio_inherit() {
        return this.stdio(['inherit', 'inherit', 'inherit']);
    }

    /**
     * Sets stdin for Command.
     *
     * @see {@link https://nodejs.org/api/child_process.html#child_process_options_stdio | Details about stdio array}
     *
     * @param stdin Stdin for Command's stdio configuration.
     *
     * @returns {this}
     */
    stdin(stdin) {
        this._default_stdio_if();

        this._options.stdio[0] = stdin;

        return this;
    }

    /**
     * Sets stdout for Command.
     *
     * @see {@link https://nodejs.org/api/child_process.html#child_process_options_stdio | Details about stdio array}
     *
     * @param stdout Stderr for Command's stdio configuration.
     *
     * @returns {this}
     */
    stdout(stdout) {
        this._default_stdio_if();

        this._options.stdio[1] = stdout;

        return this;
    }

    /**
     * Sets stderr for Command.
     *
     * @see {@link https://nodejs.org/api/child_process.html#child_process_options_stdio | Details about stdio array}
     *
     * @param stderr Stderr for Command's stdio configuration.
     *
     * @returns {this}
     */
    stderr(stderr) {
        this._default_stdio_if();

        this._options.stdio[2] = stderr;

        return this;
    }

    /**
     * Sets timeout for execution.
     *
     * @param {number} ms Milliseconds to wait.
     *
     * @returns {this}
     */
    timeout(ms) {
        this._options.timeout = ms;

        return this;
    }

    /**
     * Sets callback for async execution.
     *
     * **Note:**
     * - Synchronous version does not use it.
     *
     * @param cb Callback that accepts (error, stdout, stderr).
     *
     * @returns {this}
     */
    callback(cb) {
        this._callback = cb;

        return this;
    }

    /**
     * Enable synchronous execution.
     *
     * **Note:**
     * - Failed command throws except for spawn().
     *
     * @returns {this}
     */
    sync() {
        this._spawn = () => {
            return child_process.spawnSync(this._command, this._args, this._options);
        };
        this._exec = () => {
            return child_process.execSync(this._command + this._args.join(' '), this._options);
        };
        this._execFile = () => {
            return child_process.execFileSync(this._command, this._args, this._options);
        };

        return this;
    }

    /**
     * Split command into args if needed.
     *
     * @private
     */
    _split_command_if() {
        if (this._command.includes(' ')) {
            const args = shell_split(this._command);
            this._command = args.shift();
            this._args = args.concat(this._args);
        }
    }

    /**
     * Spawns Command in shell.
     *
     * **Note:**
     * - Callback isn't used.
     *
     * @return node.js ChildProcess in async mode.
     * @return {Object} Object with pid, output, stdout, sterr, status, signal and error.
     */
    spawn() {
        this._split_command_if();

        return this._spawn();
    }

    /**
     * Execs Command in shell.
     *
     * @return node.js ChildProcess in async mode.
     * @return {String} Output of Command.
     */
    exec() {
        return this._exec();
    }

    /**
     * Executes Command as File (i.e. uses execFile).
     *
     * @return node.js ChildProcess in async mode.
     * @return {String} Output of Command.
     */
    execFile() {
        this._split_command_if();

        return this._execFile();
    }

    /**
     * Executes Command synchronously and gets status.
     *
     * By default, stdin, stdout and stderr are inherited from the parent.
     *
     * @return {number} Status of command.
     */
    status() {
        if (!('stdio' in this._options)) this.stdio_inherit();

        try {
            this.sync().exec();
            return 0;
        }
        catch (error) {
            return error.status;
        }
    }

/**
 * @typedef {Object} Output
 * @property {number} status Exit status of Command.
 * @property {buffer|string} stdout Command's stdout.
 * @property {buffer|string} stderr Command's stderr.
 */

    /**
     * Executes the command as a child process, waiting for it to finish and collecting output.
     *
     * By default, stdin, stdout and stderr are captured in buffer mode.
     *
     * @return {Output} Output of Command's execution
     */
    output() {
        if (!('stdio' in this._options)) this.stdio_pipe();

        const temp_result = this.sync().spawn();

        /* Depending on type of failure status code
         * is stored in a different places.
         * It might as well be missing.
         */
        var status_code;

        if (temp_result.status !== null) {
            status_code = temp_result.status;
        }
        else if (temp_result.error !== undefined && temp_result.error.status !== undefined) {
            status_code = temp_result.error.status;
        }
        else {
            status_code = 1;
        }

        return {
            status: status_code,
            stdout: temp_result.stdout,
            stderr: temp_result.stderr
        };
    }
}

/**
 * Creates Command.
 *
 * **Note:**
 * - Exported instead of class.
 *
 * By default Command:
 * - Runs asynchronously.
 * - Inherits parent's environment.
 * - Inherits parent's current directory.
 *
 * @param {String} command Command or Program to execute.
 */
function command(command) {
    return new Command(command);
}

module.exports = command;
