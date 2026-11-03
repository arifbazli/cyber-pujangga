import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/en",
  "/esei",
  "/essays",
  "/jurnal",
  "/journal",
  "/sajak",
  "/poems",
  "/tentang",
  "/en/about",
];

for (const route of routes) {
  test(`route is available: ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
  });
}

test("no horizontal overflow on phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("theme toggle switches the active theme", async ({ page }) => {
  await page.goto("/");
  const root = page.locator("html");
  const before = await root.getAttribute("data-theme");
  await page.locator("#themeBtn").click();
  const after = await root.getAttribute("data-theme");
  expect(after).not.toBe(before);
});

test("strict poem card image loads on small screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/poems/the-lamp-at-three");
  const image = page.locator(".poem-mobile-fallback img");
  await expect(image).toBeVisible();
  const loaded = await image.evaluate(
    (img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0,
  );
  expect(loaded).toBe(true);
});
