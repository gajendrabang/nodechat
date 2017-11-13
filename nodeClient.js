var socket = io.connect('http://localhost:3000');

$("#messageForm").submit(function() {
    var nameVal = $("#nameInput").val();
    var msg = $("#messageInput").val();

    socket.emit('message', {name: nameVal, message: msg});

    // Ajax call for saving datas
    $.ajax({
        url: "./ajax/insertNewMessage.php",
        type: "POST",
        data: {name: nameVal, message: msg},
        success: function(data) {

        }
    });

    return false;
});

$("#roomMessageForm").submit(function() {
    var msg = $("#message").val();
    var room = $('#room').val();
    socket.emit('privatemessage', {room: room, message: msg});
    return false;
});

$('#joinRoom').submit(function() {
    socket.emit('privatechatroom', {email: $('#email').val()});
    return false;
});



$('#imageFile').on('change', function(e) {
    var file = e.originalEvent.target.files[0],
            reader = new FileReader();

    reader.onload = function(evt) {
        var jsonObject = {
            'imageData': evt.target.result
        }
        // send a custom socket message to server
        socket.emit('image', jsonObject);
    };

    reader.readAsDataURL(file);
});


socket.on('message', function(data) {
    var actualContent = $("#messages").html();
    var newMsgContent = '<li> <strong>' + data.name + '</strong> : ' + data.message + '</li>';
    var content = newMsgContent + actualContent;
    $("#messages").html(content);
});

socket.on("image", function(data) {
    if (data.imageData) {
        var actualContent = $("#messages").html();
        //var img = new Image();
        //img.src = data.imageData;
        var image = document.createElement('img');
        image.src = data.imageData;
        //document.body.appendChild(image);
        //var newMsgContent = '<li>'+ image +'</li>';
        //var content = newMsgContent + actualContent;
        $("#messages").append(image);
        // Do whatever you want with your image.        
    }
});


socket.on("privateresponse", function(data) {
    var current_url = window.location.href;
    window.location = current_url + '?room=' + data.room;

});

socket.on('privatemessageresponse', function(data) {
    console.log('clientside');
    var actualContent = $("#roomMessages").html();
    var newMsgContent = '<li>' + data.message + '</li>';
    var content = newMsgContent + actualContent;
    $("#roomMessages").html(content);
});










