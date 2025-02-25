require('dotenv').config();
const { client } = require('pg');
const client = new Client(process.env.DATABASE_URL);

module.exports = client;