const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const { query, response } = require("express");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8uujieu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  //   client.close();
});

function verifyAccess(req, res, next) {
  const authKey = req.headers.authorization;
  if (!authKey) {
    return res.status(401).send({ message: "unAuthorized Access" });
  }
  const token = authKey.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if (err) {
      return res.status(403).send({ message: "unAuthorized Accessed" });
    }
    req.decoded = decoded;
    next();
  });
  //console.log(req.headers.authorization) 
  // next();
}

async function run() {
  try {
    const userCollection = client.db("nodemongocard").collection("users");
    const regCollection = client.db("nodemongocard").collection("registation");
    const registationCollection = client
      .db("nodemongocard")
      .collection("registation");

    //user read
    app.get("/users", async (req, res) => {
      
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });
    //register read
    app.get("/registation", async (req, res) => {
      const cursor = regCollection.find({});
      const registation = await cursor.toArray();
      res.send(registation);
    });

    //jwt post
    app.post("/jwt", (req, res) => {
      const user = req.body;
      //console.log("Server JWT : ", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10h",
      });
      res.send({ token });
    });

    //registion post
    app.post("/registation", async (req, res) => {
      const registation = req.body;
      //console.log(registation);
      const result = await registationCollection.insertOne(registation);
      res.send(result);
    });

    //post
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //delete
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
      //console.log("trynig delete",id);
    });

    //update
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }; //{ _id: ObjectId(id) }
      //console, log(query);
      const result = await userCollection.findOne(query);
      //console.listen(result);
      res.send(result);
    });

    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) }; //{ _id: ObjectId(id) }
      const user = req.body;
      const option = { upsert: true };
      const updatedUser = {
        $set: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          Amount: user.Amount,
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedUser,
        option
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", async (req, res) => {
  res.send("Job Task server is running.......!");
});

app.listen(port, () => console.log(`Job task ${port}`));
