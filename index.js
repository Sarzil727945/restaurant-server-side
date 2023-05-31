const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middleware 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2a9l2qr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
     serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
     }
});

async function run() {
     try {
          // Connect the client to the server	(optional starting in v4.7)
          // await client.connect();

          const menuCollection = client.db('bistroDB').collection('menu');
          const reviewCollection = client.db('bistroDB').collection('reviews');
          const cardCollection = client.db('bistroDB').collection('cards');


          app.get('/menu', async (req, res) => {
               const cursor = menuCollection.find();
               const result = await cursor.toArray();
               res.send(result);
          })

          app.get('/reviews', async (req, res) => {
               const cursor = reviewCollection.find();
               const result = await cursor.toArray();
               res.send(result);
          })


          //card collection
          app.get('/cards', async (req, res) => {
               const email = req.query.email;
               if (!email) {
                    res.send([]);
               }
               const query = {email: email};
               const result = await cardCollection.find(query).toArray();
               res.send(result);
          });

          app.post('/cards', async(req , res)=>{
               const item = req.body;
               const result = await cardCollection.insertOne(item);
               res.send(result);
          })

          // Send a ping to confirm a successful connection
          await client.db("admin").command({ ping: 1 });
          console.log("Pinged your deployment. You successfully connected to MongoDB!");
     } finally {
          // Ensures that the client will close when you finish/error
          //     await client.close();
     }
}
run().catch(console.dir);


app.get('/', (req, res) => {
     res.send('Restaurant server running')
})

app.listen(port, () => {
     console.log(`server is running on port: ${port}`);
})

/*
-----------------------------------------------
                  NAMING CONVENTION
-----------------------------------------------
users : userCollection
* app.post('/users')
* app.get('/users')
* app.get('/users/:id')
* app.put('/users/:id')
* app.patch('/users/:id')
* app.delete('/users/:id')



*/  