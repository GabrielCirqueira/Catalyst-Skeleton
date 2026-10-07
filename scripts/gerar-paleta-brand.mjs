#!/usr/bin/env node
// este script e responsavel por gerar a paleta de cores do brand
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const NATURAL_L = {
  50: 0.97,
  100: 0.93,
  200: 0.87,
  300: 0.78,
  400: 0.7,
  500: 0.6,
  600: 0.52,
  700: 0.44,
  800: 0.35,
  900: 0.28,
  950: 0.22,
}

const NEUTRALS = {
  grey: { chroma: 0.08, hueShift: 0 },
  stone: { chroma: 0.05, hueShift: 45 },
}

const SEMANTIC = {
  blue: { hue: 255, chroma: 0.17, yellowLift: false, maxShift: 15 },
  green: { hue: 145, chroma: 0.15, yellowLift: false, maxShift: 15 },
  red: { hue: 25, chroma: 0.21, yellowLift: false, maxShift: 5, hueMin: 20, hueMax: 30 },
  yellow: { hue: 95, chroma: 0.17, yellowLift: true, maxShift: 5, hueMin: 88, hueMax: 102 },
  orange: { hue: 55, chroma: 0.18, yellowLift: false, maxShift: 15 },
  pink: { hue: 340, chroma: 0.18, yellowLift: false, maxShift: 15 },
  purple: { hue: 300, chroma: 0.16, yellowLift: false, maxShift: 15 },
  brown: { hue: 50, chroma: 0.12, yellowLift: false, maxShift: 15 },
  cyan: { hue: 210, chroma: 0.16, yellowLift: false, maxShift: 15 },
  emerald: { hue: 160, chroma: 0.15, yellowLift: false, maxShift: 15 },
  teal: { hue: 175, chroma: 0.15, yellowLift: false, maxShift: 15 },
  indigo: { hue: 275, chroma: 0.16, yellowLift: false, maxShift: 15 },
  rose: { hue: 12, chroma: 0.21, yellowLift: false, maxShift: 5, hueMin: 8, hueMax: 18 },
  amber: { hue: 78, chroma: 0.17, yellowLift: true, maxShift: 6, hueMin: 70, hueMax: 85 },
  lime: { hue: 125, chroma: 0.16, yellowLift: false, maxShift: 15 },
  violet: { hue: 290, chroma: 0.16, yellowLift: false, maxShift: 15 },
}

const PALETTE_ORDER = ['brand', ...Object.keys(NEUTRALS), ...Object.keys(SEMANTIC)]

const GREY_STEPS = [0, 25, ...STEPS]

function parseArgs(argv) {
  const args = { hex: '', anchor: 'auto', out: '', name: 'skeleton', prevName: '', web: '' }
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i]
    const val = argv[i + 1]
    if (key === '--hex') {
      args.hex = val
      i += 1
    } else if (key === '--anchor') {
      args.anchor = val
      i += 1
    } else if (key === '--out') {
      args.out = val
      i += 1
    } else if (key === '--name') {
      args.name = val
      i += 1
    } else if (key === '--prev-name') {
      args.prevName = val ?? ''
      i += 1
    } else if (key === '--web') {
      args.web = val
      i += 1
    } else {
      fail(`Argumento desconhecido: ${key}`)
    }
  }
  return args
}

function fail(message) {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

function normalizeHex(input) {
  const hex = String(input).trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    fail(`Hex inválido: ${input}. Use 6 dígitos, com ou sem #.`)
  }
  return `#${hex.toLowerCase()}`
}

function parseAnchor(value) {
  if (value === 'auto' || value === '') return 'auto'
  const step = Number(value)
  if (!STEPS.includes(step)) {
    fail(`Degrau inválido: ${value}. Use auto ou um de: ${STEPS.join(', ')}.`)
  }
  return step
}

function normalizePaletteName(value) {
  const name = String(value ?? '')
    .trim()
    .toLowerCase()
  if (!/^[a-z][a-z0-9]{0,31}$/.test(name)) {
    fail(`Nome de paleta inválido: ${value}. Use só letras minúsculas e números, começando com letra.`)
  }
  return name
}

function hexToRgb(hex) {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ]
}

