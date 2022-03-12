import { build } from 'esbuild';
import svgrPlugin from 'esbuild-plugin-svgr';

const NODE_ENV = process.env.NODE_ENV as Environment;

type Environment = 'production' | 'development';

interface BuildOptions {
    env: Environment;
}

/**
 * A builder function for the client package.
 */
export async function buildClient(options: BuildOptions) {
    const { env } = options;

    await build({
        entryPoints: ['packages/client/src/index.tsx'],
        outfile: 'packages/client/public/script.js',
        define: {
            'process.env.NODE_ENV': `"${env}"`,
            'process.env.REACT_APP_GA_TRACKING_ID': `"${process.env.REACT_APP_GA_TRACKING_ID}"`,
        },
        assetNames: 'assets/[name]-[hash]',
        loader: {
            '.png': 'file',
            '.ogg': 'file',
            '.svg': 'file',
            '.ico': 'file',
        },
        bundle: true,
        minify: env === 'production',
        sourcemap: env === 'development',
        plugins: [svgrPlugin()],
        watch:
            env === 'production'
                ? false
                : {
                      onRebuild: (error, result) => {
                          console.log(`[Client] Build finished at ${new Date().toISOString()}`);
                      },
                  },
    });
}

/**
 * A builder function for the server package.
 */
export async function buildServer(options: BuildOptions) {
    const { env } = options;

    await build({
        entryPoints: ['packages/server/src/index.ts'],
        outfile: 'packages/server/dist/index.js',
        define: {
            'process.env.NODE_ENV': `"${env}"`,
        },
        external: ['express', 'hiredis', 'default-gateway', 'cors'],
        platform: 'node',
        target: 'node14.15.5',
        bundle: true,
        minify: env === 'production',
        sourcemap: env === 'development',
        watch:
            env === 'production'
                ? false
                : {
                      onRebuild: (error, result) => {
                          console.log(`[Server] Build finished at ${new Date().toISOString()}`);
                      },
                  },
    });
}

/**
 * A builder function for all packages.
 */
async function buildAll() {
    await Promise.all([
        buildClient({
            env: NODE_ENV,
        }),
        buildServer({
            env: NODE_ENV,
        }),
    ]);
}

// This method is executed when we run the script from the terminal with ts-node
buildAll();
