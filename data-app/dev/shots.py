"""python dev/shots.py  (with `python build.py dev` running) -> dev/screenshots/<width>-<n>-<step>.png"""
import pathlib
from playwright.sync_api import sync_playwright

URL = "http://localhost:8000/Packages/com.tableau.mcp.the-toughest-tour-story/content/index.html?csv=/dev/data/the_toughest_tour.csv"
OUT = pathlib.Path(__file__).parent / "screenshots"
OUT.mkdir(exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch()
    for name, vp in {"desktop": (1366, 800), "mobile": (390, 844)}.items():
        page = b.new_page(viewport={"width": vp[0], "height": vp[1]}, device_scale_factor=1)
        errors = []
        page.on("console", lambda m: m.type == "error" and errors.append(m.text))
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(URL)
        page.wait_for_selector(".wheel", state="attached"); page.wait_for_timeout(500)
        page.screenshot(path=OUT / f"{name}-0-masthead.png")
        for i, step in enumerate(page.eval_on_selector_all(".step", "s => s.map(n => n.dataset.step)"), 1):
            page.eval_on_selector(f'[data-step="{step}"]', "n => scrollTo(0, n.getBoundingClientRect().top + scrollY - innerHeight * (innerWidth < 832 ? 0.57 : 0.2))")
            page.wait_for_timeout(1600)
            page.screenshot(path=OUT / f"{name}-{i}-{step}.png")
        print(name, "errors:", errors or "none")
    b.close()
