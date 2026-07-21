import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, Footer } from 'docx'
import pptxgen from 'pptxgenjs'

/* ---------------- shared palette ---------------- */
const BLUE = '4A3DFF'
const INK = '141414'
const SOFT = '3A3A3A'
const MUTED = '8A8A8A'
const CREAM = 'F2EEE3'
const RULE = 'DCD6C8'
const BLUE_RGB = [74, 61, 255]
const MUTED_RGB = [138, 138, 138]
const RULE_RGB = [220, 214, 200]
const INK_RGB = [20, 20, 20]
const SOFT_RGB = [58, 58, 58]

const TAGLINE = 'Startup Idea Validation Platform'

function fileName(r, ext) {
  const slug = (r.startupName || 'report').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  return `SIVP-${slug}-report.${ext}`
}

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

/* ---------------- PDF (jsPDF) ---------------- */
export function exportPDF(r) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const M = 48
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const CONTENT_BOTTOM = H - 60 // keep clear of the footer
  let y = M

  const ensure = (needed = 20) => {
    if (y + needed > CONTENT_BOTTOM) {
      doc.addPage()
      y = M
    }
  }

  const body = (text, size, bold, rgb) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...(rgb || SOFT_RGB))
    const wrapped = doc.splitTextToSize(String(text), W - M * 2)
    wrapped.forEach((t) => {
      ensure(size * 1.4)
      doc.text(t, M, y)
      y += size * 1.4
    })
  }

  const gap = (n = 10) => { y += n }

  const section = (title) => {
    gap(10)
    ensure(40)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...BLUE_RGB)
    doc.text(title.toUpperCase(), M, y)
    y += 7
    doc.setDrawColor(...BLUE_RGB)
    doc.setLineWidth(1.6)
    doc.line(M, y, M + 44, y)
    y += 18
  }

  // Two-column label / value row.
  const kv = (label, value) => {
    ensure(22)
    const top = y
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED_RGB)
    doc.text(label.toUpperCase(), M, top)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...INK_RGB)
    const wrapped = doc.splitTextToSize(String(value), W - M * 2 - 132)
    wrapped.forEach((t, i) => {
      if (i > 0) ensure(15)
      doc.text(t, M + 132, y)
      if (i < wrapped.length - 1) y += 15
    })
    y = Math.max(top + 15, y + 15)
    gap(3)
  }

  // ---- Header band ----
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED_RGB)
  doc.text(`// VALIDATION REPORT · ${r.validatedAt}`, M, y)
  y += 24
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(...INK_RGB)
  doc.text(String(r.startupName).toUpperCase(), M, y)
  y += 20
  body(`${r.industry} · ${r.geographicMarket}`, 10, false, MUTED_RGB)
  gap(8)
  doc.setDrawColor(...RULE_RGB)
  doc.setLineWidth(1)
  doc.line(M, y, W - M, y)
  y += 6

  // ---- Readiness highlight ----
  gap(8)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...BLUE_RGB)
  doc.text(`Investor readiness  ${r.investorReadinessScore}/100`, M, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...MUTED_RGB)
  doc.text(`· ${r.readinessCategory}`, M + doc.getTextWidth(`Investor readiness  ${r.investorReadinessScore}/100  `), y)
  y += 8

  // ---- Key metrics ----
  section('Key metrics')
  kv('Validation', `${r.validationScore} / 100`)
  kv('Product-market fit', `${r.pmfScore} / 100`)
  kv('Success probability', `${r.successProbability}%`)
  kv('Funding need', r.fundingRequirement)
  kv('Valuation', r.valuation)
  kv('Burn rate', r.burnRate)

  // ---- Market ----
  section('Market')
  kv('TAM', r.tam)
  kv('SAM', r.sam)
  kv('SOM', r.som)
  if (r.marketNote) { gap(4); body(r.marketNote, 10, false, SOFT_RGB) }

  // ---- Score breakdown ----
  section('Investor readiness breakdown')
  r.scoreBreakdown.forEach((s) => kv(`${s.label} (${s.weight}%)`, `${s.value} / 100`))

  // ---- SWOT ----
  section('SWOT')
  const swotBlock = (label, items) => {
    ensure(24)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...BLUE_RGB)
    doc.text(label, M, y)
    y += 15
    ;(items || []).forEach((i) => body(`•  ${i}`, 10.5, false, SOFT_RGB))
    gap(8)
  }
  swotBlock('Strengths', r.swot.strengths)
  swotBlock('Weaknesses', r.swot.weaknesses)
  swotBlock('Opportunities', r.swot.opportunities)
  swotBlock('Threats', r.swot.threats)

  // ---- Executive summary ----
  section('Executive summary')
  body(r.executiveSummary, 11, false, SOFT_RGB)

  // ---- Footer on every page ----
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setDrawColor(...RULE_RGB)
    doc.setLineWidth(0.8)
    doc.line(M, H - 34, W - M, H - 34)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...BLUE_RGB)
    doc.text('SIVP', M, H - 20)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED_RGB)
    doc.text(TAGLINE, M + 26, H - 20)
    doc.text(`Page ${i} of ${pages}`, W - M, H - 20, { align: 'right' })
  }

  doc.save(fileName(r, 'pdf'))
}

