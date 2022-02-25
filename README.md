# dotenv-shell

![Build Master](https://github.com/miguel-a-calles-mba/dotenv-shell/workflows/Build%20Master/badge.svg)

A package that expands shell commands from a dotenv config.

## Install

```sh
npm install dotenv
npm install dotenv-shell
```

# Usage

Wrap dotenv-shell around dotenv to expand shell commands.

You `.env` file should look something like this:

```text
BASIC=`echo basic`
```

You script should look something like this:

```js
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-shell')
const config = dotenv.config();
dotenvShell(config);
console.log(config);
// { parsed: { BASIC: 'basic' } }
```

You can further expand with the `dotenv-expand` package.

```sh
npm install dotenv
npm install dotenv-shell
npm install dotenv-expand
```

```text
EXPAND=basic
BASIC=`echo ${EXPAND}`
```

```js
const config = dotenvShell(dotenvExpand(dotenv.config()));
console.log(config);
// { parsed: { EXPAND: 'basic', BASIC: 'basic' } }
```

## Breaking change from dotenv

Comments begin where a # exists, so if your value contains a # please wrap it in quotes. This is a breaking change from >= v15.0.0 and on.

```text
# This is a comment
SECRET_KEY=YOURSECRETKEYGOESHERE # comment
SECRET_HASH="something-with-a-#-hash"
```

## Notes

Please request features or report problems using the [issues](https://github.com/miguel-a-calles-mba/dotenv-shell/issues) page.

## License

See the included [LICENSE](LICENSE) for rights and limitations under the terms of the MIT license.
