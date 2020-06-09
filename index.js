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
        shellExpand(dotenvConfig.parsed);
    } else {
        shellExpand(dotenvConfig);
    }
};

const shellExpand = (parsedConfig) => {
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
                    const newVal = execSync(cmd).toString().trim();
                    parsedConfig[key] = newVal;
                } catch (e) {
                    throw new Error(`Error for ${key}=${val}: ${e.message}`);
                }
            }
        });
    });
};
