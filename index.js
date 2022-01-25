#!/usr/bin/env node
// @ts-check
const { Program } = require('3h-cli'),
    { existsSync, promises: fsPromises } = require('fs'),
    { execSync } = require('child_process'),
    { join } = require('path'),
    // @ts-ignore
    pkgInfo = require('./package.json');

/* Template data slot: __var__ */

const TEMPLATE_PATH = './template',
    TEMPLATE_ENCODING = 'utf8';

const templateDirectories = [
    'src',
];

const templateFiles = [
    'src/index.ts',
    '.babelrc',
    'CHANGELOG.md',
    'index.d.ts',
    'LICENSE',
    'README.md',
    'rollup.config.js',
    'stat.js',
    'terser.json',
    'tsconfig.json',
];

/**
 * @typedef TemplateData
 * @property {string} name
 * @property {string} desc
 * @property {string} author
 * @property {string} year
 * @property {string} umd
 */

/**
 * @param {TemplateData} data
 */
const renderTemplates = async data => {
    await templateDirectories.reduce(
        (prevPromise, dir) => prevPromise.then(() => fsPromises.mkdir(dir)),
        Promise.resolve()
    );
    await Promise.all(
        templateFiles.map(async path => {
            let content = await fsPromises.readFile(
                join(__dirname, TEMPLATE_PATH, path),
                TEMPLATE_ENCODING
            );
            Object.entries(data).forEach(([key, value]) => {
                content = content.replace(
                    new RegExp(`__${key}__`, 'g'),
                    value
                );
            });
            await fsPromises.writeFile(path, content);
        })
    );
};

/**
 * @param {string} name
 */
const abbr = name => (
    name.match(/\w+/g)
        .map(word => word[0].toUpperCase())
        .join()
);

const program = new Program(pkgInfo.name, {
    title: pkgInfo.description
});

program
    .option({
        name: '--name',
        alias: '-n',
        value: '<pkg>',
        help: 'The name of the package'
    })
    .option({
        name: '--author',
        alias: '-a',
        value: '<name>',
        help: 'The author of the package'
    })
    .option({
        name: '--desc',
        alias: '-d',
        value: '<description>',
        help: 'The description of the package'
    })
    .option({
        name: '--keywords',
        alias: '-k',
        value: '<words...>',
        help: 'The keywords of the package'
    })
    .option({
        name: '--repo',
        alias: '-r',
        value: '<repository>',
        help: 'The repository of the package'
    })
    .option({
        name: '--umd',
        alias: '-u',
        value: '<namespace>',
        help: 'The global namespace to use'
    })
    .option({
        name: '--no-install',
        help: 'Do not install dependencies instantly'
    })
    .option({
        name: '--help',
        alias: '-h',
        help: 'Show help info'
    })
    .parse(process.argv)
    .then(async args => {

        const { options } = args;

        if (options.has('--help')) {
            return program.help();
        }

        if (!options.has('--name')) {
            throw 'Package name is not provided';
        }

        const name = options.get('--name')[0];

        if (existsSync(name)) {
            throw `Path "${name}" already exists`;
        }

        if (!options.has('--author')) {
            throw 'Package author is not provided';
        }

        const data = {
            name,
            desc: args.getOption('--desc').join(' ') || `This is ${name}.`,
            author: options.get('--author')[0],
            umd: args.getOption('--umd')[0] || abbr(name),
            year: (new Date()).getFullYear() + '',
        };

        await fsPromises.mkdir(name);
        process.chdir(name);

        console.time('time used');

        console.log('Generating files...');
        await renderTemplates(data);
        /**
         * it seems npm will somehow convert .gitignore
         * into .npmignore when installing the package,
         * so this file is added manually
         */
        await fsPromises.writeFile('.gitignore', [
            'node_modules',
            'types',
            'js',
            'dist',
        ].join('\n') + '\n');
        await fsPromises.writeFile('package.json', JSON.stringify(
            {
                name,
                version: '0.1.0',
                description: data.desc,
                module: `./dist/${name}.min.js`,
                main: `./dist/${name}.umd.min.js`,
                types: './index.d.ts',
                author: data.author,
                license: 'MIT',
                scripts: {
                    'prebuild': 'tsc',
                    'build': 'rollup -c',
                    'postbuild': [
                        'terser',
                        `dist/${name}.js`,
                        '--config-file terser.json',
                        '--module',
                        `-o dist/${name}.min.js`,
                        '&&',
                        'terser',
                        `dist/${name}.umd.js`,
                        '--config-file terser.json',
                        `-o dist/${name}.umd.min.js`,
                        '&&',
                        'node stat'
                    ].join(' '),
                    docs: 'dts2md "**" "!index.d.ts" -i ./types -o ./docs -l -I Home.md',
                },
                repository: args.getOption('--repo')[0]
                    || `${data.author}/${name}`,
                keywords: args.getOption('--keywords'),
                files: [
                    'dist',
                    'types',
                    'index.d.ts'
                ],
                devDependencies: {
                    '@babel/core': '^7.10.0',
                    '@babel/preset-env': '^7.10.0',
                    dts2md: '^0.4.0',
                    rollup: '^2.26.0',
                    '@rollup/plugin-babel': '^5.2.0',
                    terser: '^5.2.0',
                    typescript: '^4.0.0',
                }
            },
            null, // replacer
            2 // indent
        ));

        if (options.has('--no-install')) {
            console.log('Dependencies not installed.');
        } else {
            console.log('Installing dev dependencies...');
            execSync('npm i', { stdio: 'inherit' });
        }

        console.log('Finished!');
        console.timeEnd('time used');

    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
