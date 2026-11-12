"""python build.py dev   -> copy the CSV into dev/data/ and serve data-app/ on :8000 (open /dev/)
   python build.py blog  -> dist/blog/: content/ without the Extensions API, plus data/<csv>
   python build.py package -> dist/<App>.twbx for Tableau Cloud (media list + fonts inlined)"""
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


def package():
    """dist/<App>.twbx for Tableau Cloud. Cloud serves the extension in a sandbox with an opaque origin and
    no CORS headers, so fetch() and @font-face url() of the package's own files fail. Work around it in the
    packaged copy only: media.json -> media/media.js (a <script>), fonts -> data: URIs (CSP allows font-src data:)."""
    import base64, json, zipfile
    pkg_id = CONTENT.parent.name
    stage = HERE / "dist" / "package"
    shutil.rmtree(stage, ignore_errors=True)
    content = stage / "Packages" / pkg_id / "content"
    shutil.copytree(CONTENT.parent, content.parent, ignore=shutil.ignore_patterns("*.woff2", "*.webm", "*.mp4"))
    media = json.loads((CONTENT / "media" / "media.json").read_text("utf-8"))
    (content / "media" / "media.js").write_text("window.TDF_MEDIA = " + json.dumps(media, ensure_ascii=False) + ";\n", "utf-8")
    html = content / "index.html"
    text = html.read_text("utf-8")
    assert '<script src="src/app.js"></script>' in text
    html.write_text(text.replace('<script src="src/app.js"></script>',
                                 '<script src="media/media.js"></script>\n    <script src="src/app.js"></script>'), "utf-8")
    css = content / "src" / "fonts.css"
    def inline(m):
        data = (CONTENT / "fonts" / m.group(1)).read_bytes()
        return 'url("data:font/woff2;base64,' + base64.b64encode(data).decode() + '")'
    css.write_text(re.sub(r'url\("\.\./fonts/([^"]+\.woff2)"\)', inline, css.read_text("utf-8")), "utf-8")
    assert ".woff2\")" not in css.read_text("utf-8"), "a font url was not inlined"
    # Cloud's package host intermittently 500s individual files (seen on styles.css and the Extensions API),
    # leaving the page unstyled or dead. CSP allows inline style/script, so inline every local CSS/JS file.
    text = html.read_text("utf-8")
    def local(path):
        body = (content / path).read_text("utf-8")
        assert "</script" not in body.lower() and "</style" not in body.lower(), path
        return body
    text = re.sub(r'<link rel="stylesheet" href="([^":]+\.css)" />', lambda m: "<style>\n" + local(m.group(1)) + "\n</style>", text)
    text = re.sub(r'<script src="([^":]+\.js)"></script>', lambda m: "<script>\n" + local(m.group(1)) + "\n</script>", text)
    assert not re.search(r'<(link rel="stylesheet"|script src=)', text), "a local css/js file was not inlined"
    html.write_text(text, "utf-8")
    twb = next(HERE.glob("*.twb"))
    out = HERE / "dist" / (twb.stem + ".twbx")
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(twb, twb.name)
        for f in sorted((stage / "Packages").rglob("*")):
            if f.is_file():
                z.write(f, f.relative_to(stage).as_posix())
        for top in ("Data", "Resources"):
            for f in sorted((HERE / top).rglob("*")):
                if f.is_file() and f.name != ".gitkeep":
                    z.write(f, f.relative_to(HERE).as_posix())
    print(out, f"{out.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    {"dev": dev, "blog": blog, "package": package}[sys.argv[1] if len(sys.argv) > 1 else "dev"]()
