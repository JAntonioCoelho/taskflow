// Visual regression only. The behaviour suites run under Jest (npm test);
// these exist because none of them can see a layout break — a collapsed grid,
// a rule the parser dropped, buttons overflowing a phone.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests-visual',
    // Snapshots are compared against committed baselines; nothing here should
    // pass by being retried into a different rendering.
    retries: 0,
    // Screenshots compete for CPU; under load the "element is stable" check
    // times out before the layout has settled, which reads as a false failure.
    fullyParallel: false,
    workers: 2,
    reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],

    expect: {
        timeout: 15000,
        toHaveScreenshot: {
            // Font hinting moves a pixel or two between runs on the same box.
            maxDiffPixelRatio: 0.002,
            animations: 'disabled',
        },
    },

    use: {
        baseURL: 'http://127.0.0.1:4173',
        screenshot: 'only-on-failure',
    },

    projects: [
        {
            name: 'desktop',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
        },
        { name: 'mobile', use: { ...devices['Pixel 7'] } },
    ],

    webServer: {
        command: 'npx http-server . -p 4173 -c-1 --silent',
        url: 'http://127.0.0.1:4173/index.html',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
