require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const pollRoutes = require("./routes/pollRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://voxta-3ecte53lw-swallieu-dawuds-projects.vercel.app", // Deployment URL
    "https://voxta.vercel.app", // Custom domain
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

//middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

//Routes
app.use("/api/user", userRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/comments", commentRoutes);

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
