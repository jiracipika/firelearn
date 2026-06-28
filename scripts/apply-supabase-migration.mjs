import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import postgres from 'postgres'

const __dirname = dirname(fileURLToPath(import.meta.url))
const connectionString = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL

if (!connectionString) {
  console.error('Missing POSTGRES_URL_NON_POOLING or POSTGRES_URL. Refusing to run without a database connection string in the environment.')
  process.exit(1)
}

const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '001_firelearn_progress.sql')
const migration = await readFile(migrationPath, 'utf8')
const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 5,
  connect_timeout: 10,
})

try {
  await sql.unsafe(migration)
  console.log('Applied FireLearn Supabase progress migration successfully.')
} catch (error) {
  console.error('Failed to apply FireLearn Supabase progress migration:')
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
} finally {
  await sql.end({ timeout: 5 })
}
