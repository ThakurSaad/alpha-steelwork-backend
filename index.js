const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const res = require("express/lib/response");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rub0a.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    console.log("mongo eating steel");

    const toolsCollection = client.db("alpha_steelwork").collection("tools");
    const ordersCollection = client.db("alpha_steelwork").collection("orders");
    const usersCollection = client.db("alpha_steelwork").collection("users");
    const reviewsCollection = client
      .db("alpha_steelwork")
      .collection("reviews");

    //----------------------------  GET api ---------------------------- //

    // all tools
    app.get("/tools", async (req, res) => {
      const tools = await toolsCollection.find().toArray();
      res.send(tools);
    });

    // single tool
    app.get("/tool/purchase/:purchaseId", async (req, res) => {
      const id = req.params.purchaseId;
      const query = { _id: ObjectId(id) };
      const tool = await toolsCollection.findOne(query);
      res.send(tool);
    });

    // my orders
    app.get("/order", async (req, res) => {
      const customer = req.query.customer;
      const orders = await ordersCollection
        .find({ customer: customer })
        .toArray();
      res.send(orders);
    });

    // single order
    app.get("/order/:id", async (req, res) => {
      const product = req.params.id;
      const query = { _id: ObjectId(product) };
      const order = await ordersCollection.findOne(query);
      res.send(order);
    });

    // current user
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      res.send(user);
    });

    // all user
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    // check admin role
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    // all reviews
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewsCollection.find().toArray();
      res.send(reviews);
    });

    //----------------------------  POST api ---------------------------- //

    // post order
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    // post new tool
    app.post("/tools", async (req, res) => {
      const tool = req.body;
      const result = await toolsCollection.insertOne(tool);
      res.send(result);
    });

    // post new review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    //----------------------------  PUT api ---------------------------- //

    // update user data from my profile
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      console.log(user, email);
      const filter = { email: email };
      const updateDoc = {
        $set: {
          education: user.education,
          address: user.address,
          contact: user.contact,
          linkedIn: user.linkedIn,
          faceBook: user.faceBook,
          hobby: user.hobby,
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // update user on signUp
    app.put("/users", async (req, res) => {
      const email = req.query.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.send({ result, token });
    });

    // make admin
    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //----------------------------  DELETE api ---------------------------- //

    // delete my order
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const order = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(order);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Iron worker continues to hit");
});

app.listen(port, (req, res) => {
  console.log("steel hitting up on", port);
});
