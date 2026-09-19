/**
 * Phone-width regressions.
 *
 * All of these shipped: four action buttons per row pushing the ⋯ off-screen,
 * the tab strip clipped so Statistics could not be reached, the add-task row
 * hanging over the edge, and a `display: none` for the radio that lost to
 * source order and so never applied.
 */
const { test, expect, openApp } = require('./fixture.js');

test.skip(({ isMobile }) => !isMobile, 'phone layout only');

test('the list', async ({ page }) => {
    await openApp(page);
    await expect(page).toHaveScreenshot('m-list.png', { fullPage: true });
});

test('a row carries one control, sized for a thumb', async ({ page }) => {
    await openApp(page);
    const row = page.locator('[data-task-id="102"]');
    const visible = row.locator('.task-actions .task-btn:visible');
    await expect(visible).toHaveCount(1);
    await expect(visible).toHaveClass(/menu-btn/);
    const box = await visible.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
});

test('the task menu fits the screen', async ({ page }) => {
    await openApp(page);
    await page.locator('[data-task-id="102"] .menu-btn').click();
    const menu = page.locator('#task-menu');
    await expect(menu).toBeInViewport({ ratio: 1 });
    const item = menu.locator('.task-menu-item').first();
    expect((await item.boundingBox()).height).toBeGreaterThanOrEqual(40);
    await expect(menu).toHaveScreenshot('m-task-menu.png');
});

test('the detail panel takes the whole screen', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => openDetail(102));
    const panel = page.locator('#detail-panel');
    const box = await panel.boundingBox();
    expect(box.width).toBe(page.viewportSize().width);
    await expect(page).toHaveScreenshot('m-detail-panel.png');
});

test('the tab strip scrolls so the last tab is reachable', async ({ page }) => {
    await openApp(page);
    const tabs = page.locator('#tabs-container');
    await expect(tabs).toHaveCSS('overflow-x', 'auto');
    await tabs.evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
    });
    await expect(page.locator('.tab-btn').last()).toBeInViewport({ ratio: 1 });
});

test('the add-task row stays inside its container', async ({ page }) => {
    await openApp(page);
    const overflow = await page
        .locator('.add-task')
        .evaluate((el) => el.scrollWidth - Math.ceil(el.getBoundingClientRect().width));
    expect(overflow).toBeLessThanOrEqual(0);
});

test('the radio is present but compact', async ({ page }) => {
    await openApp(page);
    const radio = page.locator('#radio-widget');
    await expect(radio).toBeVisible();
    expect((await radio.boundingBox()).width).toBeLessThan(120);
    await expect(page.locator('.radio-info')).toBeHidden();
});

test('no view overflows sideways', async ({ page }) => {
    await openApp(page);
    for (const view of ['all', 'today', 'upcoming', 'done', 'trash', 'stats']) {
        await page.evaluate((v) => switchView(v), view);
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(overflow, `view ${view} overflows`).toBeLessThanOrEqual(0);
    }
});
