import { useMemo, useState } from 'react'
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

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
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

function getServiceMotif(service: ServiceFilter, stroke: string, fill: string) {
  const line = `stroke="${stroke}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"`
  const thinLine = `stroke="${stroke}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"`

  switch (service) {
    case 'pool':
      return `
        <path ${line} d="M168 284c62-48 122 48 184 0s122 48 184 0" />
        <path ${thinLine} opacity=".55" d="M156 348c64-42 126 42 190 0s126 42 190 0" />
        <circle cx="464" cy="178" r="54" fill="${fill}" opacity=".72" />
      `
    case 'yoga':
      return `
        <ellipse cx="350" cy="358" rx="188" ry="30" fill="${fill}" opacity=".62" />
        <path ${line} d="M350 146v116m0 0-98 86m98-86 104 88" />
        <circle cx="350" cy="100" r="42" fill="${fill}" />
      `
    case 'spa':
      return `
        <path ${line} d="M284 362c92-168 214-190 296-128-32 128-138 180-296 128Z" />
        <path ${thinLine} opacity=".6" d="M354 312c28-78 66-134 132-180" />
        <path ${thinLine} d="M236 166c-28 46 42 64 16 118m118-150c-30 48 42 66 14 120" />
      `
    case 'entertainment':
      return `
        <rect x="206" y="146" width="322" height="246" rx="22" fill="${fill}" opacity=".72" />
        <path ${line} d="M274 210h124m-62-62v124m122 48 2 .01m-72 0 2 .01" />
        <path ${thinLine} d="m492 92-64 112h78l-94 132" />
      `
    case 'martial':
      return `
        <path d="M354 86 534 156v126c0 108-72 184-180 236-108-52-180-128-180-236V156Z" fill="${fill}" opacity=".66" />
        <path ${line} d="M262 310h184m-138-96 106 210m42-210-106 210" />
      `
    case 'dance':
      return `
        <circle cx="358" cy="106" r="42" fill="${fill}" />
        <path ${line} d="M356 152c-86 66-82 150 20 206m-20-206c118 16 158 74 168 160M292 256l-88 104m198-38 84 92" />
        <path ${thinLine} opacity=".62" d="M176 176c54-46 108-46 162 0" />
      `
    case 'gym':
      return `
        <path ${line} d="M168 260h396" />
        <rect x="96" y="186" width="60" height="148" rx="12" fill="${fill}" />
        <rect x="172" y="160" width="46" height="200" rx="10" fill="${fill}" opacity=".76" />
        <rect x="516" y="160" width="46" height="200" rx="10" fill="${fill}" opacity=".76" />
        <rect x="578" y="186" width="60" height="148" rx="12" fill="${fill}" />
      `
  }
}

