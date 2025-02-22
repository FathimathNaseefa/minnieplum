const Product=require("../../models/productSchema")
const Category=require("../../models/categorySchema");
const User = require("../../models/userSchema");
const Order = require("../../models/orderSchema");
const Address = require("../../models/addressSchema");







const orderDetails = async (req, res) => {
    
        try {
            const orderId = req.params.id;
        
    
            const order = await Order.findById(orderId)
            .populate(({
                path: "shippingAddress",
                model: "UserAddress" // Ensure this matches your model name
            }))
            .populate("items.productId");; 
    
            if (!order) {
                console.log("Order not found in database"); // Debugging
                return res.status(404).render("orderNotFound");
            } if (!order.shippingAddress) {
                console.error("Shipping Address not found for order:", orderId);
            }
    
            console.log("Order fetched:", order); // Debugging
            res.render("order-details", { order });
        } catch (error) {
            console.error("Error fetching order details:", error);
            res.redirect("/pageNotFound");
        }
    };

    

    // const updateOrderStatus = async (req, res) => {
    //     try {
    //         const { orderId, status } = req.body;
    
    //         // Allowed status changes
    //         const validStatusUpdates = {
    //             "Pending": ["Cancelled"],
    //             "Shipped": [],
    //             "Delivered": ["Returned"]
    //         };
    
    //         const order = await Order.findById(orderId);
    //         if (!order) return res.status(404).json({ error: "Order not found" });
    
    //         if (!validStatusUpdates[order.status].includes(status)) {
    //             return res.status(400).json({ error: "Invalid status transition" });
    //         }
    
    //         // Update order status
    //         order.status = status;
    //         await order.save();
    
    //         return res.json({ success: true, message: `Order ${status} successfully`, updatedStatus: status });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ error: "Server error" });
    //     }
    // };


    
// Update order status route
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status, reason } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Save cancellation reason
        if (status === "Cancelled") {
            order.cancellationReason = reason;
        }

        // Handle Razorpay refund logic
        let refundMessage = "";
        if (status === "Cancelled" && order.paymentMethod === "Razorpay") {
            refundMessage = "Your payment will be added to your wallet in 24 hours.";
            order.refundStatus = "Processing"; // You can later implement a real refund process
        }

        order.status = status;
        await order.save();

        res.json({ success: true, message: "Order status updated", paymentMethod: order.paymentMethod, refundMessage });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// const getCancelOrder=async (req, res) => {
//     try {
//         const orderId = req.params.orderId;
//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).send("Order not found.");
//         }

//         res.render("cancel-order", { order });
//     } catch (error) {
//         console.error("Error loading cancellation page:", error);
//         res.status(500).send("Internal server error.");
//     }
// }
    
// const cancelOrder=async (req, res) => {
//     try {
//         const { orderId, reason } = req.body;

//         if (!orderId || !reason) {
//             return res.status(400).json({ success: false, message: "Missing required fields" });
//         }

//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         // Save cancellation reason
//         order.status = "Cancelled";
//         order.cancellationReason = reason;

//         let refundMessage = "";

//         // If payment was Razorpay, process refund to wallet
//         if (order.paymentMethod === "Razorpay") {
//             refundMessage = "Your payment will be credited to your wallet within 24 hours.";
//             order.refundStatus = "Processing"; 
//             order.walletCreditDate = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
//         }

//         await order.save();

//         res.json({ success: true, message: refundMessage || "Order cancelled successfully!" });
//     } catch (error) {
//         console.error("Error cancelling order:", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };

// const cancelOrder = async (req, res) => {
//     try {
//         const { orderId, reason } = req.body;

//         if (!orderId || !reason) {
//             return res.status(400).json({ success: false, message: "Missing required fields" });
//         }

//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         order.status = "Cancelled";
//         order.cancellationReason = reason;

//         let refundMessage = "Order cancelled successfully!";

//         if (order.paymentMethod === "Razorpay") {
//             try {
//                 // Process refund in Razorpay
//                 const refund = await razorpayInstance.payments.refund(order.transactionId, {
//                     amount: order.totalAmount * 100 // Convert to paise
//                 });

//                 refundMessage = "Refund initiated! Your payment will be credited within 24 hours.";
//                 order.refundStatus = "Processing"; 
//                 order.walletCreditDate = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
//             } catch (error) {
//                 console.error("Refund error:", error);
//                 return res.status(500).json({ success: false, message: "Refund processing failed" });
//             }
//         }

//         await order.save();

//         console.log("Order Cancelled:", order);
        
//         return res.render("cancel-order", { message: refundMessage }); // Render with refund message
//     } catch (error) {
//         console.error("Error cancelling order:", error);
//         return res.status(500).send("Internal server error");
//     }
// };




// Cancel Order
// const cancelOrder = async (req, res) => {
//     try {
//         const { orderId, reason } = req.body;

//         let order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         // Update order status and reason
//         order.status = "Cancelled";
//         order.cancellationReason = reason;
//         await order.save();

//         let message = "Your order has been cancelled successfully.";
        
