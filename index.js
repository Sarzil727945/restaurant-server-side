const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// require('dotenv').config();

// middleware 
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
     res.send('Restaurant server running')
})

app.listen(port, () => {
     console.log(`server is running on port: ${port}`);
})