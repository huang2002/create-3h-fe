import rollupPluginBabel from "rollup-plugin-babel";

const input = './js/index.js';

export default [
    {
        input,
        plugins: [
            rollupPluginBabel({
                babelHelpers: 'bundled'
            })
        ],
        output: {
            format: 'umd',
            name: '__umd__',
            file: './dist/__name__.umd.js'
        }
    },
    {
        input,
        output: {
            format: 'esm',
            file: './dist/__name__.js'
        }
    }
];
