import { readFile } from 'fs/promises'
import { resolve } from 'path'
import neo4j from 'neo4j-driver'

const URI = process.env.NEO4J_URI || 'neo4j+s://1bd133b8.databases.neo4j.io'
const USERNAME = process.env.NEO4J_USERNAME || 'neo4j'
const PASSWORD = process.env.NEO4J_PASSWORD || ''
const DATABASE = process.env.NEO4J_DATABASE || 'neo4j'

function splitStatements(cypher: string): string[] {
  const statements: string[] = []
  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let inLineComment = false
  let inBlockComment = false

  for (let i = 0; i < cypher.length; i++) {
    const char = cypher[i]
    const next = cypher[i + 1] || ''
    const prev = cypher[i - 1] || ''

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false
      }
      continue
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false
        i++
      }
      continue
    }

    if (!inSingleQuote && !inDoubleQuote) {
      if (char === '/' && next === '/') {
        inLineComment = true
        i++
        continue
      }
      if (char === '/' && next === '*') {
        inBlockComment = true
        i++
        continue
      }
    }

    if (!inDoubleQuote && char === "'" && prev !== '\\') {
      inSingleQuote = !inSingleQuote
    }
    if (!inSingleQuote && char === '"' && prev !== '\\') {
      inDoubleQuote = !inDoubleQuote
    }

    if (!inSingleQuote && !inDoubleQuote && char === ';') {
      const trimmed = current.trim()
      if (trimmed) {
        statements.push(trimmed)
      }
      current = ''
      continue
    }

    current += char
  }

  const trimmed = current.trim()
  if (trimmed) {
    statements.push(trimmed)
  }

  return statements
}

async function main() {
  const driver = neo4j.driver(URI, neo4j.auth.basic(USERNAME, PASSWORD), {
    maxConnectionLifetime: 30 * 60 * 1000,
    maxConnectionPoolSize: 1,
    connectionAcquisitionTimeout: 2 * 60 * 1000,
  })

  try {
    // Verify connection
    await driver.verifyConnectivity()
    console.log('[seed] Connected to Neo4j at', URI)

    // Read seed file
    const seedPath = resolve(__dirname, 'seed.cypher')
    const cypher = await readFile(seedPath, 'utf-8')
    console.log('[seed] Read seed.cypher (%d chars)', cypher.length)

    // Split and execute statements
    const statements = splitStatements(cypher)
    console.log('[seed] Found %d statements\n', statements.length)

    const session = driver.session({ database: DATABASE })

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      const short = stmt.length > 80 ? stmt.substring(0, 77) + '...' : stmt
      try {
        await session.run(stmt)
        console.log('  [%d/%d] OK  %s', i + 1, statements.length, short)
      } catch (err: any) {
        console.error('  [%d/%d] ERR %s', i + 1, statements.length, short)
        console.error('         ', err.message || err)
      }
    }

    // Verification queries
    console.log('\n[seed] Running verification...')

    const counts = [
      { label: 'User', query: 'MATCH (n:User) RETURN count(n) AS c' },
      { label: 'FarmerProfile', query: 'MATCH (n:FarmerProfile) RETURN count(n) AS c' },
      { label: 'Assessment', query: 'MATCH (n:Assessment) RETURN count(n) AS c' },
      { label: 'LoanProduct', query: 'MATCH (n:LoanProduct) RETURN count(n) AS c' },
      { label: 'LoanApplication', query: 'MATCH (n:LoanApplication) RETURN count(n) AS c' },
      { label: 'ChamaGroup', query: 'MATCH (n:ChamaGroup) RETURN count(n) AS c' },
      { label: 'MarketListing', query: 'MATCH (n:MarketListing) RETURN count(n) AS c' },
      { label: 'HAS_PROFILE', query: 'MATCH ()-[r:HAS_PROFILE]->() RETURN count(r) AS c' },
      { label: 'HAS_ASSESSMENT', query: 'MATCH ()-[r:HAS_ASSESSMENT]->() RETURN count(r) AS c' },
      { label: 'HAS_LOAN', query: 'MATCH ()-[r:HAS_LOAN]->() RETURN count(r) AS c' },
      { label: 'BELONGS_TO', query: 'MATCH ()-[r:BELONGS_TO]->() RETURN count(r) AS c' },
    ]

    for (const { label, query } of counts) {
      const result = await session.run(query)
      const count = result.records[0]?.get('c')
      console.log('  %-20s %s', label + ':', count)
    }

    await session.close()
    console.log('\n[seed] Done.')
  } catch (err: any) {
    console.error('[seed] Fatal:', err.message || err)
    process.exit(1)
  } finally {
    await driver.close()
  }
}

main()
