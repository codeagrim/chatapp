const http=require("http")
const express= require("express")
const path = require("path")
const socketio = require("socket.io")
const Filter = require("bad-words")
const app=express()
const server = http.createServer(app)
const io= socketio(server)
const {generateMessage,generateLocation} = require("./utils/messages")
const {addUser,removeUser,getUser,getUsersInRoom} = require("./utils/users")




const port= process.env.PORT || 3000
const publicDirectoryPath= path.join(__dirname,"../public")


app.use(express.static(publicDirectoryPath))



io.on("connection",(socket)=>{

console.log("New Web Socket connection")

 socket.on("join",({username,room},callback)=>{

 const {error,user}=  addUser({id:socket.id,username,room})

if(error)
{  
    return callback(error)

}

 socket.join(user.room)

 socket.emit("message",generateMessage("Admin","Welcome!!"))

 socket.broadcast.to(user.room).emit("message",generateMessage(user.username,`${user.username} has joined`))

 io.to(user.room).emit("roomData",{

room :user.room,
users : getUsersInRoom(user.room)

 })




callback()

})

// socket.emit - send to only current client
// io.emit - send to all clients
// socket.broadcast.emit to all clients exept current one
// io.to.emit - send to everyone in a room
// socket.broadcast.to.emit - to all clients exept current onein specific room

     socket.on("sendMessage",(msg , callback)=>{

    const user = getUser(socket.id)
     

    const filter= new Filter()

     if(filter.isProfane(msg))
     {
        return callback("Profanity is not allowed !!")
     }
         io.to(user.room).emit("message",generateMessage(user.username,msg))
         callback()
    
     })

   socket.on("disconnect",()=>{
     
   const user =removeUser(socket.id)

   if(user){
 
     io.to(user.room).emit("message",generateMessage("Admin",`${user.username} have left!`))
   
     
 io.to(user.room).emit("roomData",{

  room :user.room,
  users : getUsersInRoom(user.room)
  
   })
  

   }
     
   
   })


   socket.on("sendLocation",(latitude,longitude,callback)=>{

      const user = getUser(socket.id)


          io.to(user.room).emit("location",generateLocation(user.username,`https://google.com/maps?q=${latitude},${longitude}`))

          callback()


   })




})

     server.listen(port,()=>{
    console.log(`Server is on port ${port}`)



})

