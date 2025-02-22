const User=require("../../models/userSchema");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");


const pageerror= async(req,res)=>{
    res.render("admin-error")
}



const loadLogin=(req,res)=>{
    if(req.session.admin){
        return res.redirect("/admin")
    }
    res.render("admin-login",{message:null})
}

const login=async (req,res)=>{
    try{
        const {email,password} =req.body;
        const admin=await User.findOne({email,isAdmin:true})
        if(admin){
            const passwordMatch =bcrypt.compare(password,admin.password)
            if(passwordMatch){
                req.session.admin = true;
                return res.redirect("/admin")
            }else{
                return res.redirect("/login")
            }
        }else{
            return res.redirect("/login")
        }
    }catch(error){
        console.log("login error",error);
        return res.redirect("/pageerror")
    }
}

// const login=async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });

//         if (!user || !user.isAdmin || user.password !== password) {
//             console.log("Invalid credentials");
//             return res.redirect("/admin/login");
//         }

//         // Save user ID in session
//         req.session.userId = user._id;
//         console.log("User logged in, session set:", req.session);

//         res.redirect("/admin");
//     } catch (error) {
//         console.error("Login Error:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };






const loadDashboard=async(req,res)=>{
    if(req.session.admin){
        try{
            res.render("dashboard",{currentPage: "dashboard"})
        }catch(error){
            res.redirect("/pageerror")
        }
    }
}
const logout = async(req,res)=>{
    try {
        req.session.destroy(err=>{
            if(err){
                console.log("Error destroying session",err);
                return res.redirect("/pageerror")
            }
            res.redirect("/admin/login")
        })
        
    } catch (error) {
        console.log("Unexpected error during logout",error)
        res.redirect("/pageerror")
    }
}


module.exports={
     loadLogin,
     login,
     loadDashboard,
     pageerror,
     logout
}