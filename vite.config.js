import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(import.meta.dirname, './src') },
        {
          // this is required for the SCSS modules
          find: /^~(.*)$/,
          replacement: '$1',
        },
      ],
    },
    plugins: [
      vue(),
      nodePolyfills(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        // allow auto load markdown components under `./src/components/`
        extensions: ['vue', 'md'],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
          }),
        ],
        dts: 'src/components.d.ts',
      }),
    ],
    build: {
      lib: {
        entry: path.resolve(import.meta.dirname, './src/components/index.js'),
        name: 'PlotVuer',
        fileName: 'plotvuer',
      },
      build: {
        commonjsOptions: { transformMixedEsModules: true }, // Change
      },
      rollupOptions: {
        external: [
          'vue',
          /^plotly.*/,
          'papaparse',
          /^@plotly.*/,
          /^d3-.*/,
          // Shared with the other viewers, `v-help-mode` registers the steps in it
          '@abi-software/map-utilities',
        ],
        output: {
          globals: {
            vue: 'Vue',
            papaparse: 'papaparse',
            '@abi-software/map-utilities': '@abi-software/map-utilities',
          },
          // keep css output name stable for the "./dist/style.css" export/import paths
          assetFileNames: (assetInfo) =>
            assetInfo.name?.endsWith('.css') ? 'style.css' : 'assets/[name][extname]',
        },
      },
    },
  };

  if (command === 'serve') {
    config.server = {
      port: 8081,
    };
    // Pre-bundle map-utilities also when it is linked with `npm link`,
    // otherwise the node polyfills are injected into its files,
    // which cannot resolve them outside of this project
    config.optimizeDeps = {
      include: ['@abi-software/map-utilities'],
    };
    config.define = {
      'process.env.HTTP_PROXY': 8081,
      global: 'globalThis',
      // If you want to exposes all env variables, which is not recommended
      // 'process.env': env
    };
  }
  return config;
});