function getGeneratedPartnerImage(partner: Partner) {
  const cacheKey = `${'description' in partner ? 'discount' : 'main'}-${partner.id}-${partner.name}`
  const cached = imageCache.get(cacheKey)

  if (cached) {
    return cached
  }

  const seed = hashString(cacheKey)
  const service = getPrimaryService(partner)
  const hue = seed % 360
  const accentHue = (hue + 42 + (seed % 78)) % 360
  const dark = `hsl(${hue} 28% 13%)`
  const mid = `hsl(${hue} 24% 24%)`
  const amber = `hsl(${accentHue} 74% 62%)`
  const dust = `hsl(${(hue + 180) % 360} 22% 72%)`
  const rust = `hsl(${(hue + 24) % 360} 58% 42%)`
  const horizon = 360 + (seed % 90)
  const sunX = 820 + (seed % 230)
  const sunY = 104 + (seed % 90)
  const badge = String(partner.id).padStart(3, '0')
  const shortName = escapeXml(partner.name.slice(0, 24))
  const serviceLabel = escapeXml(serviceLabels[service].toUpperCase())
  const motif = getServiceMotif(service, dust, amber)
  const symbolRotation = seed % 13 - 6

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="${shortName}">
      <defs>
        <linearGradient id="sky-${seed}" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${dark}" />
          <stop offset=".58" stop-color="${mid}" />
          <stop offset="1" stop-color="${rust}" />
        </linearGradient>
        <pattern id="grid-${seed}" width="${42 + (seed % 18)}" height="${42 + (seed % 18)}" patternUnits="userSpaceOnUse">
          <path d="M0 0H80M0 0V80" stroke="${dust}" stroke-opacity=".12" stroke-width="2" />
        </pattern>
        <filter id="grain-${seed}">
          <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 .24" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="1200" height="720" fill="url(#sky-${seed})" />
      <rect width="1200" height="720" fill="url(#grid-${seed})" />
      <circle cx="${sunX}" cy="${sunY}" r="${92 + (seed % 42)}" fill="${amber}" opacity=".76" />
      <path d="M0 ${horizon}C198 ${horizon - 64} 308 ${horizon + 78} 510 ${horizon + 8}S854 ${horizon - 58} 1200 ${horizon + 34}V720H0Z" fill="#1d1c17" opacity=".78" />
      <path d="M0 606C186 552 316 654 496 594s318-122 704-52v178H0Z" fill="#0f120e" opacity=".72" />
      <g transform="translate(${134 + (seed % 88)} ${64 + (seed % 38)}) rotate(${symbolRotation} 350 280)">
        <circle cx="360" cy="280" r="224" fill="#10140f" opacity=".38" />
        <circle cx="360" cy="280" r="206" fill="none" stroke="${amber}" stroke-width="6" stroke-dasharray="${28 + (seed % 18)} 18" opacity=".58" />
        ${motif}
      </g>
      <g opacity=".66" fill="${dust}">
        <rect x="${74 + (seed % 40)}" y="82" width="190" height="10" />
        <rect x="${84 + (seed % 34)}" y="104" width="${86 + (seed % 70)}" height="10" />
        <rect x="${912 - (seed % 50)}" y="584" width="204" height="10" />
        <rect x="${948 - (seed % 36)}" y="606" width="${76 + (seed % 98)}" height="10" />
      </g>
      <text x="72" y="640" fill="${dust}" font-family="Georgia, serif" font-size="34" font-weight="700" letter-spacing="3">PUSH30-${badge}</text>
      <text x="72" y="680" fill="${amber}" font-family="Verdana, sans-serif" font-size="22" font-weight="700" letter-spacing="2">${serviceLabel} // ${shortName}</text>
      <rect x="0" y="0" width="1200" height="720" fill="#000" filter="url(#grain-${seed})" opacity=".38" />
    </svg>
  `

  const image = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  imageCache.set(cacheKey, image)
  return image
}

function toggleServiceFilter(filters: ServiceFilter[], value: ServiceFilter) {
  return filters.includes(value)
    ? filters.filter(filter => filter !== value)
    : [...filters, value]
}

function matchesServiceFilters(partner: Partner, filters: ServiceFilter[]) {
  if (filters.length === 0) {
    return true
  }

  const partnerServices = getPartnerServices(partner)
  return filters.some(filter => partnerServices.includes(filter))
}

// -- Modal --------------------------------------------------------------------

function MainPartnerModal({ partner, onClose }: { partner: MainPartner; onClose: () => void }) {
  const services = getPartnerServices(partner)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080a07]/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-[#706443] bg-[#f0e3bf] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <img src={getGeneratedPartnerImage(partner)} alt={partner.name} className="h-52 w-full rounded-t-lg object-cover" />
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full border border-[#615832] bg-[#f4e7c4]/95 p-1.5 text-[#1e2318] shadow transition hover:bg-white"
          aria-label="Закрыть"
        >
          <X size={18} />
        </button>
        <div className="p-6">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {services.map(service => (
              <span key={service} className="rounded-full border border-[#9c833e] bg-[#312b1e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f4cf66]">
                {serviceLabels[service]}
              </span>
            ))}
          </div>
          <h2 className="mb-4 text-2xl font-black leading-tight text-[#202316]">{partner.name}</h2>
          {partner.standard && (
            <div className="mb-5 rounded-lg border border-[#b7a16a] bg-[#fff3cf]/70 p-4">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#2e4c35] px-3 py-1 text-xs font-bold text-[#dff0b0]">
                <Dumbbell size={12} /> Стандарт
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[#3b3a28]">{partner.standard}</p>
            </div>
          )}
          {partner.plus && (
            <div className="rounded-lg border border-[#b9854d] bg-[#fff3cf]/70 p-4">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#743f22] px-3 py-1 text-xs font-bold text-[#ffd891]">
                <Dumbbell size={12} /> Плюс
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[#3b3a28]">{partner.plus}</p>
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
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-[#706443] bg-[#f0e3bf] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <img src={getGeneratedPartnerImage(partner)} alt={partner.name} className="h-52 w-full rounded-t-lg object-cover" />
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full border border-[#615832] bg-[#f4e7c4]/95 p-1.5 text-[#1e2318] shadow transition hover:bg-white"
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
              <span key={service} className="rounded-full border border-[#9c833e] bg-[#312b1e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f4cf66]">
                {serviceLabels[service]}
              </span>
            ))}
          </div>
          <h2 className="mb-4 text-2xl font-black leading-tight text-[#202316]">{partner.name}</h2>
          {partner.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#3b3a28]">{partner.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// -- Cards --------------------------------------------------------------------

function MainPartnerCard({ partner, onClick }: { partner: MainPartner; onClick: () => void }) {
  const hasBoth = partner.standard && partner.plus
  const services = getPartnerServices(partner).slice(0, 3)

  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-lg border border-[#4d4c31] bg-[#efe1ba] text-left shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-1 hover:border-[#d0ad47] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4cf66]"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={getGeneratedPartnerImage(partner)}
          alt={partner.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a07]/75 via-transparent to-transparent" />
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
      className="group overflow-hidden rounded-lg border border-[#4d4c31] bg-[#efe1ba] text-left shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-1 hover:border-[#d0ad47] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4cf66]"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={getGeneratedPartnerImage(partner)}
          alt={partner.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a07]/75 via-transparent to-transparent" />
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

// -- Page ---------------------------------------------------------------------

function PartnersPage() {
  const [tab, setTab] = useState<Tab>('main')
  const [search, setSearch] = useState('')
  const [tariffFilter, setTariffFilter] = useState<TariffFilter>('all')
  const [serviceFilters, setServiceFilters] = useState<ServiceFilter[]>([])
  const [selectedMain, setSelectedMain] = useState<MainPartner | null>(null)
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountPartner | null>(null)

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
    <div className="min-h-screen bg-[#14170f] text-[#f1e7c7]">
      <header className="sticky top-0 z-40 border-b border-[#4e4b31] bg-[#171a12]/95 shadow-[0_18px_42px_rgba(0,0,0,0.24)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#d2b451] bg-[#29351f] text-[#f4cf66] shadow-inner">
                <Dumbbell size={21} />
              </div>
              <div>
                <h1 className="text-xl font-black leading-tight tracking-wide text-[#f8e4a5]">Push30</h1>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a9aa82]">Каталог партнёров</p>
              </div>
            </div>

            <div className="relative w-full lg:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa06d]" />
              <input
                type="text"
                placeholder="Поиск партнёра или услуги..."
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="w-full rounded-lg border border-[#5b5739] bg-[#232719] py-2.5 pl-9 pr-4 text-sm font-medium text-[#f6edcf] placeholder:text-[#8d8963] transition focus:border-[#d2b451] focus:outline-none focus:ring-2 focus:ring-[#d2b451]/30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTab('main')}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  tab === 'main'
                    ? 'bg-[#d2b451] text-[#16180f]'
                    : 'border border-[#4e4b31] text-[#d8d0aa] hover:bg-[#262a1b]'
                }`}
              >
                Залы ({mainPartners.length})
              </button>
              <button
                onClick={() => setTab('discount')}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  tab === 'discount'
                    ? 'bg-[#b76034] text-[#fff4d5]'
                    : 'border border-[#4e4b31] text-[#d8d0aa] hover:bg-[#262a1b]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Tag size={13} /> Дискаунт ({discountPartners.length})
                </span>
              </button>
              <div className="ml-0 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a9aa82] sm:ml-2">
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
                        : 'border border-[#4e4b31] text-[#d8d0aa] hover:bg-[#262a1b]'
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
                        : 'border border-[#4e4b31] text-[#d8d0aa] hover:bg-[#262a1b]'
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#6d6040] px-3 py-1.5 text-xs font-bold text-[#f1e7c7] transition hover:bg-[#262a1b]"
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
            <div className="rounded-lg border border-[#4e4b31] bg-[#1c2016] px-6 py-16 text-center text-[#a9aa82]">
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
          <div className="rounded-lg border border-[#4e4b31] bg-[#1c2016] px-6 py-16 text-center text-[#a9aa82]">
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
