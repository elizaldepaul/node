const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

//image upload

var image = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: image,
}).single("image");

//insert into database
// router.post("/add", upload, (req, res) => {
//   const user = new User({
//     name: req.body.name,
//     email: req.body.email,
//     phone: req.body.phone,
//     image: req.file.filename,
//   });
//   user.save((error) => {
//     if (err) {
//       res.json({ message: err.message, type: "danger" });
//     } else {
//       req.session.message = {
//         type: "success",
//         message: "User Added Successfully",
//       };
//     }
//     res.redirect("/");
//   });
// });

router.post("/add_users", upload, (req, res) => {
  const user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    address: req.body.address,
    email: req.body.email,
    gender: req.body.gender,
    password: req.body.password,
    age: req.body.age,
    image: req.file.filename,
  });

  user
    .save()
    .then(() => {
      req.session.message = {
        type: "success",
        message: "User Added Successfully",
      };
      res.redirect("/add_users");
    })
    .catch((err) => {
      res.json({ message: err.message, type: "danger" });
    });
});

// this is where you customize or manipulate the redirection in your page bitch AHAHAHAHA aww w charot

router.get("/", (req, res) => {
  res.render("index", {
    title: "Dashboard",
    dashboard: "<span style='color: white; font-weight:bold;'>Dashboard</span>",
    add_users: "<span style='color: white;'>All Users</span>",
  }); // Render 'utilities-animation.ejs' as a web page
});

//show users
router.get("/add_users", async (req, res) => {
  const user = req.session.user;
  try {
    const users = await User.find({}).exec();
    res.render("add_users", {
      title: "All Users",
      add_users:
        "<span style='color: white; font-weight:bold;'>All Users</span>",
      dashboard: "<span style='color: white;'>Dashboard</span>",
      users: users,
      user: user,
    });
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

// Delete user
router.get("/delete_user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).exec();

    if (!user) {
      req.session.message = { type: "danger", message: "User not found" };
    } else {
      // Delete the user from the database
      await User.findByIdAndRemove(id).exec();

      // Delete the user's image (if it exists)
      if (user.image) {
        try {
          fs.unlinkSync("./uploads/" + user.image);
        } catch (err) {
          console.error(err);
        }
      }

      req.session.message = {
        type: "success",
        message: "User Deleted Successfully",
      };
    }

    res.redirect("/add_users");
  } catch (err) {
    console.error(err);
    res.json({ message: err.message, type: "danger" });
  }
});

router.get("/edit_users/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id).exec();

    if (!user) {
      // User not found
      res.redirect("/add_users");
      return;
    }

    res.render("edit_users", {
      title: "Edit User",
      add_users:
        "<span style='color: white; font-weight:bold;'>All Users</span>",
      dashboard: "<span style='color: white;'>Dashboard</span>",
      user: user,
    });
  } catch (err) {
    // Handle any errors, for example, database errors
    console.error(err);
    res.redirect("/add_users");
  }
});

//update users
router.post("/update/:id", upload, async (req, res) => {
  try {
    const id = req.params.id;
    let new_image = "";

    if (req.file) {
      new_image = req.file.filename;
      try {
        fs.unlinkSync("./uploads/" + req.body.old_image);
      } catch (err) {
        console.error(err);
      }
    } else {
      new_image = req.body.old_image;
    }

    // Use await to wait for the update operation to complete
    const result = await User.findByIdAndUpdate(id, {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      address: req.body.address,
      email: req.body.email,
      gender: req.body.gender,
      password: req.body.password,
      age: req.body.age,
      image: new_image,
    });

    // Check if the update was successful
    if (!result) {
      req.session.message = { type: "danger", message: "User not found" };
    } else {
      req.session.message = {
        type: "success",
        message: "User Updated Successfully",
      };
    }
    res.redirect("/add_users");
  } catch (err) {
    console.error(err);
    res.json({ message: err.message, type: "danger" });
  }
});

//delete users

// Create a login route
router.get("/login", (req, res) => {
  res.render("/", {
    title: "Login",
  });
});

// Inside your login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find a user by their email
    const user = await User.findOne({ email }).exec();

    if (!user) {
      // User not found
      req.session.message = {
        type: "danger",
        message: "User not found. Please check your email and password.",
      };
      return res.redirect("/login");
    }

    // Check the password
    if (user.password !== password) {
      // Incorrect password
      req.session.message = {
        type: "danger",
        message: "Incorrect password. Please try again.",
      };
      return res.redirect("/login");
    }

    // Login successful
    req.session.user = user; // Set the user in the session
    req.session.message = {
      type: "success",
      message: "Login successful. Welcome, " + user.first_name + "!",
    };
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.json({ message: err.message, type: "danger" });
  }
});

router.get("/dashboard", async (req, res) => {
  // Assuming you have a user object from your authentication process
  const user = req.session.user;

  res.render("dashboard", {
    title: "Dashboard",
    dashboard: "<span style='color: white; font-weight:bold;'>Dashboard</span>",
    add_users: "<span style='color: white;'>All Users</span>",
    user: user,
    // Pass the user's ID to the template
  });
});

router.get("/header", async (req, res) => {
  // Assuming you have a user object from your authentication process
  const user = req.session.user;

  res.render("dashboard", {
    title: "Dashboard",
    dashboard: "<span style='color: white; font-weight:bold;'>Dashboard</span>",
    add_users: "<span style='color: white;'>All Users</span>",
    user: user,
    // Pass the user's ID to the template
  });
});
// logout

module.exports = router;
