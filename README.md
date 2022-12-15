# create-3h-fe

> A front-end lib initializer.

## Introduction

This is a CLI tool
that helps you quickly initialize a development environment
for your awesome front-end library.

## Usage

```txt
$ create-3h-fe --help
A front-end lib initializer.

Usage:
  create-3h-fe [options]

Options:
  --name, -n <pkg>              The name of the package
  --author, -a <name>           The author of the package
  --desc, -d <description>      The description of the package
  --keywords, -k <words...>     The keywords of the package
  --repo, -r <repository>       The repository of the package
  --umd, -u <namespace>         The global namespace to use
  --no-install                  Do not install dependencies instantly
  --help, -h                    Show help info

```

## Example

```bash
npm init 3h-fe -- -n my-awesome-lib -a Peter -d "This is my awesome lib"
# or
npx create-3h-fe -n my-awesome-lib -a Peter -d "This is my awesome lib"
```

## Template Structure

```txt
your-awesome-lib/
+-- src/
| `-- index.ts
+-- .gitignore
+-- CHANGELOG.md
+-- index.d.ts
+-- LICENSE
+-- README.md
+-- rollup.config.mjs
+-- stat.cjs
+-- terser.json
`-- tsconfig.json
```

## Workflow

Generally, you

1. Write your source code in the `src` folder in TypeScript
2. Build your lib by executing `npm run build`
3. ...

## Built-in Scripts

| name    | description         |
|:--------|:--------------------|
| `build` | build your code     |
| `docs`  | build API reference |

Specifically, after building your code by executing `npm run build`,
compiled JavaScript files are placed in the `js` folder,
and bundled files can be found in the `dist` folder,
which are transformed by `babel` and bundled by `rollup`.
Additionally, you can execute `npm run docs`
to build the API reference of your lib
using package [`dts2md`](https://www.npmjs.com/package/dts2md).
By default, documentation files are placed in the `docs` folder.
