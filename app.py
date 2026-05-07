"""
Push30 — каталог партнёров (FastAPI).

Запуск: uvicorn app:app --reload --port 8000
"""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from partner_art import PartnerKind, render_partner_svg

BASE = Path(__file__).resolve().parent
DATA_JSON = BASE / "data" / "partners.json"
TEMPLATES = Jinja2Templates(directory=str(BASE / "templates"))

app = FastAPI(title="Push30 Partners")

partners_main: list[dict] = []
partners_discount: list[dict] = []
_by_key: dict[tuple[str, int], dict] = {}


def _load_data() -> None:
    global partners_main, partners_discount, _by_key
    if not DATA_JSON.is_file():
        raise FileNotFoundError(f"Нет файла данных: {DATA_JSON}")
    raw = json.loads(DATA_JSON.read_text(encoding="utf-8"))
    partners_main = raw["mainPartners"]
    partners_discount = raw["discountPartners"]
    _by_key = {}
    for p in partners_main:
        _by_key[("main", int(p["id"]))] = p
    for p in partners_discount:
        _by_key[("discount", int(p["id"]))] = p


_load_data()

app.mount("/static", StaticFiles(directory=str(BASE / "static")), name="static")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> HTMLResponse:
    payload = json.dumps(
        {"mainPartners": partners_main, "discountPartners": partners_discount},
        ensure_ascii=False,
    )
    return TEMPLATES.TemplateResponse(
        request,
        "index.html",
        {
            "partners_json": payload,
            "main_count": len(partners_main),
            "discount_count": len(partners_discount),
        },
    )


@app.get("/partner-art/{kind}/{partner_id:int}")
async def partner_art(kind: str, partner_id: int) -> Response:
    if kind not in ("main", "discount"):
        raise HTTPException(404)
    pk: PartnerKind = "main" if kind == "main" else "discount"
    partner = _by_key.get((kind, partner_id))
    if not partner:
        raise HTTPException(404)
    svg = render_partner_svg(partner, pk)
    return Response(content=svg, media_type="image/svg+xml; charset=utf-8")
