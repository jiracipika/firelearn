#!/usr/bin/env node
import https from 'node:https'

const baseUrl = process.env.FIRELEARN_PROD_URL ?? 'https://fflearn.vercel.app'
const checks = [
  { path: '/', markers: ['FireLearn'] },
  { path: '/courses', markers: ['FireLearn', 'course'] },
  { path: '/search', markers: ['Search FireLearn', 'FireLearn'] },
]

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'FireLearn smoke verifier' } }, (res) => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 400) {
          reject(new Error(`${url} returned HTTP ${res.statusCode}`))
          return
        }
        resolve(body)
      })
    }).on('error', reject)
  })
}

const failures = []
for (const check of checks) {
  const url = new URL(check.path, baseUrl).toString()
  try {
    const body = await fetchText(url)
    for (const marker of check.markers) {
      if (!body.includes(marker)) failures.push(`${url} missing marker: ${marker}`)
    }
    console.log(`OK ${url} (${body.length} bytes)`)
  } catch (error) {
    failures.push(`${url} failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Production smoke verified: ${checks.length} routes at ${baseUrl}`)
