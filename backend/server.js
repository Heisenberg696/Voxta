require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const pollRoutes = require("./routes/pollRoutes");

const app = express();

//middlewares
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

//Routes
app.use("/api/user", userRoutes);
app.use("/api/polls", pollRoutes);

// connect to database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("listening to port 4000");
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.get("/", (req, res) => {
  res.json({ mssg: "welcome to Voxta" });
});
