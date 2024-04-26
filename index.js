const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
//middleware
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
    await client.connect();
    //collection list
    const homeListCollection = client
      .db("LakeFront-Estates")
      .collection("HomeList");
    const categoryCollection = client
      .db("LakeFront-Estates")
      .collection("homeCategory");
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
          name: name};
        const result = await homeListCollection.find(query).toArray();
        console.log('api hit')
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
