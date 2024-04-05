import * as esbuild from 'esbuild-wasm';
    
export const unpkgPathPlugin = () => {
    return {
        name: 'unpkg-path-plugin',
        setup(build: esbuild.PluginBuild) {
            /**
             * onResolve that will only deal with index.js
             */
            build.onResolve({ filter: /(^index\.js$)/ }, () => {
                return { path: 'index.js', namespace: 'a'};
            });

            /**
             * onResolve that will deal with relative filepaths e.g. ./ or ../
             */
            build.onResolve({ filter: /^\.+\// }, (args: any) => {
                return { 
                    namespace: 'a', 
                    path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href
                }
            });
            
            /**
             * onResolve that will deal with the main file of a module
             */
            build.onResolve({ filter: /.*/ }, async (args: any) => {
                return {
                    namespace: 'a',
                    path: `https://unpkg.com/${args.path}`
                }
            });
        },
    };
};