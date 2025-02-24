const User = require("../../models/userSchema");
const Product = require("../../models/productSchema");
const Address = require("../../models/addressSchema");
const Order = require("../../models/orderSchema");
const mongodb = require("mongodb");
const mongoose = require('mongoose')
const env = require("dotenv").config();
const crypto = require("crypto");



const { v4: uuidv4 } = require("uuid");


const getOrderListPageAdmin = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdOn: -1 }) // Sort by createdOn in descending order
      .populate("userId"); // Populate userId field

    let itemsPerPage = 5;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(orders.length / itemsPerPage);

    // Filter orders to remove ones with missing users
    const validOrders = orders.filter(order => order.userId !== null);
    const currentOrder = validOrders.slice(startIndex, endIndex);

    res.render("order-list", { orders: currentOrder, totalPages, currentPage });
  } catch (error) {
    console.error(error);
    res.redirect("/pageerror");
  }
};





const changeOrderStatus = async (req, res) => {
  try {
      console.log("🔥 Request received for /changeOrderStatus");
      console.log("🔹 Request Body:", req.body);

      const { orderId, status } = req.body;

      if (!orderId || !status) {
          console.log("❌ Missing orderId or status");
          return res.status(400).json({ error: "Missing orderId or status." });
      }

      await Order.updateOne({ _id: orderId }, { status });

      console.log(`✅ Order ${orderId} status updated to ${status}`);

      return res.status(200).json({ message: "Order status updated successfully!" }); // ✅ Send success response
  } catch (error) {
      console.error("❌ Error updating order status:", error);
      return res.status(500).json({ error: "Internal Server Error" });
  }
};


const getOrderDetailsPageAdmin = async (req, res) => {
  try {
    const orderId = req.query.id;
    const findOrder = await Order.findOne({ _id: orderId });

    if (!findOrder) {
      console.log("Order not found!");
      return res.redirect("/pageerror");
    }

    if (!findOrder.items || !Array.isArray(findOrder.items) || findOrder.items.length === 0) {
      console.log("Order has no items!");
      return res.redirect("/pageerror");
    }

    let totalGrant = findOrder.items.reduce((acc, val) => acc + val.price * val.quantity, 0);
    const discount = totalGrant - findOrder.totalAmount;

    res.render("order-details-admin", {
      orders: findOrder,
      orderId: orderId,
      finalAmount: findOrder.totalAmount,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/pageerror");
  }
};


// 🛒 Place Order (Only COD)
const placeOrder = async (req, res) => {
  try {
    const { userId, products } = req.body;
    let totalAmount = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product?.name}` });
      }

      totalAmount += product.price * item.quantity;
      product.stock -= item.quantity; // ✅ Reduce stock when order is placed
      await product.save();
    }

    const newOrder = new Order({
      userId,
      products,
      totalAmount,
      paymentStatus: "Pending",
      orderStatus: "Pending",
      payment: "cod", // ✅ Only COD Payment
    });

    await newOrder.save();
    res.json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};




const cancelOrder = async (req, res) => {
  try {
      const { orderId } = req.body; // Extract orderId from the request body

      if (!orderId) {
          return res.status(400).json({ error: "Order ID is required" });
      }

      const findOrder = await Order.findOne({ _id: orderId });

      if (!findOrder) {
          return res.status(404).json({ error: "Order not found" });
      }

      if (findOrder.status === "Cancelled") {
          return res.status(400).json({ error: "This order has already been cancelled." });
      }

      findOrder.status = "Cancelled";
      await findOrder.save();

      // Restore product stock
      for (const productData of findOrder.items) { // Use `items` instead of `products`
          const product = await Product.findById(productData._id);
          if (product) {
              product.stock += productData.quantity;
              await product.save();
          }
      }

      return res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
      console.error("Error in cancelOrder:", error);
      return res.status(500).json({ error: "Internal Server Error" });
  }
};


// Get Inventory Page
const getInventory = async (req, res) => {
  try {
    const inventory = await Product.find().select('productName size color stock');
    res.render('inventory', { inventory,currentPage:"inventory" });
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard');
  }
};

 
const updateStock = async (req, res) => {
  try {
    console.log("Received Request Body:", req.body); // Debugging log

    const { productId, newStock } = req.body;

    if (!productId || isNaN(newStock) || newStock < 0) {
      return res.status(400).json({ error: "Invalid stock value or product ID" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { stock: newStock },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.redirect('/admin/inventory');
  } catch (err) {
    console.error("Stock update error:", err);
    res.status(500).json({ error: "Server error" });
  }
};





// 📌 Export Functions
module.exports = {
  getOrderListPageAdmin,
  changeOrderStatus,
  getOrderDetailsPageAdmin,
  placeOrder,
  cancelOrder,
  getInventory,
  updateStock,

};
