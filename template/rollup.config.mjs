import { defineConfig } from "rollup";
import babel from "@rollup/plugin-babel";

const input = './js/index.js';

export default defineConfig([
    {
        input,
        plugins: [
            babel({
                babelHelpers: 'bundled',
                presets: [
                    ['@babel/preset-env', {
                        loose: true,
                    }],
                ],
            }),
        ],
        output: {
            format: 'umd',
            name: '__umd__',
            file: './dist/__name__.umd.cjs',
        },
    },
    {
        input,
        output: {
            format: 'esm',
            file: './dist/__name__.mjs',
        },
    },
]);
