import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            buildDirectory: 'vendor/laravel-crm',
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
    ],
    // Keep modern syntax (private fields, destructuring) without downleveling
    // to very old targets that esbuild can't transpile reliably.
    esbuild: {
        target: 'es2022',
    },
    build: {
        target: 'es2022',
        // Silence large vendor bundles warnings caused by heavy libraries
        // that are intentionally included (tinymce, pdfjs). We also split
        // them into separate chunks for better caching.
        chunkSizeWarningLimit: 3000, // KB
        /*outDir: 'resources/build',*/
        // `public/vendor/laravel-crm/` is build output only. This wipes the
        // whole directory on every build, including any file the build did
        // not produce — hand-authored artwork committed there is deleted
        // silently. Static assets belong in `resources/assets/`, which
        // publishes to the same destination and the build never touches.
        emptyOutDir: true,
        rollupOptions: {
            output: {
                // Split heavy, rarely-changing libraries into their own
                // vendor chunks to reduce the app entry size and improve
                // browser caching across deploys.
                manualChunks: {
                    'vendor-tinymce': ['tinymce'],
                    'vendor-pdfjs': ['pdfjs-dist'],
                    'vendor-chart': ['chart.js'],
                    'vendor-sortable': ['sortablejs'],
                    'vendor-picker': ['vanilla-picker'],
                },
                // `.mjs` is not in the default MIME map of nginx or older
                // Apache, so hosts serve it as application/octet-stream —
                // which the browser's strict module-script MIME check rejects
                // outright, taking out both the pdf.js worker and its own
                // fallback import. The bytes are the same either way;
                // module-ness comes from {type:'module'} and the Content-Type,
                // not the extension. Emit `.js` so the worker inherits the
                // mapping every server already has.
                assetFileNames: (asset) => {
                    const source = asset.name ?? asset.names?.[0] ?? '';

                    return source.endsWith('.mjs')
                        ? 'assets/[name]-[hash].js'
                        : 'assets/[name]-[hash][extname]';
                },
            },
        },
    }
});
