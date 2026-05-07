"""Генерация SVG-карточек партнёров (паритет с src/routes/index.tsx)."""

from __future__ import annotations

from typing import Any, Literal

PartnerKind = Literal["main", "discount"]

SERVICE_LABELS: dict[str, str] = {
    "gym": "Тренажер",
    "yoga": "Йога",
    "spa": "Спа",
    "entertainment": "Развлечение",
    "martial": "Боевые искусства",
    "dance": "Танцы",
    "pool": "Бассейн",
}

SERVICE_THEMES: dict[str, dict[str, str]] = {
    "gym": {
        "bg1": "#100504",
        "bg2": "#2a0d07",
        "accent": "#e04e1a",
        "dust": "#f5c4a8",
        "glow": "#ff7040",
    },
    "yoga": {
        "bg1": "#030c07",
        "bg2": "#08190e",
        "accent": "#3a9e66",
        "dust": "#aed8bc",
        "glow": "#58c880",
    },
    "pool": {
        "bg1": "#020810",
        "bg2": "#051428",
        "accent": "#1882cc",
        "dust": "#9eccea",
        "glow": "#3aaaff",
    },
    "spa": {
        "bg1": "#0d0509",
        "bg2": "#1e0912",
        "accent": "#c84e8a",
        "dust": "#f0b4d4",
        "glow": "#e06aaa",
    },
    "dance": {
        "bg1": "#060310",
        "bg2": "#0d0620",
        "accent": "#7038dc",
        "dust": "#c0a4f0",
        "glow": "#9858ff",
    },
    "martial": {
        "bg1": "#0a0202",
        "bg2": "#1c0404",
        "accent": "#c02020",
        "dust": "#eeaaaa",
        "glow": "#e03838",
    },
    "entertainment": {
        "bg1": "#040510",
        "bg2": "#080c22",
        "accent": "#cc8c0a",
        "dust": "#f8de96",
        "glow": "#f2aa18",
    },
}

SERVICE_RULES: list[dict[str, Any]] = [
    {
        "value": "yoga",
        "categories": ("yoga", "pilates"),
        "terms": (
            "йога",
            "yoga",
            "stretch",
            "стретч",
            "пилатес",
            "pilates",
            "gravity",
            "гравити",
            "здоровая спина",
        ),
    },
    {
        "value": "gym",
        "categories": ("gym", "sport_shop", "crossfit", "running"),
        "terms": (
            "тренажер",
            "тренажёр",
            "gym",
            "кроссфит",
            "crossfit",
            "functional",
            "fitness",
            "фитнес",
            "кардио",
            "tabata",
            "trx",
        ),
    },
    {
        "value": "spa",
        "categories": ("spa", "dental"),
        "terms": (
            "спа",
            "spa",
            "сауна",
            "баня",
            "хаммам",
            "хамам",
            "джакузи",
            "массаж",
            "lpg",
            "космет",
            "солевая",
            "процедур",
        ),
    },
    {
        "value": "entertainment",
        "categories": (
            "bowling",
            "climbing",
            "golf",
            "horse",
            "ice",
            "padel",
            "pingpong",
            "rafting",
            "shooting",
            "tennis",
        ),
        "terms": (
            "vr",
            "картинг",
            "катание",
            "лед",
            "конь",
            "верховая",
            "зиплайн",
            "веревоч",
            "тюбинг",
            "скалодром",
            "bowling",
            "гольф",
            "падел",
            "теннис",
            "пинг",
            "рафтинг",
            "стрельб",
            "лук",
            "развлеч",
            "игра",
        ),
    },
    {
        "value": "martial",
        "categories": ("martial",),
        "terms": (
            "boxing",
            "бокс",
            "mma",
            "jiu",
            "jitsu",
            "джиу",
            "карат",
            "единобор",
            "борьб",
            "grappling",
            "wrestling",
            "боев",
            "муай",
        ),
    },
    {
        "value": "dance",
        "categories": ("dance",),
        "terms": ("dance", "танц", "зумба", "arabic", "латин", "belly"),
    },
    {
        "value": "pool",
        "categories": ("pool",),
        "terms": ("бассейн", "pool", "плав", "пляж", "аква"),
    },
]


