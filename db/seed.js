const {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    getAllPosts,
    getUserById,
    updatePost
  } = require('./index');

  async function dropTables() {
    try {
      console.log("Starting to drop tables...");
  
      await client.query(`
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
      `);
  
      console.log("Finished dropping tables!");
    } catch (error) {
      console.error("Error dropping tables!");
      throw error;
    }
  }
  async function createTables() {
    try {
      console.log("Starting to build tables...");
  
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          active BOOLEAN DEFAULT true
        );
      `);
      await client.query(`
        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          "authId" INTEGER REFERENCES users(id) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true,
          CONSTRAINT unique_auth_id UNIQUE ("authId")
        );
      `);
      console.log("Finished building tables!");
    } catch (error) {
      console.error("Error building tables!");
      throw error;
    }
  }

  // new function, should attempt to create a few users
  async function createInitialUsers() {
    try {
      console.log("Starting to create users...");
  
      await createUser({ username: 'albert', password: 'bertie99', name:'Al Bert', location:'UK' });
      await createUser({ username: 'sandra', password: '2sandy4me', name:'San', location:'France' });
      await createUser({username: 'glamgal', password: 'soglam', name:'Glam', location:'Malasya' });
    
     console.log("Finished creating users!");
    } catch(error) {
      console.error("Error creating users!");
      throw error;
    }
  }

  async function createInitialPosts(){
      try{
          const[albert,sandra,galmal] = await getAllUsers();
          console.log("User Data:", albert,sandra,galmal)

        //   const createdPost = await createPost({
        //       "authId":albert.id,
        //       title: "First Post",
        //       content: "This is my first post.",
        //   });
        
        const authId = albert.id; // Example value, replace with the correct user ID
        const title = "First Post";
        const content = "This is my first post.";

    console.log("authId consolelog!!!!!:", authId);
    console.log("title!!!!:", title);
    console.log("content!!!!:", content);

    const createdPost = await createPost({
      authId,
      title,
      content,
    });
          const createdPost1 = await createPost({
            "authId":sandra.id,
            title: "First Sandra's Post",
            content: "This is SANDRA's first post.",
        });
          console.log('Created Post:', createdPost, createdPost1)
      }catch(error){
          throw error
      }
  }
  
  async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
      await createInitialPosts();
    } catch (error) {
      throw error;
    }
  }
  
  async function testDB() {
    try {
      console.log("Starting to test database...");

      console.log("Calling getAllUsers")
      const users = await getAllUsers();
      console.log("getAllUsers:", users);

      console.log("Calling updateUser on user[0]")
       const updateUserResult = await updateUser(users[0].id,{
           name: "Newname Sogood",
           location:"Lesterville, KY"
       });
     console.log("Result:", updateUserResult);

    console.log("Calling getAllPosts")
    const posts = await getAllPosts();
    console.log(" Result:", posts);
    if (posts.length>0){
    console.log("Calling updatePosts on posts[0]");
    console.log("posts[0].id:", posts[0].id,  posts[0].authId);
    const updatePostResult = await updatePost( posts[0].id, posts[0].authId,
     
        {
        title:"New Title",
        content:"Update Content"
}
    );
    console.log(" ResultUPOSTS:", updatePostResult);
}else{
    console.log("Nothing to update")
}

    console.log("Calling getUserById with")
    const albert = await getUserById(1);
    console.log(" Result:", albert);

      console.log("Finished database tests!");
    } catch (error) {
      console.error("Error testing database!");
      throw error;
    }
  }
  
  
  rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());