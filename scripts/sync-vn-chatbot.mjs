import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const source = path.resolve(process.env.ICUE_VN_REPO || path.join(root, '../ICUE-mainsite-vn'))
const adapters = new Set(['shared/chatbot/SiteChatbot.jsx', 'shared/chatbot/lib/knowledgeAssets.js'])
const files = {}

async function copyTree(relative) {
  for (const entry of await fs.readdir(path.join(source, relative), { withFileTypes: true })) {
    const file = `${relative}/${entry.name}`
    if (entry.isDirectory()) {
      if (entry.name !== 'source') await copyTree(file)
    } else if (!adapters.has(file) && !/\.test\.mjs$/.test(file)) {
      const bytes = await fs.readFile(path.join(source, file))
      await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true })
      await fs.writeFile(path.join(root, file), bytes)
      files[file] = createHash('sha256').update(bytes).digest('hex')
    }
  }
}

await copyTree('shared/chatbot')
await copyTree('shared/faq-content')
for (const locale of ['vi', 'en', 'de', 'fr', 'ko', 'ja']) {
  const relative = `public/chatbot/kb.${locale}.json`
  const bytes = await fs.readFile(path.join(source, relative))
  await fs.mkdir(path.join(root, 'public/chatbot'), { recursive: true })
  await fs.writeFile(path.join(root, relative), bytes)
  files[relative] = createHash('sha256').update(bytes).digest('hex')
}
await fs.writeFile(path.join(root, 'shared/chatbot/upstream.json'), `${JSON.stringify({
  source: 'ICUE-mainsite-vn',
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' }).trim(),
  files,
}, null, 2)}\n`)
console.log(`Reused ${Object.keys(files).length} Vietnamese chatbot files, including the original bird artwork.`)
