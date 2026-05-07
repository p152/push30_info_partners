import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { mainPartners, discountPartners, type MainPartner, type DiscountPartner } from '@/data/partners'
import {
  X,
  Dumbbell,
  Search,
  Tag,
  SlidersHorizontal,
  Waves,
  Sparkles,
  Music2,
  Shield,
  Gamepad2,
  Leaf,
  RotateCcw,
  Sun,
  Moon,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: PartnersPage,
})

type Tab = 'main' | 'discount'
type Partner = MainPartner | DiscountPartner

const tariffOptions = [
  { value: 'all', label: 'Все тарифы' },
  { value: 'standard', label: 'Стандарт' },
  { value: 'plus', label: 'Плюс' },
] as const

type TariffFilter = (typeof tariffOptions)[number]['value']

const serviceFilterItems = [
  { value: 'gym', label: 'Тренажер', icon: Dumbbell },
  { value: 'yoga', label: 'Йога', icon: Leaf },
  { value: 'spa', label: 'Спа', icon: Sparkles },
  { value: 'entertainment', label: 'Развлечение', icon: Gamepad2 },
  { value: 'martial', label: 'Боевые искусства', icon: Shield },
  { value: 'dance', label: 'Танцы', icon: Music2 },
  { value: 'pool', label: 'Бассейн', icon: Waves },
] as const

type ServiceFilter = (typeof serviceFilterItems)[number]['value']

const serviceLabels: Record<ServiceFilter, string> = {
  gym: 'Тренажер',
  yoga: 'Йога',
  spa: 'Спа',
  entertainment: 'Развлечение',
  martial: 'Боевые искусства',
  dance: 'Танцы',
  pool: 'Бассейн',
}

type ServiceRule = {
  value: ServiceFilter
  categories: readonly string[]
  terms: readonly string[]
}

const serviceRules: readonly ServiceRule[] = [
  {
    value: 'yoga',
    categories: ['yoga', 'pilates'],
    terms: ['йога', 'yoga', 'stretch', 'стретч', 'пилатес', 'pilates', 'gravity', 'гравити', 'здоровая спина'],
  },
  {
    value: 'gym',
    categories: ['gym', 'sport_shop', 'crossfit', 'running'],
    terms: ['тренажер', 'тренажёр', 'gym', 'кроссфит', 'crossfit', 'functional', 'fitness', 'фитнес', 'кардио', 'tabata', 'trx'],
  },
  {
    value: 'spa',
    categories: ['spa', 'dental'],
    terms: ['спа', 'spa', 'сауна', 'баня', 'хаммам', 'хамам', 'джакузи', 'массаж', 'lpg', 'космет', 'солевая', 'процедур'],
  },
  {
    value: 'entertainment',
    categories: ['bowling', 'climbing', 'golf', 'horse', 'ice', 'padel', 'pingpong', 'rafting', 'shooting', 'tennis'],
    terms: ['vr', 'картинг', 'катание', 'лед', 'конь', 'верховая', 'зиплайн', 'веревоч', 'тюбинг', 'скалодром', 'bowling', 'гольф', 'падел', 'теннис', 'пинг', 'рафтинг', 'стрельб', 'лук', 'развлеч', 'игра'],
  },
  {
    value: 'martial',
    categories: ['martial'],
    terms: ['boxing', 'бокс', 'mma', 'jiu', 'jitsu', 'джиу', 'карат', 'единобор', 'борьб', 'grappling', 'wrestling', 'боев', 'муай'],
  },
  {
    value: 'dance',
    categories: ['dance'],
    terms: ['dance', 'танц', 'зумба', 'arabic', 'латин', 'belly'],
  },
  {
    value: 'pool',
    categories: ['pool'],
    terms: ['бассейн', 'pool', 'плав', 'пляж', 'аква'],
  },
]

// ── Service-specific color palettes for generated images ─────────────────────

type ServiceTheme = { bg1: string; bg2: string; accent: string; dust: string; glow: string }

const serviceThemes: Record<ServiceFilter, ServiceTheme> = {
  gym:           { bg1: '#100504', bg2: '#2a0d07', accent: '#e04e1a', dust: '#f5c4a8', glow: '#ff7040' },
  yoga:          { bg1: '#030c07', bg2: '#08190e', accent: '#3a9e66', dust: '#aed8bc', glow: '#58c880' },
  pool:          { bg1: '#020810', bg2: '#051428', accent: '#1882cc', dust: '#9eccea', glow: '#3aaaff' },
  spa:           { bg1: '#0d0509', bg2: '#1e0912', accent: '#c84e8a', dust: '#f0b4d4', glow: '#e06aaa' },
  dance:         { bg1: '#060310', bg2: '#0d0620', accent: '#7038dc', dust: '#c0a4f0', glow: '#9858ff' },
  martial:       { bg1: '#0a0202', bg2: '#1c0404', accent: '#c02020', dust: '#eeaaaa', glow: '#e03838' },
  entertainment: { bg1: '#040510', bg2: '#080c22', accent: '#cc8c0a', dust: '#f8de96', glow: '#f2aa18' },
}

// ── Utility helpers ───────────────────────────────────────────────────────────

const imageCache = new Map<string, string>()

function getPartnerText(partner: Partner) {
  const fields = [
    partner.name,
    partner.category,
    'standard' in partner ? partner.standard : null,
    'plus' in partner ? partner.plus : null,
    'description' in partner ? partner.description : null,
  ]
  return fields.filter(Boolean).join(' ').toLowerCase()
}

function includesAny(text: string, terms: readonly string[]) {
  return terms.some(term => text.includes(term))
}

function getPartnerServices(partner: Partner) {
  const text = getPartnerText(partner)
  return serviceRules
    .filter(rule => rule.categories.includes(partner.category) || includesAny(text, rule.terms))
    .map(rule => rule.value)
}

function getPrimaryService(partner: Partner): ServiceFilter {
  return getPartnerServices(partner)[0] ?? 'gym'
}

