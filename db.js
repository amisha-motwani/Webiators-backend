const mongoose = require("mongoose");
const mongoURL = "mongodb://localhost:27017/Webiators";
const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');

//app.use is a middlewere , this line is for to recieve any data from req.body
app.use(express.json());
app.use(cors());

const connectToMongodb = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

// Load environment variables from .env file
require('dotenv').config();

//Availale routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.get('/', (req, res) => {
  res.send('Hello Amisha')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = connectToMongodb;
