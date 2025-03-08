import mongoose from "mongoose";
// import * as mongodb from "mongodb";
import { MongoClient, ServerApiVersion } from 'mongodb';
// const MongoClient = mongodb.MongoClient;
// const mongoURI = `mongodb+srv://abubakarpagas:pagas2190@cluster0.u3fry.mongodb.net/?retryWrites=true&w=majority`;
const uri = "mongodb+srv://abubakarpagas:pagas2190@cluster0.u3fry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const clientOptions: mongoose.ConnectOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } }

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const connectDB = async () => {
  try {
    await mongoose.connect(uri,clientOptions);
    // const client = await MongoClient.connect(mongoURI);
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    // const connection = await mongoose.connect(DATABASE_CONNECTION_STRING);
  } catch (err) {
    console.log(err)
  }
  // export const MONGO_OPTIONS: mongoose.ConnectOptions = { retryWrites: true, w: 'majority' };
}

export default connectDB
