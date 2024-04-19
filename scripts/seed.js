const { db } = require("@vercel/postgres")

async function seedUsers(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    // Create the "users" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        role VARCHAR(100) NOT NULL
      );
    `

    console.log(`Created "users" table`)

    return {
      createTable,
    }
  } catch (error) {
    console.error("Error creating table users:", error)
    throw error
  }
}

async function seedBoloes(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    // Create the "boloes" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS boloes (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        competition_id VARCHAR(100) NOT NULL,
        created_by VARCHAR(100) NOT NULL,
        created_at DATE NOT NULL
      );
    `

    console.log(`Created "boloes" table`)

    return {
      createTable,
    }
  } catch (error) {
    console.error("Error creating table boloes:", error)
    throw error
  }
}

async function seedUserBolao(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    // Create the "UserBolao" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS user_bolao (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        bolao_id VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL
      );
    `

    console.log(`Created "boloes" table`)

    return {
      createTable,
    }
  } catch (error) {
    console.error("Error creating table boloes:", error)
    throw error
  }
}

async function main() {
  const client = await db.connect()

  await seedUsers(client)
  await seedBoloes(client)
  await seedUserBolao(client)

  await client.end()
}

main().catch((err) => {
  console.error("An error occurred while attempting to seed the database:", err)
})