/* ---------------- DOCX (docx) ---------------- */
export async function exportDOCX(r) {
  const P = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 120 } })
  const H2 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 260, after: 120 },
      border: { bottom: { color: BLUE, size: 6, style: BorderStyle.SINGLE, space: 4 } },
      children: [new TextRun({ text, bold: true, color: BLUE, size: 26 })],
    })

  // label: value on one line, label muted.
  const kv = (label, value) =>
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: `${label}:  `, bold: true, color: MUTED }),
        new TextRun({ text: String(value), color: INK }),
      ],
    })

  const swot = (label, items) => [
    new Paragraph({ spacing: { before: 140, after: 60 }, children: [new TextRun({ text: label, bold: true, color: BLUE, size: 24 })] }),
    ...(items || []).map((i) => new Paragraph({ text: i, bullet: { level: 0 }, spacing: { after: 40 } })),
  ]

  const footer = new Footer({
    children: [
      new Paragraph({
        border: { top: { color: RULE, size: 6, style: BorderStyle.SINGLE, space: 4 } },
        children: [
          new TextRun({ text: 'SIVP', bold: true, color: BLUE, size: 16 }),
          new TextRun({ text: `   ${TAGLINE}`, color: MUTED, size: 16 }),
        ],
      }),
    ],
  })

  const doc = new Document({
    sections: [{
      footers: { default: footer },
      children: [
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `// VALIDATION REPORT · ${r.validatedAt}`, color: MUTED, size: 18, bold: true })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: String(r.startupName).toUpperCase(), bold: true, size: 52, color: INK })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `${r.industry} · ${r.geographicMarket}`, color: MUTED, size: 20 })] }),
        new Paragraph({ children: [new TextRun({ text: `Investor readiness ${r.investorReadinessScore}/100 — ${r.readinessCategory}`, bold: true, color: BLUE, size: 28 })] }),

        H2('Key metrics'),
        kv('Validation', `${r.validationScore} / 100`),
        kv('Product-market fit', `${r.pmfScore} / 100`),
        kv('Success probability', `${r.successProbability}%`),
        kv('Funding need', r.fundingRequirement),
        kv('Valuation', r.valuation),
        kv('Burn rate', r.burnRate),

        H2('Market'),
        kv('TAM', r.tam),
        kv('SAM', r.sam),
        kv('SOM', r.som),
        ...(r.marketNote ? [P(r.marketNote, { color: SOFT })] : []),

        H2('Investor readiness breakdown'),
        ...r.scoreBreakdown.map((s) => kv(`${s.label} (${s.weight}%)`, `${s.value} / 100`)),

        H2('SWOT'),
        ...swot('Strengths', r.swot.strengths),
        ...swot('Weaknesses', r.swot.weaknesses),
        ...swot('Opportunities', r.swot.opportunities),
        ...swot('Threats', r.swot.threats),

        H2('Executive summary'),
        P(r.executiveSummary, { color: SOFT }),
      ],
    }],
  })
  const blob = await Packer.toBlob(doc)
  saveBlob(blob, fileName(r, 'docx'))
}

