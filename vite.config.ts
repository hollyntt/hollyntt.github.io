import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import JavaScriptObfuscator from 'javascript-obfuscator';

function obfuscatePlugin() {
    return {
        name: 'vite-plugin-javascript-obfuscator',
        enforce: 'post' as const,
        apply: 'build' as const,
        generateBundle(_options: any, bundle: any) {
            for (const fileName in bundle) {
                const file = bundle[fileName];
                if (file.type === 'chunk' && fileName.endsWith('.js')) {
                    console.log(`[Obfuscator] Processing chunk: ${fileName}`);
                    const result = JavaScriptObfuscator.obfuscate(file.code, {
                        compact: true,
                        controlFlowFlattening: true,
                        controlFlowFlatteningThreshold: 1.0,
                        numbersToExpressions: true,
                        simplify: true,
                        stringArray: true,
                        stringArrayEncoding: ['rc4'],
                        stringArrayThreshold: 1.0,
                        splitStrings: true,
                        splitStringsChunkLength: 3,
                        unicodeEscapeSequence: true,
                        debugProtection: true,
                        debugProtectionInterval: 1000,
                        disableConsoleOutput: false,
                        selfDefending: true,
                    });
                    file.code = result.getObfuscatedCode();
                }
            }
        }
    };
}

export default defineConfig({
    base: './',
    plugins: [tailwindcss(), obfuscatePlugin()],
    server: {
        port: 3000,
        host: '0.0.0.0',
    },
});

