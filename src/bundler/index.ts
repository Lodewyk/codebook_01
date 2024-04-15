import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

// https://esbuild.github.io/ for documentation on bundling and using esbuild
let service: esbuild.Service;

const bundler = async (rawCode: string) => {
    if (!service) {
        service = await esbuild.startService({
            worker: true,
            wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
        });
    }

    // Do bundling
    try {
        const result = await service.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [
                unpkgPathPlugin(),
                fetchPlugin(rawCode)
            ],
            define: {
                'process.env.NODE_ENV': '"production"',
                global: 'window'
            },
            /**
             * in the `code` variable in code-cell.tsx we import _React and _ReactDOM,
             * so we're overriding the createElement and Fragment methods to use our imported
             * libraries to avoid naming conflicts with user imports
             */
            jsxFactory: '_React.createElement',
            jsxFragment: '_React.Fragment'
        });

        return {
            code: result.outputFiles[0].text,
            error: ''
        };
    } catch (err) {
        if (err instanceof Error) {
            return {
                code: '',
                error: err.message
            }
        } else {
            throw err;
        }
    }
};

export default bundler;

/**
} catch (err) {
    if (err instanceof Error) {
        return {
        code: "",
        err: err.message,
        };
    } else {
        throw err;
    }
}
 */