//         // If the payment was online (Razorpay), set refund message
//         if (order.paymentMethod === "Razorpay") {
//             message = "Your payment will be credited to your wallet within 24 hours.";
//         }

//         res.json({ success: true, message, paymentMethod: order.paymentMethod });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };


// Render the cancellation page
const getCancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).send("Order not found");
        }
        res.render("cancel-order", { order });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const getReturnOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).send("Order not found");
        }
        res.render("return-order", { order });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

// Handle cancellation request
const cancelOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        console.log("Received orderId:", orderId);

        // Find the order by orderId
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // If payment is Razorpay, return a refund message
        if (order.paymentMethod === "razorpay") {
            return res.json({
                success: true,
                message: "Your payment will be credited to your wallet within 24 hours.",
                paymentMethod: "razorpay",
                requiresConfirmation: true, // Flag to indicate refund confirmation is needed
            });
        }

        // For COD, directly cancel the order
        order.status = "Cancelled";
        order.cancellationReason = reason;
        await order.save();

        res.json({
            success: true,
            message: "Your order has been cancelled successfully.",
            paymentMethod: "cod",
        });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Confirm cancellation for Razorpay payments
// const confirmCancelOrder = async (req, res) => {
//     try {
//         const { orderId, reason } = req.body;

//         // Find the order by orderId
//         const order = await Order.findOne({ orderId });
//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         // Update order status and reason
//         order.status = "Cancelled";
//         order.cancellationReason = reason;
//         await order.save();

//         res.json({
//             success: true,
//             message: "Your order has been cancelled successfully.",
//             paymentMethod: "razorpay",
//         });
//     } catch (error) {
//         console.error("Error confirming cancellation:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };



const confirmCancelOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        // Find the order by orderId
        const order = await Order.findOne({ orderId }).populate("userId"); // Ensure userId is populated
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Ensure the order is not already cancelled
        if (order.status === "Cancelled") {
            return res.json({ success: false, message: "Order is already cancelled" });
        }

        // Update order status
        order.status = "Cancelled";
        order.cancellationReason = reason;
        await order.save();

        // Process wallet refund ONLY for Razorpay payments
        if (order.paymentMethod === "razorpay") {
            // Find the user associated with the order
            const user = await User.findById(order.userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            const refundAmount = order.totalAmount;
            user.wallet += order.totalAmount; // Assuming `totalAmount` holds the order value

           
            user.walletHistory.push({
                amount: refundAmount,
                type: "credit",
                description: `Refund for cancelled order #${orderId}`,
                date: new Date(),
              });




            await user.save();

            return res.json({
                success: true,
                message: `Your Razorpay payment has been refunded. ₹${order.totalAmount} has been credited to your wallet.`,
                walletBalance: user.wallet,
                refundStatus: "Processed",
            });
        }

        // For COD or other payment methods, no wallet refund
        return res.json({
            success: true,
            message: "Your order has been cancelled successfully.",
            paymentMethod: order.paymentMethod,
            refundStatus: "No Refund (COD or other payment method)",
        });

    } catch (error) {
        console.error("Error confirming cancellation:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



// const returnOrder = async (req, res) => {
//     try {
//         const { orderId, reason } = req.body;

//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         // Update order status
//         order.status = "Returned";
//         order.returnReason = reason;
//         await order.save();

//         // For Razorpay, show refund message
//         if (order.paymentMethod === "razorpay") {
//             return res.json({
//                 success: true,
//                 message: "Your refund will be credited to your wallet within 24 hours.",
//                 paymentMethod: "razorpay",
//             });
//         }

//         // For COD, show success message
//         res.json({
//             success: true,
//             message: "Your order has been returned successfully.",
//             paymentMethod: "cod",
//         });
//     } catch (error) {
//         console.error("Error returning order:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

const returnOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        console.log("Received orderId:", orderId);

        // Find the order by orderId
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Update order status and reason
        order.status = "Reurn Requested";
        order.cancellationReason = reason;
        await order.save();

        // Return refund message for both payment methods
        if (order.paymentMethod === "razorpay") {
            return res.json({
                success: true,
                message: " The refund will be credited to your wallet within 24 hours.",
                paymentMethod: "razorpay",
                refundStatus: "Processing",
            });
        } else if (order.paymentMethod === "cod") {
            return res.json({
                success: true,
                message: "If you have made any advance payment, it will be refunded to your wallet within 24 hours.",
                paymentMethod: "cod",
                refundStatus: "Processing",
            });
        }

    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



const confirmReturnOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Update order status to "Return Requested"
        order.status = "Return Requested";
        order.returnReason = reason;
        await order.save();

        res.json({
            success: true,
            message: "Return request submitted successfully. Your refund will be processed after verification.",
        });

    } catch (error) {
        console.error("Error returning order:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};





module.exports={
    orderDetails,
    updateOrderStatus,
    getCancelOrder,
    cancelOrder,
    confirmCancelOrder,
    returnOrder,
    getReturnOrder,
    confirmReturnOrder,
}