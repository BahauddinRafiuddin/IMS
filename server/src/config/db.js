import mongoose from "mongoose";

const connectDb = async (params) => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully")
    })
    await mongoose.connect(`${process.env.MONGODB_URL}/ims-advance`)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

export default connectDb;