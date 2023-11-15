const {Client} = require('pg');
const { resourceLimits } = require('worker_threads');

const client = new Client( 'postgres://localhost:5432/juicebox-dev1');

async function createUser({
    username, 
    password,
    name,
    location 
}) {
    try {
      const {rows:[user]} = await client.query(`
        INSERT INTO users(username, password,name,location)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
      `, [username, password, name, location]);
  
      return user;
    } catch (error) {
      throw error;
    }
  }

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active  
    FROM users;
  `);

  return rows;
}

async function updateUser(id,fields ={}){

    const setString = Object.keys(fields).map(
      (key,index) => `"${key}"=$${index +1}`
    ).join(',');

    if(setString.length ===0){
        return;
    }

    try{
        const {rows:[user]} = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id =${id}
        RETURNING *;
        `, Object.values(fields));

        return user;
        }catch (error){
            throw error;
        }
    }
    async function createPost({
        authId, 
        title,
        content
    }) {
        try {
          const {rows:[post]} = await client.query(`
            INSERT INTO posts("authId",title,content)
            VALUES ($1,$2,$3) 
            ON CONFLICT ("authId") DO NOTHING 
            RETURNING *;
          `, [authId,title,content]);
      
          return post;
        } catch (error) {
          throw error;
        }
        
      }
      async function updatePost(id,authId,fields ={}){
        const setString = Object.keys(fields)
        .map((key,index) => `"${key}"=$${index +3}`).join(',');
    
        if(setString.length ===0){
            return;
        }
        try{
            const { rows } = await client.query(`
            UPDATE posts
            SET ${setString}
            WHERE id =$1 AND "authId" = $2
            RETURNING *;
            `,[id,authId, ...Object.values(fields)]);

            if(rows.length ===0){
                throw new Error ("post not found")
            }
            return rows[0];
            }catch (error){
                throw error;
            }
        }
     async function getAllPosts() {
         const { rows } = await client.query(
              `SELECT * 
              FROM posts;
        `);
            return rows;
          }

     async function getPostByUser(userId){
         try{
             const { rows } = await client.query(`
             SELECT * FROM posts
             WHERE "authId"=$1
             `,[userId]);
          
         return rows;
         }catch(error){
             throw error;
         }
    }
    async function getUserById(userId){
        try{
            const userQuery = await client.query(`
                SELECT * FROM users
                WHERE id =$1
                `,[userId]);
        if(!userQuery.rows.length){
        return null
        }
        const user = userQuery.rows[0]
            delete user.password

        const posts = await getPostByUser(userId)
            user.posts= posts;
            return user;
        }catch(error){
            throw error
        }
    };
      
module.exports = {
    client,
    createUser,
    getAllUsers,
    updateUser,
    createPost,
    getAllPosts,
    getUserById ,
    updatePost
}