const express = require("express");
const cors = require("cors");

const app = express();

const userRoutes = require("./routes/users");

app.use("/api/users", userRoutes);

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "SUCCESS",
    message: "QA Automation Playground API Running"
  });
});

app.listen(5000, () => {
  console.log("Server Started On Port 5000");
});