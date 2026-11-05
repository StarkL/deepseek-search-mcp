import esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const PLUGIN_ID = "@starkl/deepseek-search-mcp";

const banner = [
  `(function() {`,
  `  var __load__ = (typeof window !== "undefined" && window.__ModuleLoader__ && typeof window.__ModuleLoader__.load === "function")`,
  `    ? window.__ModuleLoader__.load.bind(window.__ModuleLoader__)`,
  `    : function(opts) { if (opts && opts.factory) { try { opts.factory(function() { return {}; }); } catch(e) { console.error(e); } } };`,
  `  __load__({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
  `  var module = { exports: {} }; var exports = module.exports;`
].join('\n');

const footer = [
  `  return module.exports;`,
  `  } });`,
  `})();`
].join('\n');

await esbuild.build({
  entryPoints: [path.join(root, 'src/client-ui/index.ts')],
  outfile: path.join(root, 'dist/client.js'),
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom',
    'react-dom/client',
    'cordis',
    '@deepseek-ai/dsh-client-ui-slots',
    '@deepseek-ai/dsh-client-runtime'
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.MODE': '"production"'
  },
  banner: { js: banner },
  footer: { js: footer }
});

console.log('[build-client] dist/client.js compiled with esbuild successfully.');
