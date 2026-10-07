export default async function run(page, ui) {
  const widths = [
    { name: "desktop", w: 1440, h: 1000 },
    { name: "tablet", w: 768, h: 1000 },
    { name: "mobile", w: 375, h: 812 },
  ];
  const out = [];

  for (const vp of widths) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);

    const section = page
      .locator("section")
      .filter({ has: page.locator('a[href*="tin-tuc"]') })
      .first();
    if ((await section.count()) === 0) {
      out.push({ vp: vp.name, error: "not found" });
      continue;
    }

    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    // đo khoảng trắng đáy trong từng thẻ: chiều cao thẻ trừ chiều cao nội dung thật
    const gaps = await page.evaluate(() => {
      const secs = [...document.querySelectorAll("section")];
      const s = secs.find(
        (x) =>
          x.className.includes("py-20") &&
          x.querySelectorAll('a[href*="tin-tuc"]').length > 0,
      );
      if (!s) return null;
      const cards = [...s.querySelectorAll('a[href*="tin-tuc"]')].slice(0, 4);
      return cards.map((a) => {
        const r = a.getBoundingClientRect();
        const img = a.querySelector("img");
        const ir = img ? img.getBoundingClientRect() : null;
        const textEls = [...a.querySelectorAll("h3,h4,p")];
        const textBottom = textEls.length
          ? Math.max(...textEls.map((t) => t.getBoundingClientRect().bottom))
          : r.top;
        return {
          label: (a.textContent || "").trim().slice(0, 22),
          cardH: Math.round(r.height),
          imgH: ir ? Math.round(ir.height) : 0,
          // trắng dưới chữ (dọc bên trong thẻ)
          padBelowText: Math.round(r.bottom - textBottom),
          // trắng đáy cột phải so với thẻ lớn
          descLen: (a.querySelector("p")?.textContent || "").trim().length,
        };
      });
    });

    try {
      await section.screenshot({
        path: `d:\\GZV\\GZV_Full_Website\\tz-${vp.name}.png`,
      });
    } catch {}
    out.push({ vp: vp.name, gaps });
  }
  return out;
}
