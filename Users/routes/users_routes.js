const express = require("express")
const { findOne } = require("../models/users")
const Users = require("../models/users")
const config = require('../../config')
const middleware = require("../../middleware")
const jwt = require('jsonwebtoken')
const { statusCode } = require('../../constants')
const router = express.Router()




router.route("/users").get(middleware.checkToken,(req,res)=>{
    Users.find(
        (err,result) => {
            if(err) {return res.json({status:statusCode.STATUS_ERROR,message:err})}
            else{
                let data = [];
                for(let i = 0 ; i < result.length ; i++){
                  if(result[i]['userType']==='user'){
                    data.push(result[i])
                  }
                }

                return res.json({status:statusCode.STATUS_SUCCESS,message:"success",data:data})
            }
        }
    )
})




router.route("/auth").post((req,res)=>{
    Users.findOne({email:req.body.email},(err,result)=>{
        if(err) {return res.json({status:4,message:err})}
        if(result===null)
        {
            return res.json({status:statusCode.STATUS_WARNING,message:"Incorrect email"})
        }  
        else if(result['password']!==req.body.password){
            return res.json({status:statusCode.STATUS_WARNING,message:"Incorrect password"})
        }
        else
        {
            let token = jwt.sign({email:req.body.email},config.key,{expiresIn:"24h"})
            res.status(200).json({
                status:statusCode.STATUS_SUCCESS,
                message:"success",
                token:token,
                data:result
            })
        }
   })
})


router.route("/register").post((req,res)=>{
    Users.findOne({email:req.body.email},(err,result)=>{
        if(err) {return res.json({status:statusCode.STATUS_ERROR,message:err})}
        if(result===null)
        {
            const user = new Users({   
                name:req.body.name,
                userType:req.body.userType,
                email:req.body.email,
                password:req.body.password,
            })
            user
             .save()
             .then(()=>{
                res.json({status:statusCode.STATUS_SUCCESS,message:"success",})
               })
             .catch((err)=>{
                {return res.json({status:statusCode.STATUS_ERROR,message:err})}
               })
        }  
        else
        {
            res.json({status:statusCode.STATUS_WARNING,message:"email already exist"})
        }
   })
})


router.route("/update/:_id").patch(middleware.checkToken,(req,res)=>{
    Users.findByIdAndUpdate(
        {_id: req.params._id},
        { $set: {
            password:req.body.password,
        }},
        (err,result) => {
            if(err) {return res.json({status:statusCode.STATUS_ERROR,message:err})}
            return res.json({status:statusCode.STATUS_SUCCESS,message:"success"})
        }
    )
})




router.route("/delete/:_id").delete(middleware.checkToken,(req,res)=>{
    Users.findOneAndDelete({ _id: req.params._id},(err,result) => {
            if(err) {return res.json({status:statusCode.STATUS_ERROR,message:err})}
            return res.json({status:statusCode.STATUS_SUCCESS,message:"success"})
        }
    )
})



module.exports = router