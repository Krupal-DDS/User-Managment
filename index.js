const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
require('dotenv').config()

app.get("/", (req, res) => {
  res.send("jay swaminarayan");
});

app.set("views", "C:/krupal-learning/Task/User Managment/view");
app.set("view engine", "ejs");

//Use middleware
app.use(bodyparser.json());
const user = require("./route/U-route");
app.use("/", user);

//Connect to database
mongoose.connect("mongodb://localhost:27017/JK-solutions",{ useNewUrlParser: true },(error) => {
  if (!error) {
    console.log("connect to Database");
    
  } else {
      console.log(error.message);
    }
  }
);
app.listen(9999, () => {
  console.log("server is running");
});
