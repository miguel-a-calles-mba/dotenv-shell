'use strict';

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const dotenvShell = require('./index');

describe('shell expansion', () => {
    test('expand shell from dotenv ', () => {
        const buf = Buffer.from('BASIC=$(echo basic)');
        const config = dotenv.parse(buf);
        dotenvShell(config);
        expect(config).toEqual({ BASIC: 'basic' });
        const buf1 = Buffer.from('BASIC=`echo basic`');
        const config1 = dotenv.parse(buf1);
        dotenvShell(config1);
        expect(config1).toEqual({ BASIC: 'basic' });
    });
    test('no shell commands in dotenv', () => {
        const buf = Buffer.from('BASIC=basic');
        const config = dotenv.parse(buf);
        dotenvShell(config);
        expect(config).toEqual({ BASIC: 'basic' });
    });
    test('unsafe command', () => {
        const cmd = '$(rm .)';
        const config = { UNSAFE: cmd };
        expect(() => dotenvShell(config)).toThrowError(
            new Error(`UNSAFE=${cmd} uses unsafe Linux command`)
        );
    });
    test('dotenv-expand from file', () => {
        const config = dotenv.config();
        dotenvExpand(config);
        dotenvShell(config);
        expect(config).toEqual({ parsed: { EXPAND: 'basic', BASIC: 'basic' } });
    });
});
