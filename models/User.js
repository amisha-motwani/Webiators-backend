const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    require:true
  },
  email: {
    type: String,
    require:true,
    unique:true
  },
  password: {
    type: String,
    require:true
  },
});

const User = module.exports =  mongoose.model("User",UserSchema);

module.exports = User;