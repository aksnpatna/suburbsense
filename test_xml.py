import xml.etree.ElementTree as ET

def _sitemap_urlset():
    return ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

def _add_url(urlset, loc, changefreq="weekly", priority="0.8"):
    url = ET.SubElement(urlset, "url")
    loc_el = ET.SubElement(url, "loc")
    loc_el.text = loc
    cf = ET.SubElement(url, "changefreq")
    cf.text = changefreq
    pr = ET.SubElement(url, "priority")
    pr.text = priority

site_origin = "http://example.com"
urlset = _sitemap_urlset()

static_paths = [
    ("", "weekly", "1.0"),
    ("/calculators", "weekly", "0.9"),
]
for path, cf, pr in static_paths:
    _add_url(urlset, f"{site_origin}{path}", cf, pr)

xml_str = ET.tostring(urlset, encoding="utf-8", method="xml").decode("utf-8")
print(xml_str)
