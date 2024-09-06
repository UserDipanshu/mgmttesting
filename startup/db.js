import mongoose from "mongoose";

function connect() {
  try {
    mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    console.log("connected to db");
  } catch (error) {
    console.log("Error is", error);
  }
}

export default {
  connect: connect,
};
