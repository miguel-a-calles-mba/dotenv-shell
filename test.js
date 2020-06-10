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
    test('dotenv-expand before shell expansion from file', () => {
        const config = dotenv.config({ path: '.env.test' });
        expect(dotenvShell(dotenvExpand(config))).toEqual({
            parsed: { EXPAND: 'basic', BASIC: 'basic' },
        });
        expect(process.env).toEqual({ EXPAND: 'basic', BASIC: 'basic' });
    });
    test('dotenv-expand after shell expansion from file', () => {
        const config = dotenv.config({ path: '.env.test' });
        expect(dotenvShell(dotenvExpand(config))).toEqual({
            parsed: { EXPAND: 'basic', BASIC: 'basic' },
        });
        expect(process.env).toEqual({ EXPAND: 'basic', BASIC: 'basic' });
    });
});
