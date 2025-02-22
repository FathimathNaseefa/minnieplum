const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config()
const Order = require("../../models/orderSchema"); // Assuming you have an Order model

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// Route to create Razorpay order
const createRazOrder=(req, res)=>{ 

    // STEP 1:
    const {amount,currency,receipt, notes}  = req.body;      
        
    // STEP 2:    
    razorpayInstance.orders.create({amount, currency, receipt, notes}, 
        (err, order)=>{
        
          //STEP 3 & 4: 
          if(!err)
            res.json(order)
          else
            res.send(err);
        }
    )
}



const verifyPayment=  (req, res)=>{ 
    
    // STEP 7: Receive Payment Data
    const {order_id, payment_id} = req.body;     
    const razorpay_signature =  req.headers['x-razorpay-signature'];

    // Pass yours key_secret here
    const key_secret = YAEUthsup8SijNs3iveeVlL1;     

    // STEP 8: Verification & Send Response to User
    
    // Creating hmac object 
    let hmac = crypto.createHmac('sha256', key_secret); 

    // Passing the data to be hashed
    hmac.update(order_id + "|" + payment_id);
    
    // Creating the hmac in the required format
    const generated_signature = hmac.digest('hex');
    
    
    if(razorpay_signature===generated_signature){
        res.json({success:true, message:"Payment has been verified"})
    }
    else
    res.json({success:false, message:"Payment verification failed"})
}

module.exports = {
    createRazOrder,
    verifyPayment,
    genInv,
}
