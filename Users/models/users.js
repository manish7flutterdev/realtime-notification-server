const mongoose = require("mongoose")

const Schema = mongoose.Schema

const Users = Schema({

    name:{
        type:String,
    },
    userType:{
        type:String,
    },
   email:{
       type:String,
   },
   password:{
    type:String,
   }
 
})

module.exports = mongoose.model("Users", Users)
