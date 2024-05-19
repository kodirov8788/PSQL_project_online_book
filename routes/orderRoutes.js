const express = require("express");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const Book = require("../models/Book");

const router = express.Router();

// Create a new order
router.post("/", auth, async (req, res) => {
  console.log("req.userId:", req.userId); // Debug log for userId
  console.log("req.body:", req.body); // Debug log for request body

  const { bookId, quantity } = req.body;
  if (!bookId || !quantity) {
    return res.status(400).json({ error: "Book ID and quantity are required" });
  }

  try {
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    const order = await Order.create({ userId: req.userId, bookId, quantity });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get orders for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.userId },
      include: [Book],
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get a single order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [Book],
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.userId !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update an order
router.put("/:id", auth, async (req, res) => {
  const { quantity } = req.body;
  if (!quantity) {
    return res.status(400).json({ error: "Quantity is required" });
  }

  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.userId !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    order.quantity = quantity;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete an order
router.delete("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.userId !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await order.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
