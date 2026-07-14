const express = require("express");
const { supabase } = require("../supabase");

const router = express.Router();

const buildPayload = (body) => ({
  name: body.name || body.firstName || "Untitled",
  description: body.description || body.lastName || ""
});

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("playground_items").select("*").order("id", { ascending: true });
    if (error) {
      throw error;
    }
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch items", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  console.log("users.js GET /:id", req.params.id);
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

router.post("/", async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    const { data, error } = await supabase.from("playground_items").insert(payload).select().single();
    if (error) {
      throw error;
    }
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to create item", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    const { data, error } = await supabase.from("playground_items").update(payload).eq("id", req.params.id).select().single();
    if (error || !data) {
      return res.status(404).json({ message: "Item not found", error: error?.message || "No matching row" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to update item", error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  console.log("users.js PATCH /:id", req.params.id, req.body);
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

router.delete("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("playground_items").delete().eq("id", req.params.id).select();
    if (error || !data || data.length === 0) {
      return res.status(404).json({ message: "Item not found", error: error?.message || "No matching row" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item", error: error.message });
  }
});

module.exports = router;