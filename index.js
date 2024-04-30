const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

//middleware use
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wxeycza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    //collection list
    const usersCollection = client.db("LakeFront-Estates").collection("Users");
    const homeListCollection = client
      .db("LakeFront-Estates")
      .collection("HomeList");
    const categoryCollection = client
      .db("LakeFront-Estates")
      .collection("homeCategory");
    const testimonialsCollection = client
      .db("LakeFront-Estates")
      .collection("testimonials");

    //API to store all user data in database
    app.post("/users", async (req, res) => {
      const user = req.body;
      //insert user if they doesnt exist
      //many ways for this(1.email.unique, 2.upsert,3.simple checking)
      const query= {email:user.email}
      const existingUser = await usersCollection.findOne(query);
      if(existingUser){
        return res.send({message:'user already exist',insertedId:null})
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
//API to get all users
app.get('/users', async(req,res)=>{
const query = {};
const result = await usersCollection.find(query).toArray();
res.send(result)
})
    //api to get all homelist
    app.get("/homeList", async (req, res) => {
      const query = {};
      const lists = await homeListCollection.find(query).toArray();
      console.log(lists.length);
      res.send(lists);
    });

    //API to get all Category
    app.get("/category", async (req, res) => {
      const query = {};
      const category = await categoryCollection.find(query).toArray();
      res.send(category);
    });

    //API to get category based homes
    app.get("/homes/:name", async (req, res) => {
      const name = req.params.name;
      const query = {
        name: name,
      };
      const result = await homeListCollection.find(query).toArray();
      res.send(result);
    });
    //API to get testimonials
    app.get("/testimonials", async (req, res) => {
      const query = {};
      const result = await testimonialsCollection.find(query).toArray();
      res.send(result);
    });
    //API to get specific home information
    app.get("/home/:id", async (req, res) => {
      const homeId = req.params.id;
      const query = {
        _id: homeId,
      };
      const result = await homeListCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

//test server msg
app.get("/", async (req, res) => {
  res.send("Lake Front server is running");
});

app.listen(port, () => console.log(`LakeFront Server is running at ${port}`));
