const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New socket connection')

    socket.emit('message', 'Welcome!')
    socket.broadcast.emit('message', 'A new user has joined the chat')

    socket.on('sendMessage', (message, cb) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return cb('Profanity is not allowed!')
        }
        io.emit('message', message)
        cb('Message Delivered!')
    })

    socket.on('sendLocation', (coords, cb) => {
        io.emit('message', `https://www.google.com/maps/?q=${coords.latitude},${coords.longitude}`)

        cb()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat')
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})