
const mongoose=require("mongoose");
const {Schema}=mongoose;
const {v4:uuidv4} =require("uuid");








// const orderSchema = new mongoose.Schema({
//     orderId: { type: String, unique: true, required: true }, 
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     items: [
//         {
//             productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
//             quantity: { type: Number, required: true },
//             price: { type: Number, required: true },
//         },
//     ],
//     totalAmount: { type: Number, required: true },
//     shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: "UserAddress", required: true },
//     paymentMethod: { type: String, required: true },
//     discount: { type: Number, default: 0 }, 
//     razorpayOrderId: { type: String },
//     cancellationReason: { type: String, default: null },
//     returnReason: String,
    
//     paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" }, // ✅ New field
//     status: { type: String,enum: ["Pending", "Cancelled", "Delivered", "Return Requested", "Returned"], default: "Pending" }, // Pending, Paid, Shipped, Delivered
//     appliedReferralOffer: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Offer",
//         default: null
//     },
//     createdAt: { type: Date, default: Date.now },
// });






const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true, required: true }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: "UserAddress", required: true },
    paymentMethod: { type: String, required: true },
    discount: { type: Number, default: 0 }, 
    razorpayOrderId: { type: String },
    cancellationReason: { type: String, default: null },
    returnReason: String,
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    status: { type: String, enum: ["Pending", "Cancelled", "Delivered", "Return Requested", "Returned"], default: "Pending" },
    appliedReferralOffer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer",
        default: null
    },
    createdAt: { type: Date, default: Date.now },
});




const Order = mongoose.model("Order", orderSchema);


module.exports=Order;