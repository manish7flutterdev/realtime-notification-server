const { Router } = require("express")
const express = require("express")
const PORT = process.env.PORT || 5000
const app = require('express')()
const cors = require("cors");
const config = require("./config")
const mongo_connect = require("./functions/mongo_function")
const routesArray = require("./routes_list")
const server = require('http').createServer(app)
const io = require('socket.io')(server)



const mongo = () => mongo_connect()     // MongoDB Connection


/////////////////  SOcket  ////////////////////////////

let users = []

let pendingNotification = []



const addUser = (userId,socketId) => {
    !users.some(user=>user.userId ===userId) && 
    users.push({userId,socketId})
    // console.log("List of Online Users",users)
    checkPendingMessage(userId,socketId)
    console.log("This is user list :",users)
   
}

const removeUser = (socketId) => {
    users = users.filter((user)=> user.socketId !== socketId)
    console.log("This is user list :",users)

}


const storePendingNotification = (userId,text) => {
  let obj = {userId:userId,text:text}
  pendingNotification.push({userId,text})
  console.log("( Store Pending Notification )  Total number of Pending Requests :", pendingNotification.length)
}


const checkPendingMessage = (userId,socketId) => {
  let completedPendingRequestList = [];
  if(pendingNotification.length===0){
   console.log("No pending Notification")
  }else{
    let counter = 0 ;
    for(let i = 0 ; i < pendingNotification.length ; i++){
      if(pendingNotification[i]['userId']===userId){
        // sendPendingNotification(pendingNotification[i]['text'],socketId,i)
         io.to(socketId).emit('recieveNotification',{'text':pendingNotification[i]['text']});
         counter++;
         completedPendingRequestList.push(i)
      }
    }
    console.log("This is counter :",counter)
    // console.log("This is the completed pending request :",completedPendingRequestList)


    for(var i = completedPendingRequestList.length -1; i >= 0; i--)
     pendingNotification.splice(completedPendingRequestList[i],1);

     console.log("This is the pending request list :",pendingNotification.length)

  }
}






const sendPendingNotification = async (text,socketId,index) =>  {
 await io.to(socketId).emit('recieveNotification',{'text':text});
  // newNotification = pendingNotification.splice(index,1)
  console.log("( After Sending Pending Notification )Total number of Pending Requests :", pendingNotification.length)
}





io.on("connection",(socket)=>{
  io.emit("getUsers",users)
  socket.on("addUser",(userId)=>{
    addUser(userId,socket.id)
    io.emit("getUsers",users)
  })
  socket.on("disconnect",()=>{
    console.log("a user disconnected")
    removeUser(socket.id)
    io.emit("getUsers",users)
  })
  socket.on("notification",(data)=>{
    if(users.length===0){
      storePendingNotification(data['reciever'],data['text'])
    }else{
       for (let i = 0; i < users.length; i++) {
        if(users[i]['userId']===data['reciever']){
          io.to(users[i]['socketId']).emit('recieveNotification',{'text':data['text']});
        }else{
            storePendingNotification(data['reciever'],data['text'])
        }
       }
    }
  })

})



/////////////////  SOcket  ////////////////////////////




app.use(cors());
app.use(express.json())
app.route("/").get((req,res)=>{
    res.json("Shoppinn Server")
})
server.listen(PORT,"0.0.0.0",()=>{
    console.log("Server Started",PORT)
})


routesArray.forEach((item,index)=>{
    let routeVariable = require(routesArray[index].routeDirectory)
    app.use(routesArray[index].route,routeVariable)
})





