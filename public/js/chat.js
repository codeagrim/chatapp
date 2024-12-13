const socket = io()
//Elements

const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = $messageForm.querySelector("#loc")
const $messages = document.querySelector("#messages")
const $exitButton = document.querySelector("#exit")


//Grabbing Templates

const msgTemplate= document.querySelector("#msg-template").innerHTML
const locationTemplate = document.querySelector("#loc-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const {username,room}=Qs.parse(location.search,{ ignoreQueryPrefix:true })


const autoScroll =()=>{

     // New message element

     const $newMessage = $messages.lastElementChild

     //Height of the new message
     const newMessageStyles= getComputedStyle($newMessage)
     const newMessageMargin = parseInt(newMessageStyles.marginBottom)
     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

     //visible height

     const visibleHeight= $messages.offsetHeight

     //height of messages container

     const contentHeight = $messages.scrollHeight

     // How Far have i scrolled

     const scrollOffset = ($messages.scrollTop + visibleHeight) *2

     if(contentHeight - newMessageHeight <= scrollOffset){
           $messages.scrollTop = $messages.scrollHeight

     }





}



socket.on("message",(msg)=>{
console.log(msg)

const html = Mustache.render(msgTemplate,{
username:msg.username,
message : msg.text,
createdAt : moment(msg.createdAt).format("h"+":"+"mm"+" A")

})

$messages.insertAdjacentHTML("beforeend",html)

autoScroll()

})

$messageForm.addEventListener("submit",(e)=>{

     e.preventDefault()
     //disable

     $messageFormButton.setAttribute("disabled","disabled")

     const message=e.target.elements.message.value
     socket.emit("sendMessage",message,(error)=>{

       //enable

       $messageFormButton.removeAttribute("disabled")
       $messageFormInput.value=" "
       $messageFormInput.focus()
                 if(error)
          {
             return console.log(error)
          }

    console.log("The Message was delivered")

     })

})

$sendLocationButton.addEventListener("click",()=>{

     if(!navigator.geolocation){

          return alert("geolocation is not supported by your browser")
     }

     $sendLocationButton.setAttribute("disabled","disabled")

     navigator.geolocation.getCurrentPosition((position)=>{   //it doesnt support promises 


             console.log(position)
             
     socket.emit("sendLocation",position.coords.latitude,position.coords.longitude,(shared)=>{

          $sendLocationButton.removeAttribute("disabled")
          console.log("Location Shared!!")
    

     })
   

     })





})




socket.on("location",(message)=>{

     console.log(message)


const html= Mustache.render(locationTemplate,{
username:message.username,
url:message.url,
createdAt:moment(message.createdAt).format("h"+":mm"+" A")


})


$messages.insertAdjacentHTML("beforeend",html)
autoScroll()

})

socket.on("roomData",({room,users})=>{

     const html= Mustache.render(sidebarTemplate,{
     room,
     users
     
     })
     
     document.querySelector("#sidebar").innerHTML=html
     
     
     })


socket.emit("join",{username,room},(error)=>{

if(error){

   alert(error)

   location.href="/"


}


})

$exitButton.addEventListener("click",()=>{


     $exitButton.formTarget = "http://localhost:3000/"

})
