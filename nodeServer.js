var socket = require('socket.io');
var express = require('express');
var http = require('http');
var dl = require('delivery');
var fs = require('fs');
var cors = require('cors');
var path = require('path');
var port = '3000';
var app = express();
var server = http.createServer(app);
var io = socket.listen(server);
var users = [];

//app.use(function(req, res, next) {
//    res.header('Access-Control-Allow-Origin', '*');
//    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept-Type');
//    res.header('Access-Control-Allow-Credentials', 'true');
//    next();
//});

//io.set('origins', '*localhost:3000');
//function app(req, res) {
//    res.writeHead(200, {
//        'Access-Control-Allow-Origin': '*'
//    });
//}

io.sockets.on('connection', function (client) {
    //io.set('origins', 'htp://localhost:3000');
    console.log("New client !");
    client.on('message', function (data) {
        console.log('Message received ' + data.name + ":" + data.message);
        //client.broadcast.emit( 'message', { name: data.name, message: data.message } );
        io.sockets.emit('message', {name: data.name, message: data.message});

    });
    client.on('image', function (data) {
        console.log('Image received :' + data.imageData);
        //client.broadcast.emit( 'message', { name: data.name, message: data.message } );
        io.sockets.emit('image', {imageData: data.imageData});
    });
    client.on('privatechatroom', function (data) {
        ///console.log('New User :' + data.email);
        client.join(data.email);
        io.sockets.in(data.email).emit('privateresponse', {message: 'you are added', 'room': data.email});
        console.log(io.sockets.adapter.rooms);
        console.log(io.sockets.clients(data.room));
    });
    client.on('privatemessage', function (data) {
        //console.log('New Message :' + data.message);
        //console.log(data.room);
        client.join(data.room);
        io.sockets.in(data.room).emit('privatemessageresponse', {message: data.message, 'room': data.room});

    });
    client.on('subscribe', function (data) {
        console.log('joining room', data.room);
        if (!lookup(data.userName)) {
            console.log(data.userName);
            client.userName = data.userName;
            users.push({userName: client.userName, room: data.room});
            updateUsers();
        }
        client.join(data.room);
    });
    client.on('send message', function (data) {
        console.log('sending room post', data.room);
        console.log(data.message);
        io.sockets.in(data.room).emit('conversation private post', {
            room: data.room,
            message: data.message,
            senderName: data.senderName,
            senderType: data.senderType
        });
    });

    client.on('send file', function (data) {
        console.log('sending room post file', data.room);
        console.log(data.message);
        io.sockets.in(data.room).emit('conversation private post file', {
            room: data.room,
            fileData: data.fileData,
            senderName: data.senderName,
            senderType: data.senderType
        });
    });

    client.on('setupadmin', function (data) {
        console.log('setupadmin');
        updateUsers();
    });


    function lookup(name)
    {
        for (var i = 0, len = users.length; i < len; i++) {
            if (users[ i ].userName === name)
                return true;
        }
        return false;
    }
    function updateUsers() {
        io.emit('users', users);
    }
    client.on('disconnect', function () {
        if (client.userName) {
            removeInUsers(client.userName);
            updateUsers();
        }
    });
    function removeInUsers(name)
    {
        if (name)
        {
            for (var i = 0, len = users.length; i < len; i++) {
                if (users[ i ].userName === name)
                {
                    users.splice(i, 1);
                }
            }
        }
    }
});

//server.listen(3000);
server.listen(process.env.PORT || port, function () {
    console.log("listening port " + port);
});