def _escape_xml(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def _hash_string(value: str) -> int:
    h = 2166136261
    for ch in value:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def _partner_text(partner: dict[str, Any], kind: PartnerKind) -> str:
    parts: list[str] = [
        str(partner.get("name") or ""),
        str(partner.get("category") or ""),
    ]
    if kind == "main":
        if partner.get("standard"):
            parts.append(str(partner["standard"]))
        if partner.get("plus"):
            parts.append(str(partner["plus"]))
    else:
        if partner.get("description"):
            parts.append(str(partner["description"]))
    return " ".join(parts).lower()


def _includes_any(text: str, terms: tuple[str, ...]) -> bool:
    return any(term in text for term in terms)


def partner_services(partner: dict[str, Any], kind: PartnerKind) -> list[str]:
    text = _partner_text(partner, kind)
    cat = partner.get("category") or ""
    out: list[str] = []
    for rule in SERVICE_RULES:
        if cat in rule["categories"] or _includes_any(text, rule["terms"]):
            out.append(rule["value"])
    return out


def primary_service(partner: dict[str, Any], kind: PartnerKind) -> str:
    svcs = partner_services(partner, kind)
    return svcs[0] if svcs else "gym"


def _build_scene(service: str, t: dict[str, str], seed: int) -> str:
    vx = (seed % 41) - 20
    vy = ((seed >> 5) % 31) - 15
    accent = t["accent"]
    dust = t["dust"]
    glow = t["glow"]
    bg2 = t["bg2"]

    if service == "gym":
        return f"""
        <circle cx="600" cy="290" r="210" fill="{accent}" opacity=".07"/>
        <rect x="100" y="256" width="1000" height="26" rx="13" fill="{accent}" opacity=".9"/>
        <ellipse cx="162" cy="269" rx="20" ry="108" fill="{dust}" opacity=".8"/>
        <ellipse cx="162" cy="269" rx="13" ry="90" fill="{bg2}"/>
        <ellipse cx="162" cy="269" rx="8" ry="74" fill="{dust}" opacity=".52"/>
        <ellipse cx="196" cy="269" rx="20" ry="104" fill="{dust}" opacity=".74"/>
        <ellipse cx="196" cy="269" rx="13" ry="86" fill="{bg2}"/>
        <ellipse cx="1038" cy="269" rx="20" ry="108" fill="{dust}" opacity=".8"/>
        <ellipse cx="1038" cy="269" rx="13" ry="90" fill="{bg2}"/>
        <ellipse cx="1038" cy="269" rx="8" ry="74" fill="{dust}" opacity=".52"/>
        <ellipse cx="1004" cy="269" rx="20" ry="104" fill="{dust}" opacity=".74"/>
        <ellipse cx="1004" cy="269" rx="13" ry="86" fill="{bg2}"/>
        <rect x="246" y="232" width="34" height="74" rx="6" fill="{glow}" opacity=".88"/>
        <rect x="920" y="232" width="34" height="74" rx="6" fill="{glow}" opacity=".88"/>
        <ellipse cx="162" cy="269" rx="36" ry="130" fill="{glow}" opacity=".1"/>
        <ellipse cx="1038" cy="269" rx="36" ry="130" fill="{glow}" opacity=".1"/>
        <rect x="{440 + vx}" y="382" width="320" height="24" rx="12" fill="{accent}" opacity=".44"/>
        <rect x="{468 + vx}" y="405" width="264" height="66" rx="10" fill="{dust}" opacity=".16"/>
        <circle cx="{600 + vx}" cy="{318 + vy}" r="30" fill="{dust}" opacity=".66"/>
        <ellipse cx="{600 + vx}" cy="{378 + vy}" rx="42" ry="50" fill="{dust}" opacity=".54"/>
        <path d="M{574 + vx} {350 + vy} Q{518 + vx} 298 472 264" stroke="{dust}" stroke-width="20" stroke-linecap="round" fill="none" opacity=".64"/>
        <path d="M{626 + vx} {350 + vy} Q{682 + vx} 298 728 264" stroke="{dust}" stroke-width="20" stroke-linecap="round" fill="none" opacity=".64"/>
        <path d="M{578 + vx} {425 + vy} L{548 + vx} {494 + vy}" stroke="{dust}" stroke-width="22" stroke-linecap="round" fill="none" opacity=".48"/>
        <path d="M{622 + vx} {425 + vy} L{652 + vx} {494 + vy}" stroke="{dust}" stroke-width="22" stroke-linecap="round" fill="none" opacity=".48"/>
        """

    if service == "yoga":
        return f"""
        <circle cx="{600 + vx}" cy="{300 + vy}" r="240" fill="none" stroke="{accent}" stroke-width="1.5" opacity=".22"/>
        <circle cx="{600 + vx}" cy="{300 + vy}" r="188" fill="none" stroke="{glow}" stroke-width="2" opacity=".28"/>
        <circle cx="{600 + vx}" cy="{300 + vy}" r="136" fill="{accent}" opacity=".08"/>
        <path d="M{600+vx} {300+vy} Q{560+vx} {218+vy} {600+vx} {158+vy} Q{640+vx} {218+vy} {600+vx} {300+vy}Z" fill="{dust}" opacity=".3"/>
        <path d="M{600+vx} {300+vy} Q{682+vx} {260+vy} {742+vx} {300+vy} Q{682+vx} {340+vy} {600+vx} {300+vy}Z" fill="{dust}" opacity=".3"/>
        <path d="M{600+vx} {300+vy} Q{640+vx} {382+vy} {600+vx} {442+vy} Q{560+vx} {382+vy} {600+vx} {300+vy}Z" fill="{dust}" opacity=".3"/>
        <path d="M{600+vx} {300+vy} Q{518+vx} {340+vy} {458+vx} {300+vy} Q{518+vx} {260+vy} {600+vx} {300+vy}Z" fill="{dust}" opacity=".3"/>
        <path d="M{600+vx} {300+vy} Q{646+vx} {220+vy} {688+vx} {174+vy} Q{676+vx} {256+vy} {600+vx} {300+vy}Z" fill="{accent}" opacity=".22"/>
        <path d="M{600+vx} {300+vy} Q{680+vx} {352+vy} {726+vx} {398+vy} Q{656+vx} {370+vy} {600+vx} {300+vy}Z" fill="{accent}" opacity=".22"/>
        <path d="M{600+vx} {300+vy} Q{554+vx} {382+vy} {512+vx} {428+vy} Q{524+vx} {346+vy} {600+vx} {300+vy}Z" fill="{accent}" opacity=".22"/>
        <path d="M{600+vx} {300+vy} Q{520+vx} {248+vy} {476+vx} {202+vy} Q{548+vx} {246+vy} {600+vx} {300+vy}Z" fill="{accent}" opacity=".22"/>
        <circle cx="{600+vx}" cy="{300+vy}" r="52" fill="{accent}" opacity=".28"/>
        <circle cx="{600+vx}" cy="{300+vy}" r="28" fill="{glow}" opacity=".36"/>
        <ellipse cx="{600+vx}" cy="{432+vy}" rx="88" ry="32" fill="{dust}" opacity=".7"/>
        <path d="M{516+vx} {428+vy} Q{475+vx} {386+vy} {506+vx} {354+vy}" stroke="{dust}" stroke-width="28" stroke-linecap="round" fill="none" opacity=".6"/>
        <path d="M{684+vx} {428+vy} Q{725+vx} {386+vy} {694+vx} {354+vy}" stroke="{dust}" stroke-width="28" stroke-linecap="round" fill="none" opacity=".6"/>
        <path d="M{600+vx} {370+vy} L{600+vx} {250+vy}" stroke="{dust}" stroke-width="30" stroke-linecap="round" fill="none" opacity=".72"/>
        <path d="M{578+vx} {338+vy} Q{508+vx} {336+vy} {476+vx} {354+vy}" stroke="{dust}" stroke-width="16" stroke-linecap="round" fill="none" opacity=".72"/>
        <path d="M{622+vx} {338+vy} Q{692+vx} {336+vy} {724+vx} {354+vy}" stroke="{dust}" stroke-width="16" stroke-linecap="round" fill="none" opacity=".72"/>
        <circle cx="{600+vx}" cy="{220+vy}" r="34" fill="{dust}" opacity=".78"/>
        <circle cx="{600+vx}" cy="{220+vy}" r="50" fill="none" stroke="{glow}" stroke-width="3" opacity=".5"/>
        """

    if service == "pool":
        return f"""
        <line x1="60" y1="{175+vy}" x2="1140" y2="{175+vy}" stroke="{dust}" stroke-width="6" stroke-dasharray="32 22" opacity=".44"/>
        <line x1="60" y1="{235+vy}" x2="1140" y2="{235+vy}" stroke="{accent}" stroke-width="5" stroke-dasharray="28 20" opacity=".5"/>
        <line x1="60" y1="{295+vy}" x2="1140" y2="{295+vy}" stroke="{dust}" stroke-width="6" stroke-dasharray="32 22" opacity=".44"/>
        <line x1="60" y1="{355+vy}" x2="1140" y2="{355+vy}" stroke="{accent}" stroke-width="5" stroke-dasharray="28 20" opacity=".5"/>
        <line x1="60" y1="{415+vy}" x2="1140" y2="{415+vy}" stroke="{dust}" stroke-width="6" stroke-dasharray="32 22" opacity=".44"/>
        <path d="M0 {488+vy} Q200 {468+vy} 400 {488+vy} Q600 {508+vy} 800 {488+vy} Q1000 {468+vy} 1200 {488+vy}" stroke="{glow}" stroke-width="3" fill="none" opacity=".38"/>
        <path d="M0 {508+vy} Q300 {494+vy} 600 {508+vy} Q900 {522+vy} 1200 {508+vy}" stroke="{glow}" stroke-width="2" fill="none" opacity=".28"/>
        <rect x="0" y="{472+vy}" width="1200" height="70" fill="{accent}" opacity=".1"/>
        <ellipse cx="{820+vx}" cy="{254+vy}" rx="28" ry="24" fill="{dust}" opacity=".82" transform="rotate(-12 {820+vx} {254+vy})"/>
        <path d="M{820+vx} {262+vy} Q{700+vx} {274+vy} {580+vx} {267+vy} Q{480+vx} {260+vy} {400+vx} {270+vy}" stroke="{dust}" stroke-width="30" stroke-linecap="round" fill="none" opacity=".72"/>
        <path d="M{400+vx} {270+vy} Q{310+vx} {252+vy} {245+vx} {245+vy}" stroke="{dust}" stroke-width="19" stroke-linecap="round" fill="none" opacity=".65"/>
        <path d="M{820+vx} {262+vy} Q{872+vx} {196+vy} {924+vx} {216+vy} Q{970+vx} {238+vy} {962+vx} {268+vy}" stroke="{glow}" stroke-width="17" stroke-linecap="round" fill="none" opacity=".6"/>
        <path d="M{580+vx} {267+vy} Q{598+vx} {296+vy} {568+vx} {316+vy}" stroke="{dust}" stroke-width="17" stroke-linecap="round" fill="none" opacity=".54"/>
        <path d="M{580+vx} {267+vy} Q{560+vx} {238+vy} {542+vx} {218+vy}" stroke="{dust}" stroke-width="15" stroke-linecap="round" fill="none" opacity=".5"/>
        <circle cx="{962+vx}" cy="{268+vy}" r="20" fill="{glow}" opacity=".18"/>
        <circle cx="{935+vx}" cy="{260+vy}" r="11" fill="{glow}" opacity=".28"/>
        <circle cx="{955+vx}" cy="{282+vy}" r="8" fill="{dust}" opacity=".22"/>
        """

    if service == "spa":
        return f"""
        <circle cx="{600+vx}" cy="{400+vy}" r="250" fill="{accent}" opacity=".09"/>
        <path d="M{378+vx} {355+vy} Q{356+vx} {292+vy} {378+vx} {242+vy} Q{400+vx} {292+vy} {378+vx} {355+vy}Z" fill="{dust}" opacity=".38"/>
        <path d="M{378+vx} {355+vy} Q{440+vx} {334+vy} {482+vx} {355+vy} Q{440+vx} {376+vy} {378+vx} {355+vy}Z" fill="{dust}" opacity=".38"/>
        <path d="M{378+vx} {355+vy} Q{358+vx} {416+vy} {378+vx} {466+vy} Q{400+vx} {416+vy} {378+vx} {355+vy}Z" fill="{dust}" opacity=".32"/>
        <path d="M{378+vx} {355+vy} Q{318+vx} {334+vy} {276+vx} {355+vy} Q{318+vx} {376+vy} {378+vx} {355+vy}Z" fill="{dust}" opacity=".32"/>
        <path d="M{378+vx} {355+vy} Q{415+vx} {278+vy} {446+vx} {232+vy} Q{424+vx} {300+vy} {378+vx} {355+vy}Z" fill="{accent}" opacity=".28"/>
        <path d="M{378+vx} {355+vy} Q{324+vx} {290+vy} {294+vx} {244+vy} Q{340+vx} {306+vy} {378+vx} {355+vy}Z" fill="{accent}" opacity=".28"/>
        <circle cx="{378+vx}" cy="{355+vy}" r="26" fill="{accent}" opacity=".62"/>
        <circle cx="{378+vx}" cy="{355+vy}" r="14" fill="{glow}" opacity=".7"/>
        <rect x="{638+vx}" y="{386+vy}" width="64" height="106" rx="6" fill="{dust}" opacity=".52"/>
        <rect x="{630+vx}" y="{370+vy}" width="80" height="22" rx="5" fill="{accent}" opacity=".62"/>
        <line x1="{670+vx}" y1="{370+vy}" x2="{670+vx}" y2="{352+vy}" stroke="{dust}" stroke-width="3" opacity=".55"/>
        <path d="M{670+vx} {351+vy} Q{646+vx} {316+vy} {658+vx} {283+vy} Q{676+vx} {275+vy} {688+vx} {303+vy} Q{700+vx} {332+vy} {670+vx} {351+vy}Z" fill="{accent}" opacity=".88"/>
        <path d="M{670+vx} {347+vy} Q{658+vx} {322+vy} {666+vx} {296+vy} Q{674+vx} {290+vy} {680+vx} {310+vy} Q{686+vx} {330+vy} {670+vx} {347+vy}Z" fill="{glow}" opacity=".88"/>
        <path d="M{653+vx} {278+vy} Q{632+vx} {244+vy} {653+vx} {208+vy} Q{674+vx} {172+vy} {653+vx} {138+vy}" stroke="{dust}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".38"/>
        <path d="M{670+vx} {272+vy} Q{690+vx} {232+vy} {670+vx} {192+vy} Q{650+vx} {152+vy} {670+vx} {112+vy}" stroke="{glow}" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".44"/>
        <path d="M{688+vx} {276+vy} Q{708+vx} {240+vy} {688+vx} {204+vy} Q{668+vx} {168+vy} {688+vx} {132+vy}" stroke="{dust}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".34"/>
        <path d="M{862+vx} {462+vy} Q{942+vx} {358+vy} {900+vx} {268+vy} Q{798+vx} {330+vy} {862+vx} {462+vy}Z" fill="{dust}" opacity=".33"/>
        <path d="M{862+vx} {462+vy} L{900+vx} {268+vy}" stroke="{glow}" stroke-width="2.5" fill="none" opacity=".48"/>
        <path d="M{870+vx} {420+vy} Q{910+vx} {376+vy} {894+vx} {326+vy}" stroke="{glow}" stroke-width="2" fill="none" opacity=".38"/>
        <circle cx="{220+vx}" cy="{178+vy}" r="8" fill="{glow}" opacity=".32"/>
        <circle cx="{256+vx}" cy="{218+vy}" r="5" fill="{dust}" opacity=".28"/>
        <circle cx="{952+vx}" cy="{198+vy}" r="10" fill="{accent}" opacity=".24"/>
        <circle cx="{980+vx}" cy="{158+vy}" r="6" fill="{glow}" opacity=".28"/>
        """

    if service == "dance":
        return f"""
        <ellipse cx="{600+vx}" cy="{518+vy}" rx="340" ry="38" fill="{accent}" opacity=".12"/>
        <circle cx="{448+vx}" cy="{196+vy}" r="30" fill="{dust}" opacity=".78"/>
        <path d="M{448+vx} {226+vy} Q{442+vx} {326+vy} {448+vx} {378+vy}" stroke="{dust}" stroke-width="26" stroke-linecap="round" fill="none" opacity=".7"/>
        <path d="M{448+vx} {272+vy} Q{508+vx} {236+vy} {558+vx} {206+vy}" stroke="{dust}" stroke-width="19" stroke-linecap="round" fill="none" opacity=".72"/>
        <path d="M{448+vx} {278+vy} Q{378+vx} {246+vy} {328+vx} {236+vy}" stroke="{dust}" stroke-width="19" stroke-linecap="round" fill="none" opacity=".65"/>
        <path d="M{448+vx} {378+vy} Q{418+vx} {442+vy} {390+vx} {490+vy}" stroke="{dust}" stroke-width="24" stroke-linecap="round" fill="none" opacity=".7"/>
        <path d="M{448+vx} {378+vy} Q{494+vx} {434+vy} {528+vx} {458+vy}" stroke="{dust}" stroke-width="22" stroke-linecap="round" fill="none" opacity=".64"/>
        <path d="M{558+vx} {206+vy} Q{600+vx} {194+vy} {642+vx} {208+vy}" stroke="{accent}" stroke-width="10" stroke-linecap="round" fill="none" opacity=".68"/>
        <circle cx="{752+vx}" cy="{198+vy}" r="30" fill="{glow}" opacity=".78"/>
        <path d="M{752+vx} {228+vy} Q{758+vx} {328+vy} {752+vx} {374+vy}" stroke="{glow}" stroke-width="26" stroke-linecap="round" fill="none" opacity=".7"/>
        <path d="M{752+vx} {274+vy} Q{690+vx} {238+vy} {642+vx} {208+vy}" stroke="{glow}" stroke-width="19" stroke-linecap="round" fill="none" opacity=".72"/>
        <path d="M{752+vx} {280+vy} Q{820+vx} {248+vy} {872+vx} {244+vy}" stroke="{glow}" stroke-width="19" stroke-linecap="round" fill="none" opacity=".65"/>
        <path d="M{752+vx} {374+vy} Q{792+vx} {438+vy} {822+vx} {482+vy}" stroke="{glow}" stroke-width="24" stroke-linecap="round" fill="none" opacity=".7"/>
        <path d="M{752+vx} {374+vy} Q{706+vx} {432+vy} {676+vx} {474+vy}" stroke="{glow}" stroke-width="22" stroke-linecap="round" fill="none" opacity=".64"/>
        <text x="{275+vx}" y="{346+vy}" fill="{dust}" font-size="68" opacity=".34" font-family="serif">♪</text>
        <text x="{876+vx}" y="{288+vy}" fill="{glow}" font-size="54" opacity=".34" font-family="serif">♫</text>
        <text x="{540+vx}" y="{158+vy}" fill="{accent}" font-size="42" opacity=".42" font-family="serif">♩</text>
        <circle cx="{298+vx}" cy="{178+vy}" r="6" fill="{accent}" opacity=".5"/>
        <circle cx="{326+vx}" cy="{200+vy}" r="4" fill="{glow}" opacity=".44"/>
        <circle cx="{922+vx}" cy="{218+vy}" r="7" fill="{dust}" opacity=".44"/>
        <circle cx="{948+vx}" cy="{198+vy}" r="4" fill="{accent}" opacity=".4"/>
        <circle cx="{600+vx}" cy="{130+vy}" r="5" fill="{glow}" opacity=".5"/>
        """

    if service == "martial":
        return f"""
        <path d="M{600+vx} {118+vy} L{820+vx} {200+vy} L{820+vx} {380+vy} C{820+vx} {480+vy} {600+vx} {542+vy} {600+vx} {542+vy} C{600+vx} {542+vy} {380+vx} {480+vy} {380+vx} {380+vy} L{380+vx} {200+vy} Z" fill="{accent}" opacity=".18"/>
        <path d="M{600+vx} {144+vy} L{795+vx} {220+vy} L{795+vx} {375+vy} C{795+vx} {466+vy} {600+vx} {518+vy} {600+vx} {518+vy} C{600+vx} {518+vy} {405+vx} {466+vy} {405+vx} {375+vy} L{405+vx} {220+vy} Z" fill="none" stroke="{glow}" stroke-width="4" opacity=".44"/>
        <circle cx="{600+vx}" cy="{224+vy}" r="32" fill="{dust}" opacity=".76"/>
        <path d="M{600+vx} {256+vy} L{600+vx} {390+vy}" stroke="{dust}" stroke-width="34" stroke-linecap="round" fill="none" opacity=".7"/>
        <path d="M{575+vx} {300+vy} Q{510+vx} {274+vy} {458+vx} {244+vy}" stroke="{dust}" stroke-width="23" stroke-linecap="round" fill="none" opacity=".72"/>
        <circle cx="{456+vx}" cy="{242+vy}" r="18" fill="{glow}" opacity=".64"/>
        <path d="M{625+vx} {306+vy} Q{700+vx} {278+vy} {752+vx} {258+vy}" stroke="{glow}" stroke-width="23" stroke-linecap="round" fill="none" opacity=".72"/>
        <circle cx="{754+vx}" cy="{256+vy}" r="18" fill="{accent}" opacity=".7"/>
        <path d="M{578+vx} {390+vy} Q{536+vx} {454+vy} {488+vx} {490+vy}" stroke="{dust}" stroke-width="28" stroke-linecap="round" fill="none" opacity=".7"/>
        <path d="M{622+vx} {390+vy} Q{668+vx} {446+vy} {716+vx} {482+vy}" stroke="{dust}" stroke-width="28" stroke-linecap="round" fill="none" opacity=".7"/>
        <line x1="{318+vx}" y1="{180+vy}" x2="{452+vx}" y2="{248+vy}" stroke="{glow}" stroke-width="2.5" stroke-dasharray="16 12" opacity=".4"/>
        <line x1="{308+vx}" y1="{208+vy}" x2="{447+vx}" y2="{262+vy}" stroke="{dust}" stroke-width="2" stroke-dasharray="12 16" opacity=".3"/>
        <line x1="{298+vx}" y1="{236+vy}" x2="{442+vx}" y2="{278+vy}" stroke="{glow}" stroke-width="1.5" stroke-dasharray="10 18" opacity=".24"/>
        <circle cx="{456+vx}" cy="{242+vy}" r="34" fill="none" stroke="{glow}" stroke-width="3" opacity=".38" stroke-dasharray="8 6"/>
        <circle cx="{456+vx}" cy="{242+vy}" r="54" fill="none" stroke="{accent}" stroke-width="2" opacity=".22" stroke-dasharray="6 10"/>
        """

    if service == "entertainment":
        return f"""
        <circle cx="{600+vx}" cy="{310+vy}" r="220" fill="{accent}" opacity=".1"/>
        <rect x="{376+vx}" y="{240+vy}" width="448" height="248" rx="124" fill="{dust}" opacity=".55"/>
        <rect x="{394+vx}" y="{444+vy}" width="122" height="88" rx="40" fill="{dust}" opacity=".5"/>
        <rect x="{684+vx}" y="{444+vy}" width="122" height="88" rx="40" fill="{dust}" opacity=".5"/>
        <circle cx="{448+vx}" cy="{364+vy}" r="30" fill="{bg2}" opacity=".8"/>
        <path d="M{433+vx} {364+vy} H{463+vx} M{448+vx} {349+vy} V{379+vy}" stroke="{accent}" stroke-width="8" stroke-linecap="round"/>
        <circle cx="{752+vx}" cy="{344+vy}" r="17" fill="{glow}" opacity=".76"/>
        <circle cx="{792+vx}" cy="{374+vy}" r="17" fill="{accent}" opacity=".72"/>
        <circle cx="{752+vx}" cy="{404+vy}" r="17" fill="{dust}" opacity=".66"/>
        <circle cx="{712+vx}" cy="{374+vy}" r="17" fill="{glow}" opacity=".7"/>
        <rect x="{562+vx}" y="{350+vy}" width="34" height="17" rx="8.5" fill="{bg2}" opacity=".7"/>
        <rect x="{604+vx}" y="{350+vy}" width="34" height="17" rx="8.5" fill="{bg2}" opacity=".7"/>
        <circle cx="{490+vx}" cy="{424+vy}" r="26" fill="{bg2}" opacity=".76"/>
        <circle cx="{490+vx}" cy="{424+vy}" r="16" fill="{accent}" opacity=".58"/>
        <circle cx="{710+vx}" cy="{424+vy}" r="26" fill="{bg2}" opacity=".76"/>
        <circle cx="{710+vx}" cy="{424+vy}" r="16" fill="{glow}" opacity=".58"/>
        <circle cx="{256+vx}" cy="{176+vy}" r="12" fill="{glow}" opacity=".52"/>
        <circle cx="{944+vx}" cy="{148+vy}" r="16" fill="{accent}" opacity=".48"/>
        <circle cx="{198+vx}" cy="{418+vy}" r="9" fill="{dust}" opacity=".44"/>
        <circle cx="{1002+vx}" cy="{380+vy}" r="14" fill="{glow}" opacity=".48"/>
        <circle cx="{348+vx}" cy="{138+vy}" r="7" fill="{accent}" opacity=".52"/>
        <circle cx="{852+vx}" cy="{142+vy}" r="10" fill="{dust}" opacity=".48"/>
        <path d="M{298+vx} {318+vy} L{328+vx} {292+vy} L{313+vx} {308+vy} L{344+vx} {282+vy}" stroke="{glow}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/>
        <path d="M{902+vx} {318+vy} L{872+vx} {292+vy} L{887+vx} {308+vy} L{856+vx} {282+vy}" stroke="{accent}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/>
        """

    return _build_scene("gym", t, seed)


def render_partner_svg(partner: dict[str, Any], kind: PartnerKind) -> str:
    pid = int(partner["id"])
    cache_key = f"v3-{'D' if kind == 'discount' else 'M'}-{pid}"
    name = str(partner.get("name") or "")
    seed = _hash_string(name + cache_key)
    service = primary_service(partner, kind)
    t = SERVICE_THEMES[service]
    badge = str(pid).zfill(3)
    short_name = _escape_xml(name[:24])
    service_label = _escape_xml(SERVICE_LABELS[service].upper())
    scene = _build_scene(service, t, seed)
    bg1 = t["bg1"]
    bg2 = t["bg2"]
    dust = t["dust"]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="{short_name}">
<defs>
<linearGradient id="bg{seed}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="{bg1}"/>
<stop offset="0.55" stop-color="{bg2}"/>
<stop offset="1" stop-color="{bg1}"/>
</linearGradient>
<linearGradient id="fg{seed}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0.58" stop-color="{bg1}" stop-opacity="0"/>
<stop offset="1" stop-color="{bg1}" stop-opacity="0.92"/>
</linearGradient>
<pattern id="gr{seed}" width="48" height="48" patternUnits="userSpaceOnUse">
<path d="M0 0H80M0 0V80" stroke="{dust}" stroke-opacity=".06" stroke-width="1.5"/>
</pattern>
<filter id="gn{seed}">
<feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" stitchTiles="stitch"/>
<feColorMatrix type="saturate" values="0"/>
<feComponentTransfer><feFuncA type="table" tableValues="0 .2"/></feComponentTransfer>
</filter>
</defs>
<rect width="1200" height="720" fill="url(#bg{seed})"/>
<rect width="1200" height="720" fill="url(#gr{seed})"/>
{scene}
<rect width="1200" height="720" fill="url(#fg{seed})"/>
<text x="56" y="620" fill="{dust}" font-family="Georgia,serif" font-size="26" font-weight="700" letter-spacing="2">PUSH30-{badge}</text>
<text x="56" y="662" fill="{t['glow']}" font-family="Verdana,sans-serif" font-size="18" font-weight="700" letter-spacing="2">{service_label} // {short_name}</text>
<rect width="1200" height="720" fill="#000" filter="url(#gn{seed})" opacity=".26"/>
</svg>"""
