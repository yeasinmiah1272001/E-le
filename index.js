const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 8000;

const cors = require("cors");

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qlvqjvw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // all db collectton here
    const database = client.db("yoga-master");
    const usersCollection = database.collection("users");
    const classesCollection = database.collection("classes");
    const cartCollection = database.collection("carts");
    const paymentCollection = database.collection("payment");
    const enrollCollection = database.collection("enroll");
    const appliedCollection = database.collection("applied");

    // ++++++++++++++clases routes++++++++++++++++++
    app.post("/new-classes", async (req, res) => {
      const newClasses = req.body;
      //   console.log("new cl", newClasses);
      const result = await classesCollection.insertOne(newClasses);
      console.log("result", result);
      res.send(result);
    });
    app.get("/classes", async (req, res) => {
      const query = { status: "approved" };
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    // classes find intructor by email
    app.get("/classes/:email", async (req, res) => {
      const email = req.params.email;
      const query = { instructorEmail: email };
      const result = await classesCollection.find(query).toArray();
      console.log("re", result);
      res.send(result);
    });
    app.get("/manage-class", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    // updated status
    app.patch("/change-status/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const reason = req.body.reason;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: status,
          reason: reason,
        },
      };

      const result = await classesCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // approved class routes
    app.get("/approved-class", async (req, res) => {
      const query = { status: "approved" };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });
    // single-class details
    app.get("/class/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.findOne(query);
      res.send(result);
    });

    // single updated
    app.put("/update-class/:id", async (req, res) => {
      const id = req.params.id;
      const updateClass = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateClass.name,
          description: updateClass.description,
          price: updateClass.price,
          availableSeats: parseInt(updateClass.availableSeats),
          videoLink: updateClass.videoLink,
          status: "pending",
        },
      };
      try {
        const result = await classesCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).send({ error: "Failed to update class" });
      }
    });
    // ++++++++++++++clases routes end++++++++++++++++++

    // ++++++++++++++Carts routes start+++++++++++++++++

    // ++++++++++++++Carts routes end+++++++++++++++++

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("e-learning server!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
