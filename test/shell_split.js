"use strict";

const assert = require('assert');

const shell_split = require('../lib/shell_split.js');

describe('shell_split:', function() {

    it('Parse simple command with quotes', function() {
        const result = shell_split('git log -1 --format="%s(%h %cd)" --date=short');

        assert.deepEqual(result, ['git', 'log', '-1', '--format="%s(%h %cd)"', '--date=short']);
    });

    it('Parse with nested quotes', function() {
        const result = shell_split('git log -1 --format="%s\'%h %cd\'" --date=short');

        assert.deepEqual(result, ['git', 'log', '-1', '--format="%s\'%h %cd\'"', '--date=short']);
    });

    it('Should throw when no space after quote', function() {
        assert.throws(() => {
            shell_split('git log -1 --format="%s(%h %cd)"--date=short');
        },
        "No space after quote at position 21");
    });

    it('Should throw on unmatched quote', function() {
        assert.throws(() => {
            shell_split('git log -1 --format="%s(%h %cd) --date=short');
        },
        "No space after quote at position 10");
    });
});
