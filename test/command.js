"use strict";

const assert = require('assert');

const Command = require('../lib/command.js');

describe('Command:', function() {

    it('Builder verification', function() {

        var expected_command = 'test';
        var expected_args = [];
        var expected_options = {};

        const builder = Command('test');

        const check_command = () => {
            assert.strictEqual(builder._command, expected_command);
            assert.deepStrictEqual(builder._args, expected_args);
            assert.deepStrictEqual(builder._options, expected_options);
        };

        check_command();

        expected_args = ['1'];
        builder.arg('1');
        check_command();

        expected_args = ['1', '2', '3'];
        builder.args(['2', '3']);
        check_command();

        builder._default_env_if();
        expected_options = {env: process.env};
        check_command();

        builder.env_clear();
        expected_options = {env: {}};
        check_command();

        builder.env('test_env', 'test_val' );
        expected_options = {env: {test_env: 'test_val'}};
        check_command();

        builder.env_remove('test_env');
        expected_options = {env: {}};
        check_command();

        builder.current_dir('/some_dir/');
        expected_options.cwd = '/some_dir/';
        check_command();

        builder.encoding('utf-8');
        expected_options.encoding = 'utf-8';
        check_command();

        builder.shell('sh');
        expected_options.shell = 'sh';
        check_command();

        builder._default_stdio_if();
        expected_options.stdio = ['pipe', 'pipe', 'pipe'];
        check_command();

        builder.stdio_ignore();
        expected_options.stdio = ['ignore', 'ignore', 'ignore'];
        check_command();

        builder.stdio_inherit();
        expected_options.stdio = ['inherit', 'inherit', 'inherit'];
        check_command();

        builder.stdin('pipe');
        expected_options.stdio = ['pipe', 'inherit', 'inherit'];
        check_command();

        builder.stdout('pipe');
        expected_options.stdio = ['pipe', 'pipe', 'inherit'];
        check_command();

        builder.stderr('pipe');
        expected_options.stdio = ['pipe', 'pipe', 'pipe'];
        check_command();

        builder.timeout(666);
        expected_options.timeout = 666;
        check_command();

        function dummy() {}

        builder.callback(dummy);
        assert.strictEqual(builder._callback, dummy);

        builder._split_command_if();
        check_command();

        builder._command = 'test pre-1 pre-2';
        builder._split_command_if();
        expected_args = ['pre-1', 'pre-2', '1', '2', '3'];
        check_command();
    });

    it('Exec File ok Async', function(done) {
        Command("echo test").callback((error, stdout, stderr) => {
            assert.strictEqual(error, null);
            assert.strictEqual(stdout.trim(), 'test');
            assert.strictEqual(stderr, '');
            done();
        }).execFile()
    });

    it('Exec File not ok Async', function(done) {
        Command("git status --test").callback((error, stdout, stderr) => {
            assert.notStrictEqual(error, null);
            assert.strictEqual(stdout.trim(), '');
            assert(stderr.includes('unknown option'));
            done();
        }).execFile()
    });

    it('Exec File ok Sync', function() {
        const result = Command("echo test").sync()
                                           .encoding('utf-8')
                                           .execFile()
                                           .trim();

        assert.strictEqual(result, 'test');
    });

    it('Exec File not ok Sync', function() {
        function exec() {
            Command("git status --test").sync().stdio_ignore().execFile()
        }

        assert.throws(exec);
    });

    it('Exec ok Async', function(done) {
        Command("echo test").callback((error, stdout, stderr) => {
            assert.strictEqual(error, null);
            assert.strictEqual(stdout.trim(), 'test');
            assert.strictEqual(stderr, '');
            done();
        }).exec()
    });

    it('Exec not ok Async', function(done) {
        Command("git status --test").callback((error, stdout, stderr) => {
            assert.notStrictEqual(error, null);
            assert.strictEqual(stdout.trim(), '');
            assert(stderr.includes('unknown option'));
            done();
        }).exec()
    });

    it('Exec ok Sync', function() {
        const result = Command("echo test").sync()
                                           .encoding('utf-8')
                                           .exec()
                                           .trim();

        assert.strictEqual(result, 'test');
    });

    it('Exec not ok Sync', function() {
        function exec() {
            Command("git status --test").sync().stdio_ignore().exec()
        }

        assert.throws(exec);
    });

    it('Spawn ok Async', function(done) {
        const result = Command("echo test").spawn();

        result.on('close', (code) => {
            assert.strictEqual(code, 0);
            done();
        });
    });

    it('Spawn not ok Async', function(done) {
        const result = Command("git status --test ").spawn();

        result.on('close', (code) => {
            assert.strictEqual(code, 129);
            done();
        });
    });

    it('Spawn ok Sync', function() {
        const result = Command("echo test").sync()
                                           .encoding('utf-8')
                                           .spawn();

        assert.strictEqual(result.status, 0);
        assert.strictEqual(result.stdout, 'test\n');
        assert.strictEqual(result.stderr, '');
    });

    it('Spawn not ok Sync', function() {
        const result = Command("git status --test").sync().encoding('utf-8').spawn()

        assert.strictEqual(result.status, 129);
        assert.strictEqual(result.stdout, '');
        assert(result.stderr.includes('unknown option'));
    });

    it('Status ok', function() {
        assert.strictEqual(Command("echo test").status(), 0);
    });

    it('Status not ok', function() {
        assert(Command("git -status").stdio_ignore().status());
    });

    it('Output ok', function() {
        const expected_output = {
            status: 0,
            stdout: 'test\n',
            stderr: ''
        };
        const output = Command("echo test").encoding('utf-8').output();

        assert.deepStrictEqual(output, expected_output);
    });

    it('Output ok With ignored stdio', function() {
        const expected_output = {
            status: 0,
            stdout: null,
            stderr: null
        };
        const output = Command("echo test").stdio_ignore().encoding('utf-8').output();

        assert.deepStrictEqual(output, expected_output);
    });

    it('Output not ok', function() {
        const expected_output = {
            status: 129,
            stderr: 'Unknown option: -test\nusage: git [--version] [--help] [-C <path>] [-c name=value]\n           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]\n           [-p | --paginate | --no-pager] [--no-replace-objects] [--bare]\n           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]\n           <command> [<args>]\n',
            stdout: ''
        };
        const output = Command("git -test").encoding('utf-8').output();

        assert.strictEqual(output.status, 129);
        assert.strictEqual(output.stdout, '');
        assert(output.stderr.includes('Unknown option'));
    });

    it('Output not ok Unknown command', function() {
        const expected_output = {
            status: 1,
            stderr: null,
            stdout: null
        };
        const output = Command("gita -test").encoding('utf-8').output();

        assert.deepStrictEqual(output, expected_output);
    });
});
