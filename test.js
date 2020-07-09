'use strict';

const rewire = require('rewire');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const dotenvShell = require('./index');
const execShellCmd = rewire('./index').__get__('execShellCmd');
const expandShellCmd = rewire('./index').__get__('expandShellCmd');
const shellCmdPattern = rewire('./index').__get__('shellCmdPattern');

test('execShellCmd', () => {
    expect(execShellCmd('echo 1')).toEqual('1');
});
describe('expandShellCmd', () => {
    test('no shell cmd', () => {
        expect(expandShellCmd(shellCmdPattern, 'echo 1')).toEqual('echo 1');
    });
    test('shell cmd', () => {
        const cmd = '`echo basic`';
        expect(expandShellCmd(shellCmdPattern, cmd)).toEqual('basic');
    });
    test('nested shell cmd, 1 level', () => {
        const cmd = '`echo 1 `echo 2``';
        expect(expandShellCmd(shellCmdPattern, cmd)).toEqual('1 2');
    });
    test('nested shell cmd, 2 levels', () => {
        const cmd = '`echo 1 `echo 2 `echo 3```';
        expect(expandShellCmd(shellCmdPattern, cmd)).toEqual('1 2 3');
    });
    test('nested shell cmd, 3 levels', () => {
        const cmd = '`echo 1 `echo 2 `echo 3 `echo 4````';
        expect(expandShellCmd(shellCmdPattern, cmd)).toEqual('1 2 3 4');
    });
});
describe('shell expansion', () => {
    beforeEach(() => {
        process.env = {};
    });
    afterEach(() => {
        process.env = {};
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
        const cmd = '`rm .`';
        const buf = Buffer.from(`UNSAFE=${cmd}`);
        const config = dotenv.parse(buf);
        const errMsg = `Error for UNSAFE=${cmd}: unsafe Linux command`;
        expect(() => dotenvShell(config)).toThrowError(new Error(errMsg));
    });
    test('shell expansion from file', () => {
        const config = dotenv.config({ path: '.env.test' });
        const output = {
            BASIC: 'basic',
            BASIC_ECHO: 'basic',
            BASIC_ENV: 'basic',
            BASIC_ENV_1: 'basic',
            BASIC_ENV_2: 'basic',
            EXPAND: 'expand',
            EXPANDED: '${EXPAND}',
            EXPANDED_ENV: 'expand',
        };
        console.log('BEFORE', process.env);
        dotenvShell(config);
        expect(dotenvShell(config)).toEqual({
            parsed: output,
        });
        console.log('AFTER', process.env);
        expect(process.env).toEqual(output);
    });
    test('dotenv-expand => shell expansion from file', () => {
        const config = dotenv.config({ path: '.env.test' });
        const output = {
            BASIC: 'basic',
            BASIC_ECHO: 'basic',
            BASIC_ENV: 'basic',
            BASIC_ENV_1: 'basic',
            BASIC_ENV_2: 'basic',
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
            BASIC_ECHO: 'basic',
            BASIC_ENV: 'basic',
            BASIC_ENV_1: 'basic',
            BASIC_ENV_2: 'basic',
            EXPAND: 'expand',
            EXPANDED: 'expand',
            EXPANDED_ENV: 'expand',
        };
        expect(dotenvShell(dotenvExpand(config))).toEqual({
            parsed: output,
        });
        expect(process.env).toEqual(output);
    });
    describe('use previous variable value from file', () => {
        test('from file', () => {
            const config = dotenv.config({ path: '.env.test1' });
            const output = {
                VAR_1: 'var1',
                VAR_1_A: 'var1',
                VAR_1_B: 'var1',
                VAR_1_C: 'var1',
            };
            expect(dotenvShell(config)).toEqual({
                parsed: output,
            });
            expect(process.env).toEqual(output);
        });
    });
});
