require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const path = require('path');
const dbPath = path.join(__dirname, 'dev.db');
const connectionString = process.env.DATABASE_URL || `file:${dbPath}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
