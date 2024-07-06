const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotesSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  store_domain: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  addresses: [
    {
      address1: {
        type: String,
      },
      address2: {
        type: String,
      },
      city: {
        type: String,
      },
      province: {
        type: String,
      },
      country: {
        type: String,
      },
      zip: {
        type: String,
      },
      // phone: {
      //   type: String,
      // },
      // name: {
      //   type: String,
      // },
    },
  ],
  amountSpent: [
    {
      amount: {
        type: String,
      },
      currencyCode: {
        type: String,
      },
    },
  ],
  verifiedEmail: {
    type: Boolean,
  },
}, { timestamps: true }); // Ensure timestamps option is placed here

module.exports = mongoose.model("Note", NotesSchema);
