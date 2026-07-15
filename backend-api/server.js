const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { supabase, supabaseHealth } = require("./supabase");

dotenv.config();

const app = express();
const userRoutes = require("./routes/users");

app.use(cors());
app.use(express.json());
app.use("/api/users", (req, res, next) => {
  console.log("API request to /api/users:", req.method, req.originalUrl);
  next();
});

app.all("/api/users/:id", (req, res, next) => {
  console.log("SERVER ALL /api/users/:id", req.method, req.params.id);
  next();
});

app.get("/api/users/:id", async (req, res) => {
  console.log("SERVER GET /api/users/:id", req.params.id);
  try {
    const { data, error } = await supabase.from("playground_items").select("*").eq("id", req.params.id).single();
    if (error || !data) {
      return res.status(404).json({ message: "Item not found", error: error?.message || "No matching row" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch item", error: error.message });
  }
});

app.patch("/api/users/:id", async (req, res) => {
  console.log("SERVER PATCH /api/users/:id", req.params.id, req.body);
  try {
    const payload = {};
    if (req.body.name !== undefined) payload.name = req.body.name;
    if (req.body.description !== undefined) payload.description = req.body.description;
    const { data, error } = await supabase.from("playground_items").update(payload).eq("id", req.params.id).select().single();
    if (error || !data) {
      return res.status(404).json({ message: "Item not found", error: error?.message || "No matching row" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to patch item", error: error.message });
  }
});

app.use("/api/users", userRoutes);

// Root: provide a simple redirect to the health endpoint so the service
// responds at `/` instead of showing "Cannot GET /" from Express.
app.get('/', (req, res) => {
  res.redirect('/api/health');
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await supabaseHealth();
    res.json({
      status: "SUCCESS",
      message: "QA Automation Playground API Running",
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
        publishableKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
        tableAccess: result
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Supabase connection failed",
      error: error.message,
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
        publishableKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
      }
    });
  }
});

app.listen(5000, () => {
  console.log("Server Started On Port 5000");
});