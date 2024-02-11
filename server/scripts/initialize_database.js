const { MongoClient } = require('mongodb');

async function initializeDatabase() {
  // Your MongoDB connection URI
  const dbName = 'DocuLabeler'; 
  const uri = 'mongodb://127.0.0.1:27017'; 
  const client = new MongoClient(uri, { useNewUrlParser: true });

  try {
    await client.connect();

    const db = client.db(dbName);
    const adminDb = client.db('admin');
    const dbList = await adminDb.admin().listDatabases();
    const dbNames = dbList.databases.map((db) => db.name);

    if (dbNames.includes(dbName)) {
      // If the database doesn't exist, create it
      throw new MessageEvent("The database \"DocuLabeler\" already exists.")
    }

    const collections = [
        {
          name: 'Projects'
        },
        {
          name: 'TaskAnnotations'
        },
        {
          name: 'Tasks'
        },
        {
          name: 'Users'
        }
      ];
  
    for (const collectionInfo of collections) {
        await db.createCollection(collectionInfo.name);
    }

    console.log('Database initialization complete.');
  } catch (error) {
    console.error("Error during database initialization: ", error.type)
  }
  finally {
    client.close();
  }
}

initializeDatabase();