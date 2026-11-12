"""python build.py dev   -> copy the CSV into dev/data/ and serve data-app/ on :8000 (open /dev/)
   python build.py blog  -> dist/blog/: content/ without the Extensions API, plus data/<csv>"""
import http.server, functools, pathlib, re, shutil, sys

HERE = pathlib.Path(__file__).resolve().parent
CONTENT = HERE / "Packages" / "com.tableau.mcp.the-toughest-tour-story" / "content"
CSV = HERE.parent / "data" / "the_toughest_tour.csv"
EXT = "tableau.extensions.*.js"


def dev(port=8000):
    (HERE / "dev" / "data").mkdir(exist_ok=True)
    shutil.copy2(CSV, HERE / "dev" / "data" / CSV.name)
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(HERE))
    print(f"http://localhost:{port}/dev/")
    http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()


def blog():
    out = HERE / "dist" / "blog"
    shutil.rmtree(out, ignore_errors=True)
    shutil.copytree(CONTENT, out, ignore=shutil.ignore_patterns(EXT))
    html = out / "index.html"
    text = re.sub(r'\s*<script src="src/tableau\.extensions[^"]*"></script>', "", html.read_text("utf-8"))
    text = re.sub(r"\s*<!-- Tableau Extensions API.*?-->", "", text, flags=re.S)
    html.write_text(text, "utf-8")
    (out / "data").mkdir()
    shutil.copy2(CSV, out / "data" / CSV.name)
    assert not list(out.rglob(EXT)) and "tableau.extensions" not in text, "Extensions API leaked into blog build"
    print(out)


if __name__ == "__main__":
    {"dev": dev, "blog": blog}[sys.argv[1] if len(sys.argv) > 1 else "dev"]()
