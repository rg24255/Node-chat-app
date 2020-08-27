const socket = io()
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username , room } = Qs.parse(location.search,{ ignoreQueryPrefix : true})

const autoscroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of last message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of message container
    const conatinerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(conatinerHeight - newMessageHeight <=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
  const html = Mustache.render(sidebarTemplate,{
      room,
      users
  })
    document.querySelector('#sidebar').innerHTML = html
    
})
socket.on('locationMessage',(message)=>{
    console.log(messages)
    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    //disable
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value =''
        $messageFormInput.focus()


        if (error) {
            return console.log(error)
        }
        console.log('message delivered!')
    })
})
$sendLocationButton.addEventListener('click', () => {
    
    if (!navigator.geolocation) {
        return alert('Your browser does not support location ')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        coords = {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }

        socket.emit('sendLocation', coords, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
    
})

socket.emit('join',{ username , room },(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})