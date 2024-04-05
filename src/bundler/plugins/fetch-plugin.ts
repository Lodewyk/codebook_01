import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

const fileCache = localForage.createInstance({
    name: 'filecache'
});

export const fetchPlugin = (inputCode: string) => {
    return {
        name: 'fetch-plugin',
        setup(build: esbuild.PluginBuild) {
            /**
             * onLoad for index.js
             */
            build.onLoad({ filter: /(^index\.js$)/ }, () => {
                /**
                 * this loads another file, which makes onResolve and onLoad run again
                 */
                return {
                    loader: 'jsx',
                    contents: inputCode,
                };
            });

            build.onLoad({ filter: /.*/}, async (args: any) => {
                // Check if we've already fetched and cached this file
                const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);

                // If cached, return immediately
                if (cachedResult) {
                    return cachedResult
                }
            });

            /**
             * onLoad for css files
             */
            build.onLoad({ filter: /.css$/ }, async (args: any) => {

                const { data, request } = await axios.get(args.path);
                // fileType, escaped and contents are used to trick esbuild into loading css
                const escaped = data
                .replace(/\n/g, '') // remove newlines
                .replace(/"/g, '\\"') // escape double quotes inside the css
                .replace(/'/g, "\\'"); // escape single quotes inside the css
                const contents = `
                        const style = document.createElement('style')
                        style.innerText = '${escaped}';
                        document.head.appendChild(style);
                    `;

                const result: esbuild.OnLoadResult = {
                    loader: 'jsx',
                    contents: contents,
                    resolveDir: new URL('./', request.responseURL).pathname,
                }

                // Store reponse in cache
                await fileCache.setItem(args.path, result);
                return result;
            });

            /** 
             * onLoad for all other files
             */
            build.onLoad({ filter: /.*/ }, async (args: any) => {
                const { data, request } = await axios.get(args.path);
                // fileType, escaped and contents are used to trick esbuild into loading css
                const result: esbuild.OnLoadResult = {
                    loader: 'jsx',
                    contents: data,
                    resolveDir: new URL('./', request.responseURL).pathname,
                }

                // Store reponse in cache
                await fileCache.setItem(args.path, result);
                return result;
            });
        }
    }
}