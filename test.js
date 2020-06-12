'use strict';

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const dotenvShell = require('./index');

describe('shell expansion', () => {
    beforeEach(() => {
        process.env = {};
    });
    test('expand $(cmd) from dotenv.parse', () => {
        const buf = Buffer.from('BASIC=$(echo basic)');
        const config = dotenv.parse(buf);
        expect(dotenvShell(config)).toEqual({ BASIC: 'basic' });
        expect(process.env).toEqual({});
    });
    test('expand `cmd` from dotenv.parse', () => {
        const buf = Buffer.from('BASIC=`echo basic`');
        const config = dotenv.parse(buf);
        expect(dotenvShell(config)).toEqual({ BASIC: 'basic' });
        expect(process.env).toEqual({});
    });
    test('no shell commands in dotenv.parse', () => {
        const buf = Buffer.from('BASIC=basic');
        const config = dotenv.parse(buf);
        expect(dotenvShell(config)).toEqual({ BASIC: 'basic' });
        expect(process.env).toEqual({});
    });
    test('unsafe command in dotenv.parse', () => {
        const cmd = '$(rm .)';
        const buf = Buffer.from(`UNSAFE=${cmd}`);
        const config = dotenv.parse(buf);
        expect(() => dotenvShell(config)).toThrowError(
            new Error(`UNSAFE=${cmd} uses unsafe Linux command`),
        );
    });
    test('shell expansion from file', () => {
        const config = dotenv.config({ path: '.env.test' });
        const output = {
            BASIC: 'basic',
            BASIC_ENV: 'basic',
            EXPAND: 'expand',
            EXPANDED: '${EXPAND}',
            EXPANDED_ENV: 'expand',
        };
        expect(dotenvShell(config)).toEqual({
            parsed: output,
        });
        expect(process.env).toEqual(output);
    });
    test('dotenv-expand => shell expansion from file', () => {
        const config = dotenv.config({ path: '.env.test' });
        const output = {
            BASIC: 'basic',
            BASIC_ENV: 'basic',
            EXPAND: 'expand',
            EXPANDED: 'expand',
            EXPANDED_ENV: 'expand',
        };
        expect(dotenvShell(dotenvExpand(config))).toEqual({
            parsed: output,
        });
        expect(process.env).toEqual(output);
    });
    test('shell expansion from file => dotenv-expand', () => {
        const config = dotenv.config({ path: '.env.test' });
        const output = {
            BASIC: 'basic',
            BASIC_ENV: 'basic',
            EXPAND: 'expand',
            EXPANDED: 'expand',
            EXPANDED_ENV: 'expand',
        };
        expect(dotenvShell(dotenvExpand(config))).toEqual({
            parsed: output,
        });
        expect(process.env).toEqual(output);
    });
});