/* ---------------- PPTX (pptxgenjs) ---------------- */
export function exportPPTX(r) {
  const pptx = new pptxgen()
  pptx.defineLayout({ name: 'WIDE', width: 10, height: 5.63 })
  pptx.layout = 'WIDE'

  // Master carries the background + SIVP footer + slide number onto every slide.
  pptx.defineSlideMaster({
    title: 'SIVP_MASTER',
    background: { color: CREAM },
    objects: [
      { line: { x: 0.5, y: 5.18, w: 9.0, h: 0, line: { color: RULE, width: 1 } } },
      { text: { text: 'SIVP', options: { x: 0.5, y: 5.2, w: 1, h: 0.3, fontSize: 10, bold: true, color: BLUE } } },
      { text: { text: TAGLINE, options: { x: 1.05, y: 5.2, w: 5, h: 0.3, fontSize: 9, color: MUTED } } },
    ],
    slideNumber: { x: 9.2, y: 5.2, w: 0.6, h: 0.3, fontSize: 9, color: MUTED, align: 'right' },
  })

  const add = () => pptx.addSlide({ masterName: 'SIVP_MASTER' })
  const heading = (s, text) => {
    s.addText(text, { x: 0.5, y: 0.4, fontSize: 24, bold: true, color: INK })
    s.addShape(pptx.ShapeType.line, { x: 0.5, y: 0.95, w: 0.6, h: 0, line: { color: BLUE, width: 2.5 } })
  }

  // ---- Title ----
  let s = add()
  s.addText('// VALIDATION REPORT', { x: 0.5, y: 0.55, fontSize: 12, color: MUTED, bold: true })
  s.addText(String(r.startupName).toUpperCase(), { x: 0.5, y: 1.15, fontSize: 44, bold: true, color: INK })
  s.addText(`${r.industry} · ${r.geographicMarket} · ${r.validatedAt}`, { x: 0.5, y: 2.25, fontSize: 14, color: SOFT })
  s.addShape(pptx.ShapeType.line, { x: 0.5, y: 2.85, w: 9.0, h: 0, line: { color: RULE, width: 1 } })
  s.addText(`Investor readiness  ${r.investorReadinessScore}/100`, { x: 0.5, y: 3.2, fontSize: 24, bold: true, color: BLUE })
  s.addText(r.readinessCategory, { x: 0.5, y: 3.85, fontSize: 14, color: MUTED })

  // ---- Key metrics (card grid) ----
  s = add()
  heading(s, 'Key metrics')
  const cards = [
    ['Validation', `${r.validationScore}/100`],
    ['PMF', `${r.pmfScore}/100`],
    ['Success', `${r.successProbability}%`],
    ['Funding', r.fundingRequirement],
    ['Valuation', r.valuation],
    ['Burn rate', r.burnRate],
  ]
  cards.forEach(([label, value], i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = 0.5 + col * 3.07
    const yy = 1.25 + row * 1.85
    s.addShape(pptx.ShapeType.roundRect, { x, y: yy, w: 2.85, h: 1.6, fill: { color: 'FFFFFF' }, line: { color: RULE, width: 1 }, rectRadius: 0.08 })
    s.addText(String(label).toUpperCase(), { x: x + 0.2, y: yy + 0.18, w: 2.45, h: 0.3, fontSize: 10, color: MUTED, bold: true })
    const long = typeof value === 'string' && value.length > 14
    s.addText(String(value), { x: x + 0.2, y: yy + 0.5, w: 2.45, h: 0.95, fontSize: long ? 13 : 22, bold: true, color: INK, valign: 'top' })
  })

  // ---- Market ----
  s = add()
  heading(s, 'Market')
  const mkt = [
    ['TAM — total addressable', r.tam],
    ['SAM — serviceable', r.sam],
    ['SOM — obtainable', r.som],
  ]
  mkt.forEach(([label, value], i) => {
    const yy = 1.3 + i * 0.75
    s.addText(String(label).toUpperCase(), { x: 0.5, y: yy, w: 3.2, h: 0.5, fontSize: 11, bold: true, color: MUTED, valign: 'top' })
    s.addText(String(value), { x: 3.7, y: yy, w: 5.8, h: 0.6, fontSize: 14, bold: true, color: INK, valign: 'top' })
  })
  if (r.marketNote) s.addText(r.marketNote, { x: 0.5, y: 3.7, w: 9.0, h: 1.2, fontSize: 12, color: SOFT, valign: 'top' })

  // ---- SWOT ----
  s = add()
  heading(s, 'SWOT')
  const quad = (title, items, x, y, color) => {
    s.addText(title, { x, y, fontSize: 15, bold: true, color })
    s.addText((items || []).map((t) => ({ text: t, options: { bullet: true } })), { x, y: y + 0.35, w: 4.3, h: 1.5, fontSize: 11, color: SOFT, valign: 'top' })
  }
  quad('Strengths', r.swot.strengths, 0.5, 1.15, BLUE)
  quad('Weaknesses', r.swot.weaknesses, 5.1, 1.15, BLUE)
  quad('Opportunities', r.swot.opportunities, 0.5, 3.25, BLUE)
  quad('Threats', r.swot.threats, 5.1, 3.25, BLUE)

  // ---- Summary ----
  s = add()
  heading(s, 'Executive summary')
  s.addText(r.executiveSummary, { x: 0.5, y: 1.2, w: 9.0, h: 3.5, fontSize: 15, color: SOFT, valign: 'top', lineSpacingMultiple: 1.25 })

  pptx.writeFile({ fileName: fileName(r, 'pptx') })
}
