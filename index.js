const express = require('express');
const cors = require('cors');
// jwt
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middleware 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2a9l2qr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
     serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
     }
});


// jwt verify start 
const verifyJwt = (req, res, next) => {
     const authorization = req.headers.authorization;

     if (!authorization) {
          return res.status(401).send({ error: true, message: 'unauthorized access' })
     }
     const token = authorization.split(' ')[1];
     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
               return res.status(403).send({ error: true, message: 'unauthorized access' })
          }
          req.decoded = decoded;
          next();
     })
}
// jwt verify end


async function run() {
     try {
          // Connect the client to the server	(optional starting in v4.7)
          // await client.connect();

          const menuCollection = client.db('bistroDB').collection('menu');
          const reviewCollection = client.db('bistroDB').collection('reviews');
          const cardCollection = client.db('bistroDB').collection('cards');
          const usersCollection = client.db('bistroDB').collection('users');

          // jwt localhost start
          app.post('/jwt', (req, res) => {
               const user = req.body;
               const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '2h'
               });
               res.send({ token });
          })
          // jwt localhost end

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

          // Warning: use verifyJWT before using verifyAdmin
          const verifyAdmin = async (req, res, next) => {
               const email = req.decoded.email;
               const query = { email: email }
               const user = await usersCollection.findOne(query);
               if (user?.role !== 'admin') {
                    return res.status(403).send({ error: true, message: 'forbidden message' });
               }
               next();
          }

          app.get('/users', verifyJwt, verifyAdmin, async (req, res) => {
               const cursor = usersCollection.find();
               const result = await cursor.toArray();
               res.send(result);
          })

          // user information post dataBD start 
          app.post('/users', async (req, res) => {
               const user = req.body;
               const result = await usersCollection.insertOne(user)
               res.send(result);
          });
          // user information post dataBD exit

          // user admin check start
          app.get('/users/admin/:email', verifyJwt, async (req, res) => {
               const email = req.params.email;

               if (req.decoded.email !== email) {
                    res.send({ admin: false })
               }

               const query = { email: email }
               const user = await usersCollection.findOne(query);
               const result = { admin: user?.role === 'admin' }
               res.send(result);
          })
          // user admin check end

          // user admin role added start
          app.patch('/users/admin/:id', async (req, res) => {
               const id = req.params.id;
               console.log(id);
               const filter = { _id: new ObjectId(id) };
               const updateDoc = {
                    $set: {
                         role: 'admin'
                    },
               };
               const result = await usersCollection.updateOne(filter, updateDoc);
               res.send(result);
          })
          // user admin role added exit


          // added card collection
          app.get('/cards', verifyJwt, async (req, res) => {

               const email = req.query.email;
               if (!email) {
                    res.send([]);
               }

               // jwt verifyJwt start
               const decodedEmail = req.decoded.email;
               if (email !== decodedEmail) {
                    return res.status(403).send({ error: true, message: 'forbidden access' })
               }
               // jwt verifyJwt end

               const query = { email: email };
               const result = await cardCollection.find(query).toArray();
               res.send(result);
          });

          app.post('/cards', async (req, res) => {
               const item = req.body;
               const result = await cardCollection.insertOne(item);
               res.send(result);
          });

          //jwt card data delete start
          app.delete('/cards/:id', async (req, res) => {
               const id = req.params.id;
               const query = { _id: new ObjectId(id) }
               const result = await cardCollection.deleteOne(query);
               res.send(result);
          })
          // card data delete exit

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