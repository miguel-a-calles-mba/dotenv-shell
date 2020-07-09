'use strict';

const { execSync } = require('child_process');

const shellCmdPattern = /`(.*)`/;
const unsafeCmds = [
    /^rm/,
    /^:\(\){:\|:&};:/,
    /^dd/,
    /^wget/,
    /^mkfs/,
    /^>/,
    /^mv/,
    /^\^/,
    /^exit/,
    /^kill/,
    /^unlink/,
    /^shutdown/,
    /^reboot/,
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
    Object.entries(parsedConfig).forEach(([key, shellCmdString]) => {
        try {
            const [, cmd] = shellCmdPattern.exec(shellCmdString) || [];
            unsafeCmds.forEach((unsafeCmd) => {
                if (unsafeCmd.test(cmd)) {
                    throw new Error(`unsafe Linux command`);
                }
            });
            const newVal = expandShellCmd(shellCmdPattern, shellCmdString);
            parsedConfig[key] = newVal;
            if (loadEnv) {
                process.env[key] = newVal;
            }
        } catch (e) {
            throw new Error(`Error for ${key}=${shellCmdString}: ${e.message}`);
        }
    });
};

const expandShellCmd = (pattern, cmdString) => {
    const cmdStringMatch = pattern.exec(cmdString);
    if (cmdStringMatch) {
        const replaceString = cmdStringMatch[0];
        const subCmdString = cmdStringMatch[1];
        const subCmdStringMatch = pattern.exec(subCmdString);
        if (subCmdStringMatch) {
            const expansion = execShellCmd(
                expandShellCmd(pattern, subCmdString, true),
            );
            const output = cmdString.replace(replaceString, expansion);
            return output;
        }
        const subCmdVal = execShellCmd(subCmdString);
        return cmdString.replace(replaceString, subCmdVal);
    }
    return cmdString;
};

const execShellCmd = (cmd) => {
    return execSync(cmd, { env: process.env }).toString().trim();
};
