import express from "express";
import mongoose from "mongoose";
import path from "path";
import Student from "./model/data.js";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import forexData from "./forex/forex.js";
import ForexRate from "./model/forexType.js";
import Note from "./model/note.js";
const app = express();
app.use(express.json());
const port = 3000;
app.use(cookieParser());

app.use(express.static(path.join(path.resolve(), "public")));
app.use(
  express.urlencoded({
    extended: true,
  })
);
// getting-started.js

mongoose.set("strictQuery", true);

main().catch((err) => console.log(err));

async function main() {
  const connection = await mongoose.connect(
    "mongodb://127.0.0.1:27017/camera-data",
    {}
  );
  console.log(" data-base connected successfull.......");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
// app.set("view engine", "ejs")

app.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const user = await Student.findOne({ email: email });

    if (user) {
      res.send("user is already exist");
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    // Store hash in your password DB.
    const userInstance = await Student.create({
      email,
      password: hash,
      firstName,
      lastName,
      isLoggedIn: false,
    });
    console.log(userInstance);
    await userInstance.save();
    res.send(userInstance);
  } catch (e) {
    res.send(e);
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Student.findOne({ email: email });
    if (!user) {
      return res.send("User not found");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.send("Password doesn't match");
    }

    user.isLoggedIn = true;
    const userUpdate = await user.save();
    // Clear the password field before sending the user object
    userUpdate.password = null;

    // Send the updated user object as a response
    res.send(userUpdate);
  } catch (e) {
    // Handle errors and send a response with a 500 status code and the error message
    console.error(e);
    res.send("Internal Server Error");
  }
});
app.post("/forgotpassword", async (req, res) => {
  try {
    const { email, newpassword, currentpassword } = req.body;
    const user = await Student.findOne({ email: email });

    if (!user) {
      return res.send("Invalid email");
    }

    // Check if the provided current password matches the stored password
    const isValidPassword = await bcrypt.compare(
      currentpassword,
      user.password
    );
    if (!isValidPassword) {
      return res.send("Current password is incorrect");
    }
    // Hash the new password
    const saltRounds = 10; // You should define this constant somewhere
    const hash = await bcrypt.hash(newpassword, saltRounds);
    // Update the user's password and isLoggedIn status
    user.password = hash;
    user.isLoggedIn = true;
    // Save the updated user object to the database
    await user.save();
    return res.send("Your password was changed successfully");
  } catch (e) {
    console.error(e);
    return res.send("Internal Server Error");
  }
});
app.post("/logout", async (req, res) => {
  try {
    const { id } = req.body;
    const user = await Student.findById(id);

    if (!user) {
      return res.send("User not found");
    }

    if (!user.isLoggedIn) {
      return res.send("User not logged in");
    }

    // Update the user's isLoggedIn status to false
    user.isLoggedIn = false;

    // Save the updated user object
    await user.save();

    // Clear the password field before sending the user object
    user.password = null;

    return res.send("User successfully logged out");
  } catch (e) {
    console.error(e);
    return res.send("Internal Server Error");
  }
});
app.put("/update", async (req, res) => {
  try {
    const { id, firstName, lastName } = req.body;
    const user = await Student.findById(id);
    console.log(user);
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.isLoggedIn) {
      throw new Error("User not logged in");
    }

    const updateUser = await Student.updateOne(
      { _id: new mongoose.Types.ObjectId(id) }, // Use mongoose.Types.ObjectId here
      { firstName, lastName }
    );
    console.log(updateUser);

    // Return the updated user data in the response
    return res.send({ ...user.toObject(), firstName, lastName });
  } catch (e) {
    console.error(e);
    // If an error occurs, return an error response
    return res.send({ error: e.message });
  }
});
app.delete("/deleteData", async (req, res) => {
  try {
    const { _id } = req.body;
    const user = await Student.findById({ _id: _id });

    if (!user) {
      return res.send("user not found");
    }
    if (!user.isLoggedIn) {
      return res.send("user not loggedin");
    }
    const deleteUser = await Student.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    return res.send(
      `Student ${user.firstName} ${user.lastName} deleted successfully`
    );
  } catch (e) {
    console.error(e);
  }
});
app.get("/fetch-forex-data", async (req, res) => {
  try {
    const rates = await forexData(); // Fetch forex data using your function
    console.log("Forex Rates:", rates);

    // Save the fetched forex rates to the database using your Mongoose model
    for (const rate of rates) {
      const forexRate = new ForexRate(rate);
      await forexRate.save();
    }

    res
      .status(200)
      .json({ message: "Forex data fetched and saved successfully." });
  } catch (error) {
    console.error("Error fetching forex data:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/note", async (req, res) => {
  try {
    const { title, content } = req.body;
    const noteInstance = new Note({ title, content });
    const saveNote = await noteInstance.save();
    console.log(saveNote);
    res.send(noteInstance);
  } catch (error) {
    return res.send(error);
  }
});
app.get("/getnotes", async (req, res) => {
  try {
    const getNote = await Note.find();
    console.log(getNote);
    res.send(getNote);
  } catch (error) {
    return res.send(error);
  }
});
app.get("/getnote/:id", async (req, res) => {
  try {
    const getNote = await Note.findById(req.params.id);
    console.log(getNote);
    if (!getNote) {
      return res.send("note not found");
    }
    res.send(getNote);
  } catch (error) {
    return res.send(error);
  }
});

app.listen(port, () => {
  console.log(`server is running on port at:http://localhost:${port}`);
});
