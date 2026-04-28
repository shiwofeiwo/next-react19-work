import { defineConfig } from 'cypress';

export default defineConfig({
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        configFile: 'reporter-config.json',
    },
    component: {
        setupNodeEvents(on) {
            on('task', {
                'log': (message: string) => {
                    // eslint-disable-next-line no-console
                    console.log(message);
                    return null;
                },
            })
        },
        devServer: {
            framework: 'react',
            bundler: 'vite',
        },
        specPattern: ['**/__tests__/**/*-{spec,test}.{ts,tsx}'],
        viewportWidth: 1000,
        viewportHeight: 600,
    },
});
