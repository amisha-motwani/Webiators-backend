const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//......................................Route 1......................................................

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user.id,
    });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//--------------------------------Route 2: To add notes---------------------
//-------------Add a new note using Post request: "localhost:5000/api/notes/addnote"-----------------------
router.post(
  "/addnote", 
  fetchuser,
  [
    body("store_domain", "Enter a store domain").isLength({ min: 1 }),
    body("firstName", "Enter a first name").isLength({ min: 1 }),
    body("lastName", "Enter a last name").isLength({ min: 1 }),
    body("email", "Enter a valid email").isEmail(),
    body("phone", "Enter a phone number").isLength({ min: 1 }),
    body("addresses.*.address1", "Enter address1").isLength({ min: 1 }),
    body("addresses.*.address2", "Enter address 2"),
    body("addresses.*.city", "Enter city name").isLength({ min: 1 }),
    body("addresses.*.province", "Enter province").isLength({ min: 1 }),
    body("addresses.*.country", "Enter country name").isLength({ min: 1 }),
    body("addresses.*.zip", "Enter zip code").isLength({ min: 1 }),
    // body("addresses.*.phone", "Enter a phone number").isLength({ min: 1 }),
    // body("addresses.*.name", "Enter a name").isLength({ min: 1 }),
    body("amountSpent.*.amount", "Enter an amount").isLength({ min: 1 }),
    body("amountSpent.*.currencyCode", "Enter a currency code").isLength({
      min: 1,
    }),
    body("verifiedEmail", "Verified email must be a boolean").isBoolean(),
  ],
  async (req, res) => {
    try {
      // If there are validation errors, return the errors and end the request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract fields from req.body using object destructuring
      const {
        store_domain,
        firstName,
        lastName,
        email,
        phone,
        addresses,
        amountSpent,
        verifiedEmail,
      } = req.body;

      // Create a new note with the extracted fields
      const note = new Note({
        user: req.user.id,
        store_domain,
        firstName,
        lastName,
        email,
        phone,
        addresses,
        amountSpent,
        verifiedEmail,
      });

      // Save the new note to the database
      const savedNotes = await note.save();

      // Respond with the saved note
      res.json(savedNotes);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

//-------------Route 3 : update and existing note---------------
//------------"localhost:5000/api/notes/updatenote/:id"-------------------------
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    //Extract title, description, tag from req.body by using object destruction
    const {
      store_domain,
      firstName,
      lastName,
      email,
      phone,
      addresses,
      amountSpent,
      verifiedEmail,
    } = req.body;
    const newNote = {};


    if (store_domain) {
      newNote.store_domain = store_domain;
    }
    if (firstName) {
      newNote.firstName = firstName;
    }
    if (lastName) {
      newNote.lastName = lastName;
    }
    if (email) {
      newNote.email = email;
    }
    if (phone) {
      newNote.phone = phone;
    }
    if (addresses) {
      newNote.addresses = addresses;
    }
    if (amountSpent) {
      newNote.amountSpent = amountSpent;
    }
    if (verifiedEmail) {
      newNote.amountSpent = verifiedEmail;
    }
    //Find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    //Allow update only id user owns this Note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//----------------------Route 4-----------------------
//-----this route 3 is to delete the note : "localhost:5000/api/notes/deletenote/:id"
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //Extract title, description, tag from req.body by using object destruction
    const { title, description, tag } = req.body;

    //Find the note to be deleted and delete it
    let note = await Note.findById(req.params.id); 
    if (!note) {
      return res.status(404).send("Not Found");
    }

    //Allow deletion only id user owns this Note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);

    res.json({
      Sucess: "Note has been deleted",
      note: note,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// -------------------------Route 4 : Search------------------------
// -------------------localhost:5000/api/notes/fetchallSearchednotes?q= -----------------------
router.get("/fetchallSearchednotes", fetchuser, async (req, res) => {
  try {
    const searchTerm = req.query.q || "";
    const notes = await Note.find({
      user: req.user.id,
      $or: [
        { firstName: { $regex: new RegExp(searchTerm, "i") } },
        { lastName: { $regex: new RegExp(searchTerm, "i") } },
        { store_domain: { $regex: new RegExp(searchTerm, "i") } },
        { email: { $regex: new RegExp(searchTerm, "i") } },
        { "addresses.address1": { $regex: new RegExp(searchTerm, "i") } },
        { "addresses.address2": { $regex: new RegExp(searchTerm, "i") } },
        { "addresses.city": { $regex: new RegExp(searchTerm, "i") } },
        { "addresses.country": { $regex: new RegExp(searchTerm, "i") } },
        { "amountSpent.amount": { $regex: new RegExp(searchTerm, "i") } },
        { "amountSpent.currencyCode": { $regex: new RegExp(searchTerm, "i") } },
      ],
    }).sort({ createdAt: -1 }); // Sort by creation date in descending order

    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;
