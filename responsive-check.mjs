export default async function run(page, ui) {
  const widths = [
    { name: "desktop", w: 1440, h: 1000 },
    { name: "tablet", w: 768, h: 1000 },
    { name: "mobile", w: 375, h: 900 },
  ];
  const results = [];

  for (const vp of widths) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);

    const section = page
      .locator("section")
      .filter({ has: page.locator('a[href*="tin-tuc"]') })
      .first();

    if ((await section.count()) === 0) {
      results.push({ vp: vp.name, error: "news section not found" });
      continue;
    }

    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    const info = await page.evaluate(() => {
      const secs = [...document.querySelectorAll("section")];
      const s = secs.find(
        (x) =>
          x.className.includes("py-20") &&
          x.querySelectorAll('a[href*="tin-tuc"]').length > 0,
      );
      if (!s) return null;
      const cards = [...s.querySelectorAll('a[href*="tin-tuc"]')];
      const bodyScrollW = document.body.scrollWidth;
      const docScrollW = document.documentElement.scrollWidth;
      return {
        viewport: window.innerWidth,
        bodyScrollW,
        docScrollW,
        overflowX: docScrollW > window.innerWidth + 1,
        sectionH: Math.round(s.getBoundingClientRect().height),
        cards: cards.map((a) => {
          const r = a.getBoundingClientRect();
          return {
            label: (a.textContent || "").trim().slice(0, 24),
            w: Math.round(r.width),
            h: Math.round(r.height),
            top: Math.round(r.top),
          };
        }),
      };
    });

    try {
      await section.screenshot({ path: `d:\\GZV\\GZV_Full_Website\\news-${vp.name}.png` })
    } catch {}
    results.push({ vp: vp.name, ...info });
  }

  return results;
}
