import xml.etree.ElementTree as ET
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_realestate_db
from app.config import get_settings

router = APIRouter(tags=["SEO"])

SITE_MAP_INDEX_MAX = 45000


def _sitemap_urlset():
    return ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")


def _add_state_guides(urlset, site_origin):
    # Add State Hub pages and Guides
    states = ["VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"]
    categories = ["families", "commuters", "safest"]
    
    for state in states:
        # State Hub
        url = ET.SubElement(urlset, "url")
        loc = ET.SubElement(url, "loc")
        loc.text = f"{site_origin}/state/{state.lower()}"
        changefreq = ET.SubElement(url, "changefreq")
        changefreq.text = "daily"
        priority = ET.SubElement(url, "priority")
        priority.text = "0.9"
        
        # Guide pages for each state
        for cat in categories:
            url = ET.SubElement(urlset, "url")
            loc = ET.SubElement(url, "loc")
            loc.text = f"{site_origin}/guides/{state.lower()}/{cat}"
            changefreq = ET.SubElement(url, "changefreq")
            changefreq.text = "weekly"
            priority = ET.SubElement(url, "priority")
            priority.text = "0.8"


def _add_url(urlset, loc, changefreq="weekly", priority="0.8"):
    url = ET.SubElement(urlset, "url")
    loc_el = ET.SubElement(url, "loc")
    loc_el.text = loc
    cf = ET.SubElement(url, "changefreq")
    cf.text = changefreq
    pr = ET.SubElement(url, "priority")
    pr.text = priority


def _generate_state_sitemap(db: Session, state: str, site_origin: str) -> str:
    urlset = _sitemap_urlset()
    query = text("""
        SELECT name, postcode
        FROM suburbs_ui_v3
        WHERE state = :state
          AND geom IS NOT NULL
          AND coordinates IS NOT NULL
          AND population_2021 > 0
        ORDER BY name
    """)
    for row in db.execute(query, {"state": state}):
        slug = row.name.lower().replace(" ", "-").replace("'", "").replace(",", "")
        path = f"/suburb/{slug}-{row.state.lower()}-{row.postcode}"
        _add_url(urlset, f"{site_origin}{path}", priority="0.6")
    return ET.tostring(urlset, encoding="utf-8", method="xml").decode("utf-8")


@router.get("/robots.txt", response_class=Response)
def get_robots_txt():
    settings = get_settings()
    content = f"""User-agent: *
Allow: /
Disallow: /api/
Disallow: /compare?*

Sitemap: {settings.site_origin}/api/sitemap.xml
"""
    return Response(content=content, media_type="text/plain")


@router.get("/sitemap.xml", response_class=Response)
def get_sitemap_index(db: Session = Depends(get_realestate_db)):
    settings = get_settings()
    site_origin = settings.site_origin.rstrip("/")

    sitemap_index = ET.Element("sitemapindex", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    # Add static sitemap
    sitemap_el = ET.SubElement(sitemap_index, "sitemap")
    loc = ET.SubElement(sitemap_el, "loc")
    loc.text = f"{site_origin}/api/sitemap-static.xml"
    lastmod = ET.SubElement(sitemap_el, "lastmod")
    lastmod.text = "2026-08-25"

    for state in ["VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"]:
        count = db.execute(text("""
            SELECT COUNT(*) FROM suburbs_ui_v3
            WHERE state = :state AND geom IS NOT NULL AND coordinates IS NOT NULL AND population_2021 > 0
        """), {"state": state}).fetchone()[0]
        if count == 0:
            continue
        sitemap_el = ET.SubElement(sitemap_index, "sitemap")
        loc = ET.SubElement(sitemap_el, "loc")
        loc.text = f"{site_origin}/api/sitemap-{state.lower()}.xml"
        lastmod = ET.SubElement(sitemap_el, "lastmod")
        lastmod.text = "2026-08-25"

    xml_str = ET.tostring(sitemap_index, encoding="utf-8", method="xml").decode("utf-8")
    return Response(content=f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_str}', media_type="application/xml")


@router.get("/sitemap-{state}.xml", response_class=Response)
def get_state_sitemap(state: str, db: Session = Depends(get_realestate_db)):
    settings = get_settings()
    site_origin = settings.site_origin.rstrip("/")
    state = state.upper()

    xml_body = _generate_state_sitemap(db, state, site_origin)
    return Response(
        content=f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_body}',
        media_type="application/xml",
    )


@router.get("/sitemap-static.xml", response_class=Response)
def get_static_sitemap(db: Session = Depends(get_realestate_db)):
    settings = get_settings()
    site_origin = settings.site_origin.rstrip("/")

    urlset = _sitemap_urlset()

    static_paths = [
        ("", "weekly", "1.0"),
        ("/calculators", "weekly", "0.9"),
        ("/calculators/stamp-duty", "weekly", "0.8"),
        ("/calculators/land-tax", "weekly", "0.8"),
        ("/calculators/affordability", "weekly", "0.8"),
        ("/calculators/roi", "weekly", "0.8"),
        ("/calculators/fhbg", "weekly", "0.8"),
        ("/calculators/council-rates", "weekly", "0.8"),
        ("/energy/compare", "weekly", "0.9"),
        ("/nbn", "monthly", "0.7"),
        ("/privacy", "monthly", "0.3"),
        ("/terms", "monthly", "0.3"),
        ("/disclosure", "monthly", "0.3"),
    ]
    for path, cf, pr in static_paths:
        _add_url(urlset, f"{site_origin}{path}", cf, pr)

    for state in ["VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"]:
        _add_url(urlset, f"{site_origin}/state/{state.lower()}", "daily", "0.9")
        for cat in ["families", "commuters", "safest"]:
            _add_url(urlset, f"{site_origin}/guides/{state.lower()}/{cat}", "weekly", "0.8")

    xml_str = ET.tostring(urlset, encoding="utf-8", method="xml").decode("utf-8")
    return Response(content=f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_str}', media_type="application/xml")
