export default async function run(page, ui) {
  const section = page
    .locator("section")
    .filter({ has: page.locator('a[href*="tin-tuc"]') })
    .first();
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await section.screenshot({ path: "d:\\GZV\\GZV_Full_Website\\news-section.png" });
  const box = await section.boundingBox();
  const cards = await section.locator('a[href*="tin-tuc"]').count();
  return { box, cards };
}
