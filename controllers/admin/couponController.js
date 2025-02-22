const Coupon = require('../../models/couponSchema');
const Category = require('../../models/categorySchema');
const Product = require('../../models/productSchema');
const mongoose=require("mongoose")


const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.render('coupon-list', { coupons ,currentPage:"coupon"});
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.redirect('/admin');
  }
};

const getAddCouponPage = async(req, res) => {
  try{
  const categories = await Category.find();
  const products = await Product.find(); 
  res.render('add-coupon',{categories,products});
} catch (error) {
  console.error("Error fetching categories:", error);
  res.status(500).send("Error loading categories");
}
};









// const createCoupon = async (req, res) => {
//   try {
//       const { code, discount, discountType, expiry, usageLimit, categoryIds, productIds } = req.body;

//       // ✅ Validate that categoryIds and productIds are arrays (optional)
//       if (!Array.isArray(categoryIds)) {
//           return res.json({ success: false, message: "Invalid category IDs format!" });
//       }

//       if (!Array.isArray(productIds)) {
//           return res.json({ success: false, message: "Invalid product IDs format!" });
//       }

//       // ✅ Create new coupon with category and product selections
//       const newCoupon = new Coupon({
//           code,
//           discount,
//           discountType,
//           expiry,
//           usageLimit,
//           categoryIds,  // Store selected category IDs
//           productIds    // Store selected product IDs
//       });

//       await newCoupon.save();

//       return res.json({ success: true, message: "Coupon added successfully!" });

//   } catch (error) {
//       console.error("Error creating coupon:", error);

//       // ✅ Handle duplicate key error
//       if (error.code === 11000) {
//           return res.json({ success: false, message: "Coupon code already exists!" });
//       }

//       return res.json({ success: false, message: "Internal Server Error" });
//   }
// };



const createCoupon =async (req, res) => {
  const { code, discount, discountType, expiry, usageLimit, minOrderValue, categoryIds, productIds, userRestriction } = req.body;

  try {
      // Check for duplicate coupon code
      const existingCoupon = await Coupon.findOne({ code });
      if (existingCoupon) {
          return res.status(400).json({ success: false, message: 'Coupon code already exists!' });
      }

      // Create new coupon
      const newCoupon = new Coupon({
          code,
          discount,
          discountType,
          expiry,
          usageLimit,
          minOrderValue,
          categoryIds,
          productIds,
          userRestriction
      });

      await newCoupon.save();

      res.status(200).json({ success: true, message: 'Coupon created successfully!' });
  } catch (error) {
      console.error('Error creating coupon:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};






const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.redirect('/admin/coupon');
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.redirect('/admin/coupon');
  }
};


module.exports={
    listCoupons,
    getAddCouponPage,
    createCoupon,
   deleteCoupon,
}