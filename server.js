const express = require('express');
const cors = require('cors');
const { Socket } = require('dgram');

const app = express();

//create connection
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
    cors: {
        origin: '*'//all origins
    }
});

app.get('/', (req, res) => {
    res.send("Hello world");
});

let userList = new Map();

//establishing connection
io.on('connection', (socket) => {
   let userName = socket.handshake.query.userName;
   createUser(userName, socket.id);

   socket.broadcast.emit('user-list', [...userList.keys()]);
   socket.emit('user-list', [...userList.keys()]);

   socket.on('message', (msg) => {
       socket.broadcast.emit('message-broadcast', {message: msg, userName:userName});
   })

   socket.on('disconnect', (reason) => {
     deleteUser(userName, socket.id);
   })
})

function createUser(userName, id){
    if(!userList.has(userName)){
        userList.set(userName, new Set(id));
    }else{
        userList.get(userName).add(id);
    }
}

function deleteUser(userName, id){
    if(!userList.has(userName)){
       let userId =  userList.get(userName);
       if(userId.size == 0){
           userList.delete(userName);
       }
    }
}

http.listen(3000, () => {
    console.log('server is runnig');
});
