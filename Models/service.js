import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ServiceSchema = new Schema({
  service: {
    type: String,
    required: true,
  },
  // USER _id
  requestor: {
    type: String,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
  // OPEN | CLAIMED | COMPLETED
  status: {
    type: String,
    required: true,
  },
});

const Model = model("SERVICE", ServiceSchema);

export const Service = Model;
