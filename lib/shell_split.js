"use strict";

/** @module Utilities */

/**
 * Parses a string like shell would.
 *
 * @param {String} command Command to parse.
 *
 * @return {Array} List of arguments.
 */
function shell_split(command) {
    var result = [];

    const seps = /[ '"]/;

    var cursor = command.trim();

    for (var end = cursor.search(seps); end !== -1; end = cursor.search(seps)) {
        const sep = cursor[end];

        if (sep !== ' ') {
            const add_end = cursor.slice(end + 1).search(sep);

            if (add_end === -1) throw "Unmatched quote after position " + end;

            end += add_end + 2;

            if (cursor[end] !== ' ') throw "No space after quote at position " + end;
        }

        result.push(cursor.slice(0, end));

        cursor = cursor.slice(end + 1);
    }

    if (cursor.length) result.push(cursor);

    return result.filter((val) => {
        return val;
    });
}

module.exports = shell_split;