function hashString(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ── SVG scene builders ────────────────────────────────────────────────────────

function buildScene(service: ServiceFilter, t: ServiceTheme, seed: number): string {
  // small positional variation per partner within same service
  const vx = (seed % 41) - 20
  const vy = ((seed >> 5) % 31) - 15

  switch (service) {
    case 'gym':
      return `
        <circle cx="600" cy="290" r="210" fill="${t.accent}" opacity=".07"/>
        <!-- barbell bar -->
        <rect x="100" y="256" width="1000" height="26" rx="13" fill="${t.accent}" opacity=".9"/>
        <!-- left weight plates -->
        <ellipse cx="162" cy="269" rx="20" ry="108" fill="${t.dust}" opacity=".8"/>
        <ellipse cx="162" cy="269" rx="13" ry="90" fill="${t.bg2}"/>
        <ellipse cx="162" cy="269" rx="8" ry="74" fill="${t.dust}" opacity=".52"/>
        <ellipse cx="196" cy="269" rx="20" ry="104" fill="${t.dust}" opacity=".74"/>
        <ellipse cx="196" cy="269" rx="13" ry="86" fill="${t.bg2}"/>
        <!-- right weight plates -->
        <ellipse cx="1038" cy="269" rx="20" ry="108" fill="${t.dust}" opacity=".8"/>
        <ellipse cx="1038" cy="269" rx="13" ry="90" fill="${t.bg2}"/>
        <ellipse cx="1038" cy="269" rx="8" ry="74" fill="${t.dust}" opacity=".52"/>
        <ellipse cx="1004" cy="269" rx="20" ry="104" fill="${t.dust}" opacity=".74"/>
        <ellipse cx="1004" cy="269" rx="13" ry="86" fill="${t.bg2}"/>
        <!-- collars -->
        <rect x="246" y="232" width="34" height="74" rx="6" fill="${t.glow}" opacity=".88"/>
        <rect x="920" y="232" width="34" height="74" rx="6" fill="${t.glow}" opacity=".88"/>
        <!-- weight glow -->
        <ellipse cx="162" cy="269" rx="36" ry="130" fill="${t.glow}" opacity=".1"/>
        <ellipse cx="1038" cy="269" rx="36" ry="130" fill="${t.glow}" opacity=".1"/>
        <!-- bench -->
        <rect x="${440 + vx}" y="382" width="320" height="24" rx="12" fill="${t.accent}" opacity=".44"/>
        <rect x="${468 + vx}" y="405" width="264" height="66" rx="10" fill="${t.dust}" opacity=".16"/>
        <!-- lifter figure -->
        <circle cx="${600 + vx}" cy="${318 + vy}" r="30" fill="${t.dust}" opacity=".66"/>
        <ellipse cx="${600 + vx}" cy="${378 + vy}" rx="42" ry="50" fill="${t.dust}" opacity=".54"/>
        <path d="M${574 + vx} ${350 + vy} Q${518 + vx} 298 472 264" stroke="${t.dust}" stroke-width="20" stroke-linecap="round" fill="none" opacity=".64"/>
        <path d="M${626 + vx} ${350 + vy} Q${682 + vx} 298 728 264" stroke="${t.dust}" stroke-width="20" stroke-linecap="round" fill="none" opacity=".64"/>
        <path d="M${578 + vx} ${425 + vy} L${548 + vx} ${494 + vy}" stroke="${t.dust}" stroke-width="22" stroke-linecap="round" fill="none" opacity=".48"/>
        <path d="M${622 + vx} ${425 + vy} L${652 + vx} ${494 + vy}" stroke="${t.dust}" stroke-width="22" stroke-linecap="round" fill="none" opacity=".48"/>
      `

    case 'yoga':
      return `
        <!-- radiant rings -->
        <circle cx="${600 + vx}" cy="${300 + vy}" r="240" fill="none" stroke="${t.accent}" stroke-width="1.5" opacity=".22"/>
        <circle cx="${600 + vx}" cy="${300 + vy}" r="188" fill="none" stroke="${t.glow}" stroke-width="2" opacity=".28"/>
        <circle cx="${600 + vx}" cy="${300 + vy}" r="136" fill="${t.accent}" opacity=".08"/>
        <!-- lotus petals (4 cardinal) -->
        <path d="M${600+vx} ${300+vy} Q${560+vx} ${218+vy} ${600+vx} ${158+vy} Q${640+vx} ${218+vy} ${600+vx} ${300+vy}Z" fill="${t.dust}" opacity=".3"/>
        <path d="M${600+vx} ${300+vy} Q${682+vx} ${260+vy} ${742+vx} ${300+vy} Q${682+vx} ${340+vy} ${600+vx} ${300+vy}Z" fill="${t.dust}" opacity=".3"/>
        <path d="M${600+vx} ${300+vy} Q${640+vx} ${382+vy} ${600+vx} ${442+vy} Q${560+vx} ${382+vy} ${600+vx} ${300+vy}Z" fill="${t.dust}" opacity=".3"/>
        <path d="M${600+vx} ${300+vy} Q${518+vx} ${340+vy} ${458+vx} ${300+vy} Q${518+vx} ${260+vy} ${600+vx} ${300+vy}Z" fill="${t.dust}" opacity=".3"/>
        <!-- diagonal petals -->
        <path d="M${600+vx} ${300+vy} Q${646+vx} ${220+vy} ${688+vx} ${174+vy} Q${676+vx} ${256+vy} ${600+vx} ${300+vy}Z" fill="${t.accent}" opacity=".22"/>
        <path d="M${600+vx} ${300+vy} Q${680+vx} ${352+vy} ${726+vx} ${398+vy} Q${656+vx} ${370+vy} ${600+vx} ${300+vy}Z" fill="${t.accent}" opacity=".22"/>
        <path d="M${600+vx} ${300+vy} Q${554+vx} ${382+vy} ${512+vx} ${428+vy} Q${524+vx} ${346+vy} ${600+vx} ${300+vy}Z" fill="${t.accent}" opacity=".22"/>
        <path d="M${600+vx} ${300+vy} Q${520+vx} ${248+vy} ${476+vx} ${202+vy} Q${548+vx} ${246+vy} ${600+vx} ${300+vy}Z" fill="${t.accent}" opacity=".22"/>
        <!-- center -->
        <circle cx="${600+vx}" cy="${300+vy}" r="52" fill="${t.accent}" opacity=".28"/>
        <circle cx="${600+vx}" cy="${300+vy}" r="28" fill="${t.glow}" opacity=".36"/>
        <!-- person in lotus: legs -->
        <ellipse cx="${600+vx}" cy="${432+vy}" rx="88" ry="32" fill="${t.dust}" opacity=".7"/>
        <path d="M${516+vx} ${428+vy} Q${475+vx} ${386+vy} ${506+vx} ${354+vy}" stroke="${t.dust}" stroke-width="28" stroke-linecap="round" fill="none" opacity=".6"/>
        <path d="M${684+vx} ${428+vy} Q${725+vx} ${386+vy} ${694+vx} ${354+vy}" stroke="${t.dust}" stroke-width="28" stroke-linecap="round" fill="none" opacity=".6"/>
        <!-- torso -->
        <path d="M${600+vx} ${370+vy} L${600+vx} ${250+vy}" stroke="${t.dust}" stroke-width="30" stroke-linecap="round" fill="none" opacity=".72"/>
        <!-- arms (mudra) -->
        <path d="M${578+vx} ${338+vy} Q${508+vx} ${336+vy} ${476+vx} ${354+vy}" stroke="${t.dust}" stroke-width="16" stroke-linecap="round" fill="none" opacity=".72"/>
        <path d="M${622+vx} ${338+vy} Q${692+vx} ${336+vy} ${724+vx} ${354+vy}" stroke="${t.dust}" stroke-width="16" stroke-linecap="round" fill="none" opacity=".72"/>
        <!-- head + halo -->
        <circle cx="${600+vx}" cy="${220+vy}" r="34" fill="${t.dust}" opacity=".78"/>
        <circle cx="${600+vx}" cy="${220+vy}" r="50" fill="none" stroke="${t.glow}" stroke-width="3" opacity=".5"/>
      `

    case 'pool':
      return `
        <!-- lane ropes (dashed lines) -->
        <line x1="60" y1="${175+vy}" x2="1140" y2="${175+vy}" stroke="${t.dust}" stroke-width="6" stroke-dasharray="32 22" opacity=".44"/>
        <line x1="60" y1="${235+vy}" x2="1140" y2="${235+vy}" stroke="${t.accent}" stroke-width="5" stroke-dasharray="28 20" opacity=".5"/>
        <line x1="60" y1="${295+vy}" x2="1140" y2="${295+vy}" stroke="${t.dust}" stroke-width="6" stroke-dasharray="32 22" opacity=".44"/>
        <line x1="60" y1="${355+vy}" x2="1140" y2="${355+vy}" stroke="${t.accent}" stroke-width="5" stroke-dasharray="28 20" opacity=".5"/>
        <line x1="60" y1="${415+vy}" x2="1140" y2="${415+vy}" stroke="${t.dust}" stroke-width="6" stroke-dasharray="32 22" opacity=".44"/>
        <!-- water ripples -->
        <path d="M0 ${488+vy} Q200 ${468+vy} 400 ${488+vy} Q600 ${508+vy} 800 ${488+vy} Q1000 ${468+vy} 1200 ${488+vy}" stroke="${t.glow}" stroke-width="3" fill="none" opacity=".38"/>
        <path d="M0 ${508+vy} Q300 ${494+vy} 600 ${508+vy} Q900 ${522+vy} 1200 ${508+vy}" stroke="${t.glow}" stroke-width="2" fill="none" opacity=".28"/>
        <!-- pool tiles -->
        <rect x="0" y="${472+vy}" width="1200" height="70" fill="${t.accent}" opacity=".1"/>
        <!-- swimmer: head -->
        <ellipse cx="${820+vx}" cy="${254+vy}" rx="28" ry="24" fill="${t.dust}" opacity=".82" transform="rotate(-12 ${820+vx} ${254+vy})"/>
        <!-- body -->
        <path d="M${820+vx} ${262+vy} Q${700+vx} ${274+vy} ${580+vx} ${267+vy} Q${480+vx} ${260+vy} ${400+vx} ${270+vy}" stroke="${t.dust}" stroke-width="30" stroke-linecap="round" fill="none" opacity=".72"/>
        <!-- lead arm (forward) -->
        <path d="M${400+vx} ${270+vy} Q${310+vx} ${252+vy} ${245+vx} ${245+vy}" stroke="${t.dust}" stroke-width="19" stroke-linecap="round" fill="none" opacity=".65"/>
        <!-- recovery arm (above water) -->
        <path d="M${820+vx} ${262+vy} Q${872+vx} ${196+vy} ${924+vx} ${216+vy} Q${970+vx} ${238+vy} ${962+vx} ${268+vy}" stroke="${t.glow}" stroke-width="17" stroke-linecap="round" fill="none" opacity=".6"/>
        <!-- kick legs -->
        <path d="M${580+vx} ${267+vy} Q${598+vx} ${296+vy} ${568+vx} ${316+vy}" stroke="${t.dust}" stroke-width="17" stroke-linecap="round" fill="none" opacity=".54"/>
        <path d="M${580+vx} ${267+vy} Q${560+vx} ${238+vy} ${542+vx} ${218+vy}" stroke="${t.dust}" stroke-width="15" stroke-linecap="round" fill="none" opacity=".5"/>
        <!-- splash -->
        <circle cx="${962+vx}" cy="${268+vy}" r="20" fill="${t.glow}" opacity=".18"/>
        <circle cx="${935+vx}" cy="${260+vy}" r="11" fill="${t.glow}" opacity=".28"/>
        <circle cx="${955+vx}" cy="${282+vy}" r="8" fill="${t.dust}" opacity=".22"/>
      `

    case 'spa':
      return `
        <circle cx="${600+vx}" cy="${400+vy}" r="250" fill="${t.accent}" opacity=".09"/>
        <!-- lotus flower (left) -->
        <path d="M${378+vx} ${355+vy} Q${356+vx} ${292+vy} ${378+vx} ${242+vy} Q${400+vx} ${292+vy} ${378+vx} ${355+vy}Z" fill="${t.dust}" opacity=".38"/>
        <path d="M${378+vx} ${355+vy} Q${440+vx} ${334+vy} ${482+vx} ${355+vy} Q${440+vx} ${376+vy} ${378+vx} ${355+vy}Z" fill="${t.dust}" opacity=".38"/>
        <path d="M${378+vx} ${355+vy} Q${358+vx} ${416+vy} ${378+vx} ${466+vy} Q${400+vx} ${416+vy} ${378+vx} ${355+vy}Z" fill="${t.dust}" opacity=".32"/>
        <path d="M${378+vx} ${355+vy} Q${318+vx} ${334+vy} ${276+vx} ${355+vy} Q${318+vx} ${376+vy} ${378+vx} ${355+vy}Z" fill="${t.dust}" opacity=".32"/>
        <path d="M${378+vx} ${355+vy} Q${415+vx} ${278+vy} ${446+vx} ${232+vy} Q${424+vx} ${300+vy} ${378+vx} ${355+vy}Z" fill="${t.accent}" opacity=".28"/>
        <path d="M${378+vx} ${355+vy} Q${324+vx} ${290+vy} ${294+vx} ${244+vy} Q${340+vx} ${306+vy} ${378+vx} ${355+vy}Z" fill="${t.accent}" opacity=".28"/>
        <circle cx="${378+vx}" cy="${355+vy}" r="26" fill="${t.accent}" opacity=".62"/>
        <circle cx="${378+vx}" cy="${355+vy}" r="14" fill="${t.glow}" opacity=".7"/>
        <!-- candle body -->
        <rect x="${638+vx}" y="${386+vy}" width="64" height="106" rx="6" fill="${t.dust}" opacity=".52"/>
        <rect x="${630+vx}" y="${370+vy}" width="80" height="22" rx="5" fill="${t.accent}" opacity=".62"/>
        <!-- wick -->
        <line x1="${670+vx}" y1="${370+vy}" x2="${670+vx}" y2="${352+vy}" stroke="${t.dust}" stroke-width="3" opacity=".55"/>
        <!-- flame outer -->
        <path d="M${670+vx} ${351+vy} Q${646+vx} ${316+vy} ${658+vx} ${283+vy} Q${676+vx} ${275+vy} ${688+vx} ${303+vy} Q${700+vx} ${332+vy} ${670+vx} ${351+vy}Z" fill="${t.accent}" opacity=".88"/>
        <!-- flame inner -->
        <path d="M${670+vx} ${347+vy} Q${658+vx} ${322+vy} ${666+vx} ${296+vy} Q${674+vx} ${290+vy} ${680+vx} ${310+vy} Q${686+vx} ${330+vy} ${670+vx} ${347+vy}Z" fill="${t.glow}" opacity=".88"/>
        <!-- steam wisps -->
        <path d="M${653+vx} ${278+vy} Q${632+vx} ${244+vy} ${653+vx} ${208+vy} Q${674+vx} ${172+vy} ${653+vx} ${138+vy}" stroke="${t.dust}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".38"/>
        <path d="M${670+vx} ${272+vy} Q${690+vx} ${232+vy} ${670+vx} ${192+vy} Q${650+vx} ${152+vy} ${670+vx} ${112+vy}" stroke="${t.glow}" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".44"/>
        <path d="M${688+vx} ${276+vy} Q${708+vx} ${240+vy} ${688+vx} ${204+vy} Q${668+vx} ${168+vy} ${688+vx} ${132+vy}" stroke="${t.dust}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".34"/>
        <!-- decorative leaf (right) -->
        <path d="M${862+vx} ${462+vy} Q${942+vx} ${358+vy} ${900+vx} ${268+vy} Q${798+vx} ${330+vy} ${862+vx} ${462+vy}Z" fill="${t.dust}" opacity=".33"/>
        <path d="M${862+vx} ${462+vy} L${900+vx} ${268+vy}" stroke="${t.glow}" stroke-width="2.5" fill="none" opacity=".48"/>
        <path d="M${870+vx} ${420+vy} Q${910+vx} ${376+vy} ${894+vx} ${326+vy}" stroke="${t.glow}" stroke-width="2" fill="none" opacity=".38"/>
        <!-- ambient dots -->
        <circle cx="${220+vx}" cy="${178+vy}" r="8" fill="${t.glow}" opacity=".32"/>
        <circle cx="${256+vx}" cy="${218+vy}" r="5" fill="${t.dust}" opacity=".28"/>
        <circle cx="${952+vx}" cy="${198+vy}" r="10" fill="${t.accent}" opacity=".24"/>
        <circle cx="${980+vx}" cy="${158+vy}" r="6" fill="${t.glow}" opacity=".28"/>
      `

    case 'dance':
      return `
        <!-- dance floor reflection -->
        <ellipse cx="${600+vx}" cy="${518+vy}" rx="340" ry="38" fill="${t.accent}" opacity=".12"/>
        <!-- figure 1 (left) -->
        <circle cx="${448+vx}" cy="${196+vy}" r="30" fill="${t.dust}" opacity=".78"/>
        <path d="M${448+vx} ${226+vy} Q${442+vx} ${326+vy} ${448+vx} ${378+vy}" stroke="${t.dust}" stroke-width="26" stroke-linecap="round" fill="none" opacity=".7"/>
        <path d="M${448+vx} ${272+vy} Q${508+vx} ${236+vy} ${558+vx} ${206+vy}" stroke="${t.dust}" stroke-width="19" stroke-linecap="round" fill="none" opacity=".72"/>
        <path d="M${448+vx} ${278+vy} Q${378+vx} ${246+vy} ${328+vx} ${236+vy}" stroke="${t.dust}" stroke-width="19" stroke-linecap="round" fill="none" opacity=".65"/>
        <path d="M${448+vx} ${378+vy} Q${418+vx} ${442+vy} ${390+vx} ${490+vy}" stroke="${t.dust}" stroke-width="24" stroke-linecap="round" fill="none" opacity=".7"/>
        <path d="M${448+vx} ${378+vy} Q${494+vx} ${434+vy} ${528+vx} ${458+vy}" stroke="${t.dust}" stroke-width="22" stroke-linecap="round" fill="none" opacity=".64"/>
        <!-- joined hands -->
        <path d="M${558+vx} ${206+vy} Q${600+vx} ${194+vy} ${642+vx} ${208+vy}" stroke="${t.accent}" stroke-width="10" stroke-linecap="round" fill="none" opacity=".68"/>
        <!-- figure 2 (right) -->
        <circle cx="${752+vx}" cy="${198+vy}" r="30" fill="${t.glow}" opacity=".78"/>
        <path d="M${752+vx} ${228+vy} Q${758+vx} ${328+vy} ${752+vx} ${374+vy}" stroke="${t.glow}" stroke-width="26" stroke-linecap="round" fill="none" opacity=".7"/>
        <path d="M${752+vx} ${274+vy} Q${690+vx} ${238+vy} ${642+vx} ${208+vy}" stroke="${t.glow}" stroke-width="19" stroke-linecap="round" fill="none" opacity=".72"/>
        <path d="M${752+vx} ${280+vy} Q${820+vx} ${248+vy} ${872+vx} ${244+vy}" stroke="${t.glow}" stroke-width="19" stroke-linecap="round" fill="none" opacity=".65"/>
        <path d="M${752+vx} ${374+vy} Q${792+vx} ${438+vy} ${822+vx} ${482+vy}" stroke="${t.glow}" stroke-width="24" stroke-linecap="round" fill="none" opacity=".7"/>
        <path d="M${752+vx} ${374+vy} Q${706+vx} ${432+vy} ${676+vx} ${474+vy}" stroke="${t.glow}" stroke-width="22" stroke-linecap="round" fill="none" opacity=".64"/>
        <!-- musical notes -->
        <text x="${275+vx}" y="${346+vy}" fill="${t.dust}" font-size="68" opacity=".34" font-family="serif">♪</text>
        <text x="${876+vx}" y="${288+vy}" fill="${t.glow}" font-size="54" opacity=".34" font-family="serif">♫</text>
        <text x="${540+vx}" y="${158+vy}" fill="${t.accent}" font-size="42" opacity=".42" font-family="serif">♩</text>
        <!-- sparkles -->
        <circle cx="${298+vx}" cy="${178+vy}" r="6" fill="${t.accent}" opacity=".5"/>
        <circle cx="${326+vx}" cy="${200+vy}" r="4" fill="${t.glow}" opacity=".44"/>
        <circle cx="${922+vx}" cy="${218+vy}" r="7" fill="${t.dust}" opacity=".44"/>
        <circle cx="${948+vx}" cy="${198+vy}" r="4" fill="${t.accent}" opacity=".4"/>
        <circle cx="${600+vx}" cy="${130+vy}" r="5" fill="${t.glow}" opacity=".5"/>
      `

    case 'martial':
      return `
        <!-- shield emblem -->
        <path d="M${600+vx} ${118+vy} L${820+vx} ${200+vy} L${820+vx} ${380+vy} C${820+vx} ${480+vy} ${600+vx} ${542+vy} ${600+vx} ${542+vy} C${600+vx} ${542+vy} ${380+vx} ${480+vy} ${380+vx} ${380+vy} L${380+vx} ${200+vy} Z" fill="${t.accent}" opacity=".18"/>
        <path d="M${600+vx} ${144+vy} L${795+vx} ${220+vy} L${795+vx} ${375+vy} C${795+vx} ${466+vy} ${600+vx} ${518+vy} ${600+vx} ${518+vy} C${600+vx} ${518+vy} ${405+vx} ${466+vy} ${405+vx} ${375+vy} L${405+vx} ${220+vy} Z" fill="none" stroke="${t.glow}" stroke-width="4" opacity=".44"/>
        <!-- fighter: head -->
        <circle cx="${600+vx}" cy="${224+vy}" r="32" fill="${t.dust}" opacity=".76"/>
        <!-- torso -->
        <path d="M${600+vx} ${256+vy} L${600+vx} ${390+vy}" stroke="${t.dust}" stroke-width="34" stroke-linecap="round" fill="none" opacity=".7"/>
        <!-- guard fist left -->
        <path d="M${575+vx} ${300+vy} Q${510+vx} ${274+vy} ${458+vx} ${244+vy}" stroke="${t.dust}" stroke-width="23" stroke-linecap="round" fill="none" opacity=".72"/>
        <circle cx="${456+vx}" cy="${242+vy}" r="18" fill="${t.glow}" opacity=".64"/>
        <!-- chambered fist right -->
        <path d="M${625+vx} ${306+vy} Q${700+vx} ${278+vy} ${752+vx} ${258+vy}" stroke="${t.glow}" stroke-width="23" stroke-linecap="round" fill="none" opacity=".72"/>
        <circle cx="${754+vx}" cy="${256+vy}" r="18" fill="${t.accent}" opacity=".7"/>
        <!-- legs in stance -->
        <path d="M${578+vx} ${390+vy} Q${536+vx} ${454+vy} ${488+vx} ${490+vy}" stroke="${t.dust}" stroke-width="28" stroke-linecap="round" fill="none" opacity=".7"/>
        <path d="M${622+vx} ${390+vy} Q${668+vx} ${446+vy} ${716+vx} ${482+vy}" stroke="${t.dust}" stroke-width="28" stroke-linecap="round" fill="none" opacity=".7"/>
        <!-- speed lines to fist -->
        <line x1="${318+vx}" y1="${180+vy}" x2="${452+vx}" y2="${248+vy}" stroke="${t.glow}" stroke-width="2.5" stroke-dasharray="16 12" opacity=".4"/>
        <line x1="${308+vx}" y1="${208+vy}" x2="${447+vx}" y2="${262+vy}" stroke="${t.dust}" stroke-width="2" stroke-dasharray="12 16" opacity=".3"/>
        <line x1="${298+vx}" y1="${236+vy}" x2="${442+vx}" y2="${278+vy}" stroke="${t.glow}" stroke-width="1.5" stroke-dasharray="10 18" opacity=".24"/>
        <!-- impact circles -->
        <circle cx="${456+vx}" cy="${242+vy}" r="34" fill="none" stroke="${t.glow}" stroke-width="3" opacity=".38" stroke-dasharray="8 6"/>
        <circle cx="${456+vx}" cy="${242+vy}" r="54" fill="none" stroke="${t.accent}" stroke-width="2" opacity=".22" stroke-dasharray="6 10"/>
      `

    case 'entertainment':
      return `
        <!-- glow atmosphere -->
        <circle cx="${600+vx}" cy="${310+vy}" r="220" fill="${t.accent}" opacity=".1"/>
        <!-- controller body -->
        <rect x="${376+vx}" y="${240+vy}" width="448" height="248" rx="124" fill="${t.dust}" opacity=".55"/>
        <!-- left grip -->
        <rect x="${394+vx}" y="${444+vy}" width="122" height="88" rx="40" fill="${t.dust}" opacity=".5"/>
        <!-- right grip -->
        <rect x="${684+vx}" y="${444+vy}" width="122" height="88" rx="40" fill="${t.dust}" opacity=".5"/>
        <!-- d-pad (left) -->
        <circle cx="${448+vx}" cy="${364+vy}" r="30" fill="${t.bg2}" opacity=".8"/>
        <path d="M${433+vx} ${364+vy} H${463+vx} M${448+vx} ${349+vy} V${379+vy}" stroke="${t.accent}" stroke-width="8" stroke-linecap="round"/>
        <!-- face buttons (right) -->
        <circle cx="${752+vx}" cy="${344+vy}" r="17" fill="${t.glow}" opacity=".76"/>
        <circle cx="${792+vx}" cy="${374+vy}" r="17" fill="${t.accent}" opacity=".72"/>
        <circle cx="${752+vx}" cy="${404+vy}" r="17" fill="${t.dust}" opacity=".66"/>
        <circle cx="${712+vx}" cy="${374+vy}" r="17" fill="${t.glow}" opacity=".7"/>
        <!-- center buttons -->
        <rect x="${562+vx}" y="${350+vy}" width="34" height="17" rx="8.5" fill="${t.bg2}" opacity=".7"/>
        <rect x="${604+vx}" y="${350+vy}" width="34" height="17" rx="8.5" fill="${t.bg2}" opacity=".7"/>
        <!-- analog sticks -->
        <circle cx="${490+vx}" cy="${424+vy}" r="26" fill="${t.bg2}" opacity=".76"/>
        <circle cx="${490+vx}" cy="${424+vy}" r="16" fill="${t.accent}" opacity=".58"/>
        <circle cx="${710+vx}" cy="${424+vy}" r="26" fill="${t.bg2}" opacity=".76"/>
        <circle cx="${710+vx}" cy="${424+vy}" r="16" fill="${t.glow}" opacity=".58"/>
        <!-- floating stars -->
        <circle cx="${256+vx}" cy="${176+vy}" r="12" fill="${t.glow}" opacity=".52"/>
        <circle cx="${944+vx}" cy="${148+vy}" r="16" fill="${t.accent}" opacity=".48"/>
        <circle cx="${198+vx}" cy="${418+vy}" r="9" fill="${t.dust}" opacity=".44"/>
        <circle cx="${1002+vx}" cy="${380+vy}" r="14" fill="${t.glow}" opacity=".48"/>
        <circle cx="${348+vx}" cy="${138+vy}" r="7" fill="${t.accent}" opacity=".52"/>
        <circle cx="${852+vx}" cy="${142+vy}" r="10" fill="${t.dust}" opacity=".48"/>
        <!-- lightning bolts -->
        <path d="M${298+vx} ${318+vy} L${328+vx} ${292+vy} L${313+vx} ${308+vy} L${344+vx} ${282+vy}" stroke="${t.glow}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/>
        <path d="M${902+vx} ${318+vy} L${872+vx} ${292+vy} L${887+vx} ${308+vy} L${856+vx} ${282+vy}" stroke="${t.accent}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/>
      `
  }
}

// ── Image generation ──────────────────────────────────────────────────────────

function getGeneratedPartnerImage(partner: Partner): string {
  const cacheKey = `v3-${'description' in partner ? 'D' : 'M'}-${partner.id}`
  const cached = imageCache.get(cacheKey)
  if (cached) return cached

  const seed = hashString(partner.name + cacheKey)
  const service = getPrimaryService(partner)
  const t = serviceThemes[service]
  const badge = String(partner.id).padStart(3, '0')
  const shortName = escapeXml(partner.name.slice(0, 24))
  const serviceLabel = escapeXml(serviceLabels[service].toUpperCase())
  const scene = buildScene(service, t, seed)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="${shortName}">
<defs>
<linearGradient id="bg${seed}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${t.bg1}"/>
<stop offset="0.55" stop-color="${t.bg2}"/>
<stop offset="1" stop-color="${t.bg1}"/>
</linearGradient>
<linearGradient id="fg${seed}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0.58" stop-color="${t.bg1}" stop-opacity="0"/>
<stop offset="1" stop-color="${t.bg1}" stop-opacity="0.92"/>
</linearGradient>
<pattern id="gr${seed}" width="48" height="48" patternUnits="userSpaceOnUse">
<path d="M0 0H80M0 0V80" stroke="${t.dust}" stroke-opacity=".06" stroke-width="1.5"/>
</pattern>
<filter id="gn${seed}">
<feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" stitchTiles="stitch"/>
<feColorMatrix type="saturate" values="0"/>
<feComponentTransfer><feFuncA type="table" tableValues="0 .2"/></feComponentTransfer>
</filter>
</defs>
<rect width="1200" height="720" fill="url(#bg${seed})"/>
<rect width="1200" height="720" fill="url(#gr${seed})"/>
${scene}
<rect width="1200" height="720" fill="url(#fg${seed})"/>
<text x="56" y="620" fill="${t.dust}" font-family="Georgia,serif" font-size="26" font-weight="700" letter-spacing="2">PUSH30-${badge}</text>
<text x="56" y="662" fill="${t.glow}" font-family="Verdana,sans-serif" font-size="18" font-weight="700" letter-spacing="2">${serviceLabel} // ${shortName}</text>
<rect width="1200" height="720" fill="#000" filter="url(#gn${seed})" opacity=".26"/>
</svg>`

  const image = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  imageCache.set(cacheKey, image)
  return image
}

// ── Filter helpers ────────────────────────────────────────────────────────────

function toggleServiceFilter(filters: ServiceFilter[], value: ServiceFilter) {
  return filters.includes(value)
    ? filters.filter(f => f !== value)
    : [...filters, value]
}

function matchesServiceFilters(partner: Partner, filters: ServiceFilter[]) {
  if (filters.length === 0) return true
  const partnerServices = getPartnerServices(partner)
  return filters.some(f => partnerServices.includes(f))
}

// ── Modals ────────────────────────────────────────────────────────────────────

function MainPartnerModal({ partner, onClose }: { partner: MainPartner; onClose: () => void }) {
  const services = getPartnerServices(partner)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080a07]/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-[var(--p-mod-bd)] bg-[var(--p-mod-bg)] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <img src={getGeneratedPartnerImage(partner)} alt={partner.name} className="h-52 w-full rounded-t-lg object-cover" />
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full border border-[var(--p-mod-cl-bd)] bg-[var(--p-mod-cl-bg)] p-1.5 text-[var(--p-mod-cl-tx)] shadow transition hover:bg-white"
          aria-label="Закрыть"
        >
          <X size={18} />
        </button>
        <div className="p-6">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {services.map(service => (
              <span key={service} className="rounded-full border border-[var(--p-svc-md-bd)] bg-[var(--p-svc-md-bg)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--p-svc-md-tx)]">
                {serviceLabels[service]}
              </span>
            ))}
          </div>
          <h2 className="mb-4 text-2xl font-black leading-tight text-[var(--p-mod-tx)]">{partner.name}</h2>
          {partner.standard && (
            <div className="mb-5 rounded-lg border border-[var(--p-mod-std-bd)] bg-[var(--p-mod-std-bg)] p-4">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#2e4c35] px-3 py-1 text-xs font-bold text-[#dff0b0]">
                <Dumbbell size={12} /> Стандарт
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--p-mod-tx)]">{partner.standard}</p>
            </div>
          )}
          {partner.plus && (
            <div className="rounded-lg border border-[var(--p-mod-pls-bd)] bg-[var(--p-mod-pls-bg)] p-4">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#743f22] px-3 py-1 text-xs font-bold text-[#ffd891]">
                <Dumbbell size={12} /> Плюс
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--p-mod-tx)]">{partner.plus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DiscountPartnerModal({ partner, onClose }: { partner: DiscountPartner; onClose: () => void }) {
  const services = getPartnerServices(partner)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080a07]/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-[var(--p-mod-bd)] bg-[var(--p-mod-bg)] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <img src={getGeneratedPartnerImage(partner)} alt={partner.name} className="h-52 w-full rounded-t-lg object-cover" />
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full border border-[var(--p-mod-cl-bd)] bg-[var(--p-mod-cl-bg)] p-1.5 text-[var(--p-mod-cl-tx)] shadow transition hover:bg-white"
          aria-label="Закрыть"
        >
          <X size={18} />
        </button>
        <div className="p-6">
          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#743f22] px-3 py-1 text-xs font-bold text-[#ffd891]">
              <Tag size={12} /> Дискаунт-партнёр
            </span>
            {services.map(service => (
              <span key={service} className="rounded-full border border-[var(--p-svc-md-bd)] bg-[var(--p-svc-md-bg)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--p-svc-md-tx)]">
                {serviceLabels[service]}
              </span>
            ))}
          </div>
          <h2 className="mb-4 text-2xl font-black leading-tight text-[var(--p-mod-tx)]">{partner.name}</h2>
          {partner.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--p-mod-tx)]">{partner.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function MainPartnerCard({ partner, onClick }: { partner: MainPartner; onClick: () => void }) {
  const hasBoth = partner.standard && partner.plus
  const services = getPartnerServices(partner).slice(0, 3)

  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-lg border border-[var(--p-card-bd)] bg-[var(--p-card-bg)] text-left shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition duration-200 hover:-translate-y-1 hover:border-[var(--p-card-hv-bd)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-logo-bd)]"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={getGeneratedPartnerImage(partner)}
          alt={partner.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a07]/70 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 flex flex-wrap gap-1.5">
          {partner.standard && (
            <span className="rounded-full bg-[#2e4c35] px-2 py-0.5 text-[10px] font-bold text-[#dff0b0]">
              Стандарт
            </span>
          )}
          {partner.plus && (
            <span className="rounded-full bg-[#743f22] px-2 py-0.5 text-[10px] font-bold text-[#ffd891]">
              Плюс
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-black leading-tight text-[#202316]">{partner.name}</h3>
        <p className="mt-1 text-xs font-semibold text-[#676044]">
          {hasBoth ? 'Стандарт и Плюс' : partner.standard ? 'Только Стандарт' : 'Только Плюс'}
        </p>
        {services.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {services.map(service => (
              <span key={service} className="rounded border border-[#b5a16c] bg-[#fff4d5] px-1.5 py-0.5 text-[10px] font-bold text-[#4b442b]">
                {serviceLabels[service]}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

function DiscountPartnerCard({ partner, onClick }: { partner: DiscountPartner; onClick: () => void }) {
  const services = getPartnerServices(partner).slice(0, 3)

  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-lg border border-[var(--p-card-bd)] bg-[var(--p-card-bg)] text-left shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition duration-200 hover:-translate-y-1 hover:border-[var(--p-card-hv-bd)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-logo-bd)]"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={getGeneratedPartnerImage(partner)}
          alt={partner.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a07]/70 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3">
          <span className="rounded-full bg-[#743f22] px-2 py-0.5 text-[10px] font-bold text-[#ffd891]">
            Скидки
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-black leading-tight text-[#202316]">{partner.name}</h3>
        {partner.description && (
          <p className="mt-1 line-clamp-2 text-xs text-[#676044]">{partner.description}</p>
        )}
        {services.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {services.map(service => (
              <span key={service} className="rounded border border-[#b5a16c] bg-[#fff4d5] px-1.5 py-0.5 text-[10px] font-bold text-[#4b442b]">
                {serviceLabels[service]}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function PartnersPage() {
  const [tab, setTab] = useState<Tab>('main')
  const [search, setSearch] = useState('')
  const [tariffFilter, setTariffFilter] = useState<TariffFilter>('all')
  const [serviceFilters, setServiceFilters] = useState<ServiceFilter[]>([])
  const [selectedMain, setSelectedMain] = useState<MainPartner | null>(null)
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountPartner | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('push30-theme')
    if (stored === 'dark') setIsDark(true)
  }, [])

  function toggleTheme() {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('push30-theme', next ? 'dark' : 'light')
      return next
    })
  }

  const normalizedSearch = search.toLowerCase().trim()

  const filteredMain = useMemo(() => {
    return mainPartners.filter(partner => {
      const matchesSearch = getPartnerText(partner).includes(normalizedSearch)
      const matchesTariff =
        tariffFilter === 'all' ||
        (tariffFilter === 'standard' && Boolean(partner.standard)) ||
        (tariffFilter === 'plus' && Boolean(partner.plus))
      return matchesSearch && matchesTariff && matchesServiceFilters(partner, serviceFilters)
    })
  }, [normalizedSearch, tariffFilter, serviceFilters])

  const filteredDiscount = useMemo(() => {
    return discountPartners.filter(partner => {
      const matchesSearch = getPartnerText(partner).includes(normalizedSearch)
      return matchesSearch && matchesServiceFilters(partner, serviceFilters)
    })
  }, [normalizedSearch, serviceFilters])

  const resultCount = tab === 'main' ? filteredMain.length : filteredDiscount.length
  const activeFiltersCount = serviceFilters.length + (tab === 'main' && tariffFilter !== 'all' ? 1 : 0)

  function resetFilters() {
    setSearch('')
    setTariffFilter('all')
    setServiceFilters([])
  }

  return (
    <div className={`min-h-screen bg-[var(--p-bg)] text-[var(--p-txt-1)] transition-colors duration-200${isDark ? ' dark' : ''}`}>
      <header className="sticky top-0 z-40 border-b border-[var(--p-hd-bd)] bg-[var(--p-hd-bg)]/95 shadow-[0_18px_42px_rgba(0,0,0,0.12)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--p-logo-bd)] bg-[var(--p-logo-bg)] text-[var(--p-logo-ic)] shadow-inner">
                <Dumbbell size={21} />
              </div>
              <div>
                <h1 className="text-xl font-black leading-tight tracking-wide text-[var(--p-logo-t1)]">Push30</h1>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--p-logo-t2)]">Каталог партнёров</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 lg:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--p-txt-3)]" />
                <input
                  type="text"
                  placeholder="Поиск партнёра или услуги..."
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  className="w-full rounded-lg border border-[var(--p-in-bd)] bg-[var(--p-in-bg)] py-2.5 pl-9 pr-4 text-sm font-medium text-[var(--p-in-tx)] placeholder:text-[var(--p-in-pl)] transition focus:border-[var(--p-in-fc)] focus:outline-none focus:ring-2 focus:ring-[var(--p-in-fc)]/30"
                />
              </div>
              <button
                onClick={toggleTheme}
                title={isDark ? 'Светлая тема' : 'Тёмная тема'}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--p-btn-bd)] bg-[var(--p-in-bg)] text-[var(--p-txt-2)] transition hover:bg-[var(--p-btn-hv)] hover:text-[var(--p-txt-1)]"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTab('main')}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  tab === 'main'
                    ? 'bg-[var(--p-logo-bd)] text-[#16180f]'
                    : 'border border-[var(--p-btn-bd)] text-[var(--p-btn-tx)] hover:bg-[var(--p-btn-hv)]'
                }`}
              >
                Залы ({mainPartners.length})
              </button>
              <button
                onClick={() => setTab('discount')}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  tab === 'discount'
                    ? 'bg-[#b76034] text-[#fff4d5]'
                    : 'border border-[var(--p-btn-bd)] text-[var(--p-btn-tx)] hover:bg-[var(--p-btn-hv)]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Tag size={13} /> Дискаунт ({discountPartners.length})
                </span>
              </button>
              <div className="ml-0 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--p-txt-2)] sm:ml-2">
                <SlidersHorizontal size={14} />
                Найдено: {resultCount}
              </div>
            </div>

            {tab === 'main' && (
              <div className="flex flex-wrap gap-2">
                {tariffOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setTariffFilter(option.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      tariffFilter === option.value
                        ? 'bg-[#2e4c35] text-[#dff0b0]'
                        : 'border border-[var(--p-btn-bd)] text-[var(--p-btn-tx)] hover:bg-[var(--p-btn-hv)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {serviceFilterItems.map(item => {
                const Icon = item.icon
                const isActive = serviceFilters.includes(item.value)

                return (
                  <button
                    key={item.value}
                    onClick={() => setServiceFilters(filters => toggleServiceFilter(filters, item.value))}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#743f22] text-[#ffd891]'
                        : 'border border-[var(--p-btn-bd)] text-[var(--p-btn-tx)] hover:bg-[var(--p-btn-hv)]'
                    }`}
                  >
                    <Icon size={13} />
                    {item.label}
                  </button>
                )
              })}
              {(activeFiltersCount > 0 || search) && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--p-btn-bd)] px-3 py-1.5 text-xs font-bold text-[var(--p-txt-1)] transition hover:bg-[var(--p-btn-hv)]"
                >
                  <RotateCcw size={13} />
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {tab === 'main' ? (
          filteredMain.length === 0 ? (
            <div className="rounded-lg border border-[var(--p-emp-bd)] bg-[var(--p-emp-bg)] px-6 py-16 text-center text-[var(--p-emp-tx)]">
              Ничего не найдено
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredMain.map(partner => (
                <MainPartnerCard key={partner.id} partner={partner} onClick={() => setSelectedMain(partner)} />
              ))}
            </div>
          )
        ) : filteredDiscount.length === 0 ? (
          <div className="rounded-lg border border-[var(--p-emp-bd)] bg-[var(--p-emp-bg)] px-6 py-16 text-center text-[var(--p-emp-tx)]">
            Ничего не найдено
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredDiscount.map(partner => (
              <DiscountPartnerCard key={partner.id} partner={partner} onClick={() => setSelectedDiscount(partner)} />
            ))}
          </div>
        )}
      </main>

      {selectedMain && (
        <MainPartnerModal partner={selectedMain} onClose={() => setSelectedMain(null)} />
      )}
      {selectedDiscount && (
        <DiscountPartnerModal partner={selectedDiscount} onClose={() => setSelectedDiscount(null)} />
      )}
    </div>
  )
}
