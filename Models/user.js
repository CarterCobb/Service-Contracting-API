import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => {
        return Model.find({ email: value }).exec((err, users) => {
          if (err) console.log(err);
          return users.length === 0;
        });
      },
    },
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  // USER || CONTRACTOR || ADMIN
  role: {
    type: String,
    required: true,
  },
});

const Model = model("USER", UserSchema);

export const User = Model;
