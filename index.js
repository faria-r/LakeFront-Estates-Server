const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const favouritesCollection = client
      .db("LakeFront-Estates")
      .collection("favourites");
    const schedulesCollection = client
      .db("LakeFront-Estates")
      .collection("schedules");

    //JWT Token
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "3h",
      });
      console.log(token);
      res.send({ token });
    });
    //verify Middlewares-jwt
    const verifyToken = (req, res, next) => {
      console.log("inside verify token", req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "unauthorized access" });
        }
        req.decoded = decoded;
        next();
      });
    };
    //verify admin

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    //admin
    app.get("/user/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    //API to store all user data in database
    app.post("/users", async (req, res) => {
      const user = req.body;
      //insert user if they doesnt exist
      //many ways for this(1.email.unique, 2.upsert,3.simple checking)
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    //store schedules
    app.post('/schedules',async(req,res)=>{
      const schedule = req.body;
      const result = await schedulesCollection.insertOne(schedule);
      res.send(result);
    })
    //get all schedules
app.get('/schedules',  verifyToken, verifyAdmin, async(req,res)=>{
  const query ={};
  const result = await schedulesCollection.find(query).toArray();
  res.send(result)
})
    //API to store users favourites
    app.post('/favourites', async(req,res)=>{
      const favourites = req.body;
      const query = {homeID : favourites.homeID,};
      const existingHome = await favouritesCollection.findOne(query);
      if(existingHome){
        return res.send({message:'already added to favourites', insertedId:null});
      }
      const result = await favouritesCollection.insertOne(favourites);
      res.send(result)
    }) 
    //API to get favourites based on users
    app.get('/favourites/:email', async (req,res)=>{
      const email = req.params.email;
      const query = {userEmail:email}
      const result = await favouritesCollection.find(query).toArray();
      res.send(result)
    })
    //API to get all users
    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    //delete a user
    app.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
    //
    app.patch(
      "/users/admin/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
      }
    );
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
        _id: new ObjectId(homeId),
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
