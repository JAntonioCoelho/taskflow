/**
 * Visual regression.
 *
 * Every case here is a layout failure that shipped today and that the Jest
 * suites happily passed through: focus mode squeezed into the sidebar's grid
 * column, CSS rules the parser dropped, action buttons overflowing a phone.
 * A screenshot is the only assertion that sees them.
 */
const { test, expect, openApp } = require('./fixture.js');

test.describe('the list', () => {
    test('dark', async ({ page }) => {
        await openApp(page);
        await expect(page).toHaveScreenshot('list-dark.png', { fullPage: true });
    });

    test('light', async ({ page }) => {
        await openApp(page, { theme: 'light' });
        await expect(page).toHaveScreenshot('list-light.png', { fullPage: true });
    });

    test('a row shows its actions on hover', async ({ page }) => {
        await openApp(page);
        const row = page.locator('[data-task-id="102"]');
        await row.hover();
        await expect(row).toHaveScreenshot('row-hover.png');
    });

    test('a row with nothing set is a single line', async ({ page }) => {
        await openApp(page);
        await expect(page.locator('[data-task-id="104"]')).toHaveScreenshot('row-bare.png');
    });
});

test.describe('focus mode', () => {
    // Regression: .container is a grid of `260px 1fr`; hiding the sidebar left
    // the content in the 260px track with the rest of the screen empty.
    test('fills the window', async ({ page }) => {
        await openApp(page);
        await page.evaluate(() => toggleFocusMode());
        await expect(page).toHaveScreenshot('focus-mode.png', { fullPage: true });
    });

    // Regression: a stray patch marker made the parser drop the pill's
    // `position: fixed`, so it rendered past the bottom of the document.
    test('the exit pill is on screen', async ({ page }) => {
        await openApp(page);
        await page.evaluate(() => toggleFocusMode());
        const pill = page.locator('.focus-exit-pill');
        await expect(pill).toBeInViewport();
        await expect(pill).toHaveCSS('position', 'fixed');
    });
});

test.describe('overlays', () => {
    test('detail panel', async ({ page }) => {
        await openApp(page);
        await page.evaluate(() => openDetail(102));
        await expect(page).toHaveScreenshot('detail-panel.png');
    });

    test('task menu', async ({ page }) => {
        await openApp(page);
        await page.locator('[data-task-id="102"]').hover();
        await page.locator('[data-task-id="102"] .menu-btn').click();
        await expect(page.locator('#task-menu')).toHaveScreenshot('task-menu.png');
    });

    test('command palette', async ({ page }) => {
        await openApp(page);
        await page.keyboard.press('Control+k');
        await page.locator('#palette-input').fill('rev');
        await expect(page.locator('.palette')).toHaveScreenshot('palette.png');
    });

    test('view menu', async ({ page }) => {
        await openApp(page);
        await page.locator('#view-menu-btn').click();
        await expect(page.locator('#task-menu')).toHaveScreenshot('view-menu.png');
    });
});

test.describe('statistics', () => {
    test('cards and charts', async ({ page }) => {
        await openApp(page);
        await page.evaluate(() => switchView('stats'));
        await expect(page).toHaveScreenshot('stats.png', { fullPage: true });
    });
});

test.describe('print', () => {
    test('drops the chrome and prints black on white', async ({ page }) => {
        await openApp(page);
        await page.emulateMedia({ media: 'print' });
        await expect(page).toHaveScreenshot('print.png', { fullPage: true });
    });
});

test.describe('nothing overflows sideways', () => {
    for (const view of ['all', 'today', 'upcoming', 'done', 'trash', 'stats']) {
        test(view, async ({ page }) => {
            await openApp(page);
            await page.evaluate((v) => switchView(v), view);
            const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth - window.innerWidth
            );
            expect(overflow).toBeLessThanOrEqual(0);
        });
    }
});
