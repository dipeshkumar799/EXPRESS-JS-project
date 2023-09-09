import mongoose from "mongoose";
const forexRateSchema = new mongoose.Schema({
  currency: {
    iso3: String,
    name: String,
    unit: Number,
  },
  buy: String,
  sell: String,
});

// Create a Mongoose model for the forex rates
const ForexRate = mongoose.model("ForexRate", forexRateSchema);
export default ForexRate;
