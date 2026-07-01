#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const sourcePath = path.join(process.cwd(), 'data/academy.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const referenceBlocks = [...source.matchAll(/references:\s*\[([^\]]*)\]/gs)]
const banned = /\b(TODO|TBD|placeholder|lorem|example\.com|fake)\b/i
const errors = []

if (referenceBlocks.length < 2) {
  errors.push(`Expected multiple reference blocks in data/academy.ts, found ${referenceBlocks.length}`)
}

referenceBlocks.forEach((match, index) => {
  const line = source.slice(0, match.index ?? 0).split('\n').length
  const items = [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((item) => item[1].trim())
  if (items.length === 0) errors.push(`references block ${index + 1} at line ${line} has no string references`)
  items.forEach((item, itemIndex) => {
    if (!item) errors.push(`references block ${index + 1}, item ${itemIndex + 1} is blank`)
    if (banned.test(item)) errors.push(`references block ${index + 1}, item ${itemIndex + 1} looks like placeholder text: ${item}`)
    if (item.length < 8) errors.push(`references block ${index + 1}, item ${itemIndex + 1} is too short to be useful: ${item}`)
  })
})

const hasAhj = /Authority Having Jurisdiction|AHJ/.test(source)
const hasSop = /\bSOPs?\b|Department SOP/.test(source)
const hasStandards = /NFPA|standards/i.test(source)
if (!hasAhj) errors.push('Catalog references should include AHJ/local-authority language')
if (!hasSop) errors.push('Catalog references should include department SOP language')
if (!hasStandards) errors.push('Catalog references should include standards/NFPA language')

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Catalog references verified: ${referenceBlocks.length} reference blocks, AHJ/SOP/standards language present, no placeholder references.`)
