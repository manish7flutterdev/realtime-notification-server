
const Mongoose = require("mongoose")
const config = require("../config")



function connect () {
    Mongoose.connect(config.mongoDBurl,{
        useNewUrlParser:true,
     //   useCreateIndex:true,
        useUnifiedTopology:true,
      //  useFindAndModify:true,
    })
    
    
     const connection = Mongoose.connection
     connection.once("open", ()=>{
         console.log("Database connected")
     })
}



 module.exports = connect()