import neo4j, { Driver, Session } from 'neo4j-driver'

const URI = process.env.NEO4J_URI || 'neo4j+s://1bd133b8.databases.neo4j.io'
const USERNAME = process.env.NEO4J_USERNAME || 'neo4j'
const PASSWORD = process.env.NEO4J_PASSWORD || ''
const DATABASE = process.env.NEO4J_DATABASE || 'neo4j'

let driver: Driver | null = null

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(URI, neo4j.auth.basic(USERNAME, PASSWORD), {
      maxConnectionLifetime: 30 * 60 * 1000,
      maxConnectionPoolSize: 10,
      connectionAcquisitionTimeout: 2 * 60 * 1000,
    })
  }
  return driver
}

export function getSession(): Session {
  return getDriver().session({ database: DATABASE })
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close()
    driver = null
  }
}