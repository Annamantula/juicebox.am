const {Client} = require('pg');

const client = new Client( 'postgres://localhost:5432/juicebox-dev1');

async function createUser({ username, password }) {
    try {
      const {rows} = await client.query(`
        INSERT INTO users(username, password)
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
      `, [username, password]);
  
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // later
  module.exports = {
    // add createUser here!
  }

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username 
    FROM users;
  `);

  return rows;
}

// and export them
module.exports = {
    client,
    getAllUsers,
    createUser
}