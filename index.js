'use strict';

const { execSync } = require('child_process');

const shellCmdPatterns = [/^\$\((.*)\)$/, /^`(.*)`$/];
const unsafeCmds = [
    /^rm/,
    /^:\(\){:\|:&};:/,
    /^dd/,
    /^wget/,
    /^mkfs/,
    /^>/,
    /^mv/,
    /^\^/,
];

module.exports = (dotenvConfig) => {
    if (dotenvConfig.parsed) {
        shellExpand(dotenvConfig.parsed, true);
    } else {
        shellExpand(dotenvConfig);
    }
    return dotenvConfig;
};

const shellExpand = (parsedConfig, loadEnv = false) => {
    Object.entries(parsedConfig).forEach(([key, val]) => {
        shellCmdPatterns.forEach((pattern) => {
            const [, cmd] = pattern.exec(val) || [];
            if (cmd) {
                unsafeCmds.forEach((unsafeCmd) => {
                    if (unsafeCmd.test(cmd)) {
                        throw new Error(
                            `${key}=${val} uses unsafe Linux command`,
                        );
                    }
                });
                try {
                    const newVal = execSync(cmd, { env: process.env }).toString().trim();
                    parsedConfig[key] = newVal;
                    if (loadEnv) {
                        process.env[key] = newVal;
                    }
                } catch (e) {
                    throw new Error(`Error for ${key}=${val}: ${e.message}`);
                }
            }
        });
    });
};
