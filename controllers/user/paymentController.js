const Razorpay = require("razorpay");
const paypal = require("paypal-rest-sdk");
require("dotenv").config()
const crypto = require("crypto");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
const Order = require("../../models/orderSchema");


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
console.log("🔑 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
console.log("🔑 Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET ? "Loaded ✅" : "Not Loaded ❌");






const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount *100 , // Convert to paise
      currency,
      receipt: `order_rcptid_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
















const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const secret = "YOUR_RAZORPAY_SECRET"; // Replace with actual secret
    const hash = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (hash === razorpay_signature) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};








const generateInvoice = (req, res) => {
  const { orderId, amount, paymentId } = req.body;
  
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, `../invoices/invoice_${orderId}.pdf`);
  
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text("Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Order ID: ${orderId}`);
  doc.text(`Payment ID: ${paymentId}`);
  doc.text(`Amount: ₹${amount}`);
  doc.text(`Date: ${new Date().toLocaleString()}`);
  
  doc.end();

  res.download(filePath, `invoice_${orderId}.pdf`);
};






const webhook = async (req, res) => {
    const secret = "aimal123"; // Set in Razorpay Dashboard

    // Validate webhook signature
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

    if (signature !== expectedSignature) {
        return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body.event;
    const payment = req.body.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;

    try {
        if (event === "payment.captured") {
            await Order.findOneAndUpdate(
                { razorpayOrderId: orderId },
                { $set: { paymentStatus: "Paid", paymentId: paymentId } }
            );
            console.log(`Order ${orderId} marked as paid.`);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).json({ success: false, message: "Webhook handling failed" });
    }
};

// Function to Generate Invoice PDF
// const generateInvoice = (order, filePath) => {
//     const doc = new PDFDocument();
//     const stream = fs.createWriteStream(filePath);
     
//     console.log("🛠️ Invoice file path:", invoicePath);

//     doc.pipe(stream);

//     doc.fontSize(20).text("Invoice", { align: "center" });
//     doc.moveDown();
//     doc.fontSize(14).text(`Order ID: ${order.orderId}`);
//     doc.text(`Customer Name: ${order.customerName}`);
//     doc.text(`Total Amount: ₹${(order.totalAmount / 100).toFixed(2)}`);
//     doc.text(`Payment Status: ${order.paymentStatus}`);
//     doc.text(`Date: ${new Date().toLocaleString()}`);

//     doc.moveDown();
//     doc.text("Products:", { underline: true });

//     order.items.forEach((item, index) => {
//         doc.text(`${index + 1}. ${item.productName} - ₹${(item.price / 100).toFixed(2)} x ${item.quantity}`);
//     });

//     doc.moveDown();
//     doc.text("Thank you for your purchase!", { align: "center" });

//     doc.end();
// };



// const generateInvoice = async (orderId, paymentId, amount) => {
//     try {
//         if (!orderId || !paymentId || !amount) {
//             throw new Error("Missing required parameters for invoice generation.");
//         }

//         // Ensure invoices directory exists
//         const invoiceDir = path.join(__dirname, "../../invoices");
//         if (!fs.existsSync(invoiceDir)) {
//             fs.mkdirSync(invoiceDir, { recursive: true });
//         }

//         // Define invoice file path
//         const invoicePath = path.join(invoiceDir, `invoice-${orderId}.pdf`);

//         console.log("🛠️ Generating invoice at:", invoicePath);

//         // Create write stream
//         const writeStream = fs.createWriteStream(invoicePath);

//         // Sample content for now
//         writeStream.write(`Invoice for Order: ${orderId}\n`);
//         writeStream.write(`Payment ID: ${paymentId}\n`);
//         writeStream.write(`Amount Paid: ${amount} INR\n`);
        
//         writeStream.end();
        
//         console.log("✅ Invoice generated successfully!");
//         return invoicePath;
//     } catch (error) {
//         console.error("❌ Error generating invoice:", error);
//         throw error;
//     }
// };





// const downInv = (req, res) => {
//     const orderId = req.params.orderId;
//     const invoicePath = path.join(__dirname, `../../invoices/invoice-${orderId}.pdf`);

//     if (fs.existsSync(invoicePath)) {
//         res.download(invoicePath, `invoice-${orderId}.pdf`);
//     } else {
//         res.status(404).json({ message: "Invoice not found" });
//     }
// };

// ✅ Add this route in your `routes` file

const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Fetch order details from DB
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create PDF
    const doc = new PDFDocument();
    const filePath = `./invoices/invoice_${orderId}.pdf`;
    const writeStream = fs.createWriteStream(filePath);
    
    doc.pipe(writeStream);
    doc.text(`Invoice for Order: ${orderId}`);
    doc.text(`Total: ${order.totalAmount}`);
    doc.end();

    writeStream.on("finish", () => {
      res.download(filePath);
    });
  } catch (error) {
    console.error("Invoice Error:", error);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};




module.exports={
    createRazorpayOrder,
     verifyPayment,
   generateInvoice,
   downloadInvoice,
   webhook,
    

}
