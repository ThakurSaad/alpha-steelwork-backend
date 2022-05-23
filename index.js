const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    //----------------------------  POST api ---------------------------- //

    // post order
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    //----------------------------  PUT api ---------------------------- //

    // update user
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
