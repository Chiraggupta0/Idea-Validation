import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import pptxgen from 'pptxgenjs'

const BLUE = '4A3DFF'

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
  let y = M

  const line = (text, size, bold, color) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(color || '#141414')
    const wrapped = doc.splitTextToSize(text, W - M * 2)
    wrapped.forEach((t) => {
      if (y > doc.internal.pageSize.getHeight() - M) { doc.addPage(); y = M }
      doc.text(t, M, y)
      y += size * 1.35
    })
  }
  const gap = (n = 10) => { y += n }

  line('SIVP VALIDATION REPORT', 10, true, '#6b6b6b')
  gap(4)
  line(r.startupName, 26, true)
  line(`${r.industry} · ${r.geographicMarket} · ${r.validatedAt}`, 10, false, '#6b6b6b')
  gap(14)

  line(`Investor readiness: ${r.investorReadinessScore}/100 (${r.readinessCategory})`, 13, true, '#' + BLUE)
  line(`Validation ${r.validationScore} · PMF ${r.pmfScore} · Success ${r.successProbability}%`, 11)
  line(`Funding ${r.fundingRequirement} · Valuation ${r.valuation} · Burn ${r.burnRate}`, 11)
  gap(14)

  line('MARKET', 12, true)
  line(`TAM ${r.tam} · SAM ${r.sam} · SOM ${r.som}`, 11)
  line(r.marketNote, 10, false, '#3a3a3a')
  gap(12)

  line('SCORE BREAKDOWN', 12, true)
  r.scoreBreakdown.forEach((s) => line(`${s.label} (${s.weight}%): ${s.value}`, 11))
  gap(12)

  const swotBlock = (label, items) => {
    line(label.toUpperCase(), 12, true)
    items.forEach((i) => line(`• ${i}`, 11, false, '#3a3a3a'))
    gap(6)
  }
  swotBlock('Strengths', r.swot.strengths)
  swotBlock('Weaknesses', r.swot.weaknesses)
  swotBlock('Opportunities', r.swot.opportunities)
  swotBlock('Threats', r.swot.threats)
  gap(6)

  line('EXECUTIVE SUMMARY', 12, true)
  line(r.executiveSummary, 11, false, '#3a3a3a')

  doc.save(fileName(r, 'pdf'))
}

/* ---------------- DOCX (docx) ---------------- */
export async function exportDOCX(r) {
  const P = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 120 } })
  const H = (text, level) => new Paragraph({ heading: level, spacing: { before: 200, after: 120 }, children: [new TextRun(text)] })

  const swot = (label, items) => [
    H(label, HeadingLevel.HEADING_2),
    ...items.map((i) => new Paragraph({ text: i, bullet: { level: 0 } })),
  ]

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ children: [new TextRun({ text: r.startupName, bold: true, size: 48 })] }),
        P(`${r.industry} · ${r.geographicMarket} · ${r.validatedAt}`, { color: '6B6B6B' }),
        H('Scores', HeadingLevel.HEADING_2),
        P(`Investor readiness: ${r.investorReadinessScore}/100 (${r.readinessCategory})`, { bold: true }),
        P(`Validation ${r.validationScore} · PMF ${r.pmfScore} · Success probability ${r.successProbability}%`),
        P(`Funding ${r.fundingRequirement} · Valuation ${r.valuation} · Burn ${r.burnRate}`),
        H('Market', HeadingLevel.HEADING_2),
        P(`TAM ${r.tam} · SAM ${r.sam} · SOM ${r.som}`),
        P(r.marketNote),
        H('Score breakdown', HeadingLevel.HEADING_2),
        ...r.scoreBreakdown.map((s) => new Paragraph({ text: `${s.label} (${s.weight}%): ${s.value}`, bullet: { level: 0 } })),
        ...swot('Strengths', r.swot.strengths),
        ...swot('Weaknesses', r.swot.weaknesses),
        ...swot('Opportunities', r.swot.opportunities),
        ...swot('Threats', r.swot.threats),
        H('Executive summary', HeadingLevel.HEADING_2),
        P(r.executiveSummary),
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

  // Title
  let s = pptx.addSlide()
  s.background = { color: 'F2EEE3' }
  s.addText('SIVP VALIDATION REPORT', { x: 0.5, y: 0.5, fontSize: 12, color: '6B6B6B', bold: true })
  s.addText(r.startupName, { x: 0.5, y: 1.2, fontSize: 44, bold: true, color: '141414' })
  s.addText(`${r.industry} · ${r.geographicMarket} · ${r.validatedAt}`, { x: 0.5, y: 2.3, fontSize: 14, color: '3A3A3A' })
  s.addText(`Investor readiness ${r.investorReadinessScore}/100 — ${r.readinessCategory}`, { x: 0.5, y: 3.2, fontSize: 20, bold: true, color: BLUE })

  // Scores
  s = pptx.addSlide()
  s.addText('Scores', { x: 0.5, y: 0.4, fontSize: 24, bold: true })
  s.addText(
    [
      { text: `Validation: ${r.validationScore}`, options: { bullet: true } },
      { text: `PMF: ${r.pmfScore}`, options: { bullet: true } },
      { text: `Success probability: ${r.successProbability}%`, options: { bullet: true } },
      { text: `Funding: ${r.fundingRequirement}`, options: { bullet: true } },
      { text: `Valuation: ${r.valuation}`, options: { bullet: true } },
      { text: `Burn: ${r.burnRate}`, options: { bullet: true } },
    ],
    { x: 0.6, y: 1.2, fontSize: 16, color: '141414', lineSpacingMultiple: 1.3 }
  )

  // Market
  s = pptx.addSlide()
  s.addText('Market', { x: 0.5, y: 0.4, fontSize: 24, bold: true })
  s.addText(`TAM ${r.tam}  ·  SAM ${r.sam}  ·  SOM ${r.som}`, { x: 0.6, y: 1.2, fontSize: 18, bold: true })
  s.addText(r.marketNote, { x: 0.6, y: 1.9, fontSize: 14, color: '3A3A3A', w: 8.5 })

  // SWOT
  s = pptx.addSlide()
  s.addText('SWOT', { x: 0.5, y: 0.4, fontSize: 24, bold: true })
  const quad = (title, items, x, y) => {
    s.addText(title, { x, y, fontSize: 15, bold: true, color: BLUE })
    s.addText(items.map((t) => ({ text: t, options: { bullet: true } })), { x, y: y + 0.35, w: 4.3, fontSize: 12, color: '3A3A3A' })
  }
  quad('Strengths', r.swot.strengths, 0.5, 1.1)
  quad('Weaknesses', r.swot.weaknesses, 5.1, 1.1)
  quad('Opportunities', r.swot.opportunities, 0.5, 3.2)
  quad('Threats', r.swot.threats, 5.1, 3.2)

  // Summary
  s = pptx.addSlide()
  s.addText('Executive summary', { x: 0.5, y: 0.4, fontSize: 24, bold: true })
  s.addText(r.executiveSummary, { x: 0.6, y: 1.2, fontSize: 15, color: '3A3A3A', w: 8.8 })

  pptx.writeFile({ fileName: fileName(r, 'pptx') })
}