function rgbToHex(r, g, b) {
  const to = (n) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function srgbToLinear(c) {
  const x = c / 255
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(x) {
  const y = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
  return y * 255
}

function hexToOklch(hex) {
  const [r8, g8, b8] = hexToRgb(hex)
  const r = srgbToLinear(r8)
  const g = srgbToLinear(g8)
  const b = srgbToLinear(b8)

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  const C = Math.hypot(a, bLab)
  let H = (Math.atan2(bLab, a) * 180) / Math.PI
  if (H < 0) H += 360

  return { L, C, H }
}

function oklchToLinearRgb(L, C, H) {
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  }
}

function inSrgb(L, C, H) {
  const { r, g, b } = oklchToLinearRgb(L, C, H)
  return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1
}

function oklchToHex(L, C, H) {
  const { r, g, b } = oklchToLinearRgb(L, C, H)
  return rgbToHex(linearToSrgb(r), linearToSrgb(g), linearToSrgb(b))
}

function fitToSrgb(L, C, H) {
  if (inSrgb(L, C, H)) return { L, C, H }
  let lo = 0
  let hi = C
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2
    if (inSrgb(L, mid, H)) lo = mid
    else hi = mid
  }
  return { L, C: lo, H }
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function mixHex(a, b, t) {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  return rgbToHex(lerp(ar, br, t), lerp(ag, bg, t), lerp(ab, bb, t))
}

function hueDelta(from, to) {
  return ((to - from + 540) % 360) - 180
}

function hueDistance(a, b) {
  return Math.abs(hueDelta(a, b))
}

function pickAnchor(L, requested) {
  if (requested !== 'auto') return requested
  let best = 500
  let bestDiff = Infinity
  for (const step of STEPS) {
    const diff = Math.abs(L - NATURAL_L[step])
    if (diff < bestDiff) {
      best = step
      bestDiff = diff
    }
  }
  return best
}

function lightnessCurve(anchorStep, LAnchor) {
  const iA = STEPS.indexOf(anchorStep)
  const offset = LAnchor - NATURAL_L[anchorStep]
  const last = STEPS.length - 1

  return STEPS.map((step, i) => {
    if (step === anchorStep) return LAnchor
    let weight = 0
    if (i < iA) weight = iA === 0 ? 1 : i / iA
    else {
      const span = last - iA
      weight = span === 0 ? 1 : 1 - (i - iA) / span
    }
    return NATURAL_L[step] + offset * weight
  })
}

function chromaCurve(anchorStep, CAnchor) {
  const iA = STEPS.indexOf(anchorStep)
  const sigma = 3.2
  const raw = STEPS.map((_, i) => Math.exp(-0.5 * ((i - iA) / sigma) ** 2))
  const peak = raw[iA] || 1

  return STEPS.map((step, i) => {
    if (step === anchorStep) return CAnchor
    const bell = raw[i] / peak
    const floor = lerp(CAnchor * 0.1, CAnchor * 0.2, i / (STEPS.length - 1))
    return lerp(floor, CAnchor, bell)
  })
}

function hueCurve(anchorStep, HAnchor, drift) {
  const iA = STEPS.indexOf(anchorStep)
  return STEPS.map((step, i) => {
    if (step === anchorStep || drift === 0) return HAnchor
    const t = (i - iA) / Math.max(1, STEPS.length - 1)
    return (HAnchor - t * drift + 360) % 360
  })
}

function enforceDescending(values) {
  const next = [...values]
  for (let i = 1; i < next.length; i += 1) {
    if (next[i] >= next[i - 1]) next[i] = next[i - 1] - 0.008
  }
  return next
}

function applyYellowLift(Ls) {
  const lifted = [...Ls]
  const bump = { 400: 0.12, 500: 0.22, 600: 0.1 }
  STEPS.forEach((step, i) => {
    if (bump[step]) lifted[i] += bump[step]
  })
  return enforceDescending(lifted)
}

function buildScale({
  L,
  C,
  H,
  anchorStep,
  intactHex,
  chromaScale = 1,
  yellowLift = false,
  hueDrift = 0,
}) {
  let Ls = enforceDescending(lightnessCurve(anchorStep, L))
  if (yellowLift) Ls = applyYellowLift(Ls)
  const Cs = chromaCurve(anchorStep, C * chromaScale)
  const Hs = hueCurve(anchorStep, H, hueDrift)
  const scale = {}

  STEPS.forEach((step, i) => {
    if (intactHex && step === anchorStep) {
      scale[step] = intactHex
      return
    }
    const fitted = fitToSrgb(Ls[i], Math.max(0, Cs[i]), Hs[i])
    scale[step] = oklchToHex(fitted.L, fitted.C, fitted.H)
  })

  return scale
}

function clampHue(h, min, max) {
  return Math.min(max, Math.max(min, h))
}

function mixChroma(absolute, brandC) {
  return absolute * 0.8 + brandC * 0.2
}

function harmonizeHue(target, brandHue, maxShift) {
  if (hueDistance(target, brandHue) < 30) return target
  const delta = hueDelta(target, brandHue)
  const shift = Math.sign(delta) * Math.min(Math.abs(delta) * 0.5, maxShift)
  return (target + shift + 360) % 360
}

function semanticHue(spec, brandHue) {
  let h = harmonizeHue(spec.hue, brandHue, spec.maxShift ?? 15)
  if (spec.hueMin != null && spec.hueMax != null) h = clampHue(h, spec.hueMin, spec.hueMax)
  return h
}

function relativeLuminance(hex) {
  const [r8, g8, b8] = hexToRgb(hex)
  const [r, g, b] = [r8, g8, b8].map(srgbToLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a, b) {
  const L1 = relativeLuminance(a)
  const L2 = relativeLuminance(b)
  const light = Math.max(L1, L2)
  const dark = Math.min(L1, L2)
  return (light + 0.05) / (dark + 0.05)
}

function isDarker(a, b) {
  return hexToOklch(a).L < hexToOklch(b).L - 0.001
}

function validate(palettes, brandHue) {
  const warnings = []

  for (const [name, scale] of Object.entries(palettes)) {
    for (let i = 1; i < STEPS.length; i += 1) {
      if (!isDarker(scale[STEPS[i]], scale[STEPS[i - 1]])) {
        warnings.push(`${name}: o degrau ${STEPS[i]} não ficou mais escuro que ${STEPS[i - 1]}.`)
      }
    }

    const whiteOn600 = contrastRatio('#ffffff', scale[600])
    const whiteOn700 = contrastRatio('#ffffff', scale[700])
    const darkOn50 = contrastRatio(scale[700], scale[50])

    if (whiteOn600 < 4.5) {
      warnings.push(
        `${name}.600: texto branco tem contraste ${whiteOn600.toFixed(2)}:1 (mínimo 4.5:1).`
      )
    }
    if (whiteOn700 < 4.5) {
      warnings.push(
        `${name}.700: texto branco tem contraste ${whiteOn700.toFixed(2)}:1 (mínimo 4.5:1).`
      )
    }
    if (darkOn50 < 4.5) {
      warnings.push(
        `${name}: ${name}.700 sobre ${name}.50 tem contraste ${darkOn50.toFixed(2)}:1 (mínimo 4.5:1).`
      )
    }
  }

  const redLch = hexToOklch(palettes.red[500])
  if (redLch.C < 0.17) {
    warnings.push(`red.500: croma ${redLch.C.toFixed(3)} abaixo de 0.17.`)
  }
  const dist = hueDistance(brandHue, redLch.H)
  if (dist < 40) {
    warnings.push(
      `Brand e red ficaram próximas (ΔH ${dist.toFixed(1)}°). O giro do vermelho foi reduzido para afastar o erro da marca.`
    )
  }

  return warnings
}

function renderScale(name, scale, indent = '          ') {
  const steps = name === 'grey' ? GREY_STEPS : STEPS
  const lines = steps.map((step) => `${indent}  ${step}: { value: '${scale[step]}' },`).join('\n')
  return `${indent}${name}: {\n${lines}\n${indent}}`
}

function renderSemanticScale(ns, scale) {
  const p = `{colors.${ns}.${scale}`
  return `        ${scale}: {
          contrast: { value: '{colors.${ns}.grey.0}' },
          fg: { value: { _light: '${p}.700}', _dark: '${p}.300}' } },
          subtle: { value: { _light: '${p}.100}', _dark: '${p}.900}' } },
          muted: { value: { _light: '${p}.200}', _dark: '${p}.800}' } },
          emphasized: { value: { _light: '${p}.300}', _dark: '${p}.700}' } },
          solid: { value: { _light: '${p}.600}', _dark: '${p}.500}' } },
          focusRing: { value: '${p}.500}' },
        }`
}

function renderTheme(palettes, ns) {
  const colors = PALETTE_ORDER.map((name) => renderScale(name, palettes[name])).join(',\n')
  const semantics = ['brand', ...Object.keys(SEMANTIC)]
    .map((scale) => renderSemanticScale(ns, scale))
    .join(',\n')

  return `// Generated by scripts/gerar-paleta-brand.sh — do not edit palettes by hand.
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

export const PALETTE_NAME = '${ns}' as const

export function paletteToken(scale: string, shade: number | string) {
  return \`\${PALETTE_NAME}.\${scale}.\${shade}\`
}

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Poppins, ui-sans-serif, system-ui, sans-serif' },
        body: { value: 'Lato, ui-sans-serif, system-ui, sans-serif' },
      },
      colors: {
        ${ns}: {
${colors}
        },
      },
    },
    semanticTokens: {
      colors: {
${semantics}
      },
    },
  },
})

export const theme = createSystem(defaultConfig, config)
`
}

function walkTsFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    const p = join(dir, entry.name)
    if (entry.isDirectory()) walkTsFiles(p, acc)
    else if (/\.(tsx|ts)$/.test(entry.name) && entry.name !== 'theme.ts') acc.push(p)
  }
  return acc
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replaceFrontendPalette(webDir, prevName, nextName) {
  if (!webDir || !prevName || prevName === nextName) return 0
  const scales = [...new Set([...PALETTE_ORDER, 'grey', 'gray'])].join('|')
  const tokenRe = new RegExp(`\\b${escapeRegExp(prevName)}\\.(${scales})\\.`, 'g')
  let files = 0
  for (const file of walkTsFiles(webDir)) {
    const src = readFileSync(file, 'utf8')
    const next = src.replace(tokenRe, `${nextName}.$1.`)
    if (next !== src) {
      writeFileSync(file, next, 'utf8')
      files += 1
    }
  }
  return files
}

function printSummary(palettes, anchor, hex, warnings) {
  process.stdout.write(`Âncora: ${anchor}  ·  Hex intacto: ${hex}\n\n`)
  process.stdout.write(`${['paleta', ...STEPS.map(String)].join('\t')}\n`)
  for (const name of PALETTE_ORDER) {
    process.stdout.write(`${[name, ...STEPS.map((step) => palettes[name][step])].join('\t')}\n`)
  }
  if (warnings.length > 0) {
    process.stderr.write('\nAvisos:\n')
    for (const warning of warnings) process.stderr.write(`- ${warning}\n`)
  }
}

function generate(hex, requestedAnchor) {
  const brand = hexToOklch(hex)
  const anchorStep = pickAnchor(brand.L, requestedAnchor)
  const palettes = {
    brand: buildScale({ ...brand, anchorStep, intactHex: hex, hueDrift: 12 }),
  }

  for (const [name, spec] of Object.entries(SEMANTIC)) {
    palettes[name] = buildScale({
      L: brand.L,
      C: mixChroma(spec.chroma, brand.C),
      H: semanticHue(spec, brand.H),
      anchorStep,
      yellowLift: spec.yellowLift,
      hueDrift: 5,
    })
  }

  for (const [name, spec] of Object.entries(NEUTRALS)) {
    palettes[name] = buildScale({
      L: brand.L,
      C: Math.max(0.008, brand.C * spec.chroma),
      H: (brand.H + spec.hueShift + 360) % 360,
      anchorStep,
    })
  }

  palettes.grey = {
    0: '#ffffff',
    25: mixHex('#ffffff', palettes.grey[50], 0.45),
    ...palettes.grey,
  }

  return { palettes, anchorStep, warnings: validate(palettes, brand.H) }
}

const args = parseArgs(process.argv)
if (!args.hex || !args.out) {
  fail(
    'Uso: gerar-paleta-brand.mjs --hex "#8b5cf6" --anchor auto --name skeleton --out web/config/theme/theme.ts --web web'
  )
}

const hex = normalizeHex(args.hex)
const name = normalizePaletteName(args.name || 'skeleton')
const prevName = args.prevName ? normalizePaletteName(args.prevName) : ''
const { palettes, anchorStep, warnings } = generate(hex, parseAnchor(args.anchor))

mkdirSync(dirname(args.out), { recursive: true })
const tmp = `${args.out}.${process.pid}.tmp`
writeFileSync(tmp, renderTheme(palettes, name), 'utf8')
renameSync(tmp, args.out)

const renamed = replaceFrontendPalette(args.web, prevName, name)
if (renamed > 0) {
  process.stdout.write(`Paleta "${prevName}" → "${name}" em ${renamed} arquivo(s).\n`)
}

printSummary(palettes, anchorStep, hex, warnings)
process.stdout.write(`\nNamespace: ${name}  ·  ex.: color="${name}.grey.700"\n`)
