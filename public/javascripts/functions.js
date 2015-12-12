var socket = io.connect('http://localhost:3000');
$(document).ready(function()
{
    manageSessions.unset("login");
});

$(function()
{
    showModal("Login Form",renderForm());
    $("#containerSendMessages, #containerSendMessages input").on("focus click", function(e)
    {
        e.preventDefault();
        if(!manageSessions.get("login"))
        {
            showModal("Login Form",renderForm(), false);
        }
    });

    $("#loginBtn").on("click", function(e)
    {
        e.preventDefault();
        //si el nombre de usuario es menor de 2 carácteres
        if($(".username").val().length == 0)
        {
            $(".errorMsg").hide();
            $(".username").after("<div class='col-md-12 alert alert-danger errorMsg'>You must enter a name to access the chat.</div>").focus();
            return;
        }
        manageSessions.set("login", $(".username").val());
        socket.emit("loginUser", manageSessions.get("login"));
        $("#formModal").modal("hide");
    });
    socket.on("userInUse", function()
    {
        $("#formModal").modal("show");
        manageSessions.unset("login");
        $(".errorMsg").hide();
        $(".username").after("<div class='col-md-12 alert alert-danger errorMsg'>The user trying to choose is in use.</div>").focus();
        return;
    });

    socket.on("refreshChat", function(action, message)
    {
        switch (action){
            case "connect":
                $("#chatMsgs").append("<p class='col-md-12 alert-info'>" + message + "</p>");
                break;
            case "disconnect":
                $("#chatMsgs").append("<p class='col-md-12 alert-danger'>" + message + "</p>");
                break;
            case "msg":
                $("#chatMsgs").append("<p class='col-md-12 alert-warning'>" + message + "</p>");
                break;
            case "I":
                $("#chatMsgs").append("<p class='col-md-12 alert-success'>" + message + "</p>");
                break;
        }

    });

    socket.on("updateSidebarUsers", function(usersOnline)
    {
        $("#chatUsers").html("");
        if(!isEmptyObject(usersOnline))
        {
            $.each(usersOnline, function(key, val)
            {
                $("#chatUsers").append("<p class='col-md-12 alert-info'>" + key + "</p>");
            })
        }
    });

    $('.sendMsg').on("click", function()
    {
        var message = $(".message").val();
        if(message.length !=0)
        {
            socket.emit("addNewMessage", message);
            $(".message").val("");
        }
    });

});

function showModal(title,message,showClose)
{
    console.log(showClose);
    $("h2.title-modal").text(title).css({"text-align":"center"});
    $("p.formModal").html(message);
    if(showClose == "true")
    {
        $(".modal-footer").html('<a data-dismiss="modal" aria-hidden="true" class="btn btn-danger">Cerrar</a>');
        $("#formModal").modal({show:true});
    }
    else
    {
        $("#formModal").modal({show:true, backdrop: 'static', keyboard: true });
    }
}

function renderForm()
{
    var html = "";
    html += '<div class="form-group" id="formLogin">';
    html += '<input type="text" id="username" class="form-control username" placeholder="Enter a username">';
    html += '</div>';
    html += '<button type="submit" class="btn btn-primary btn-large" id="loginBtn">Enter</button>';
    return html;
}

var manageSessions = {
    get: function(key) {
        return sessionStorage.getItem(key);
    },
    set: function(key, val) {
        return sessionStorage.setItem(key, val);
    },
    unset: function(key) {
        return sessionStorage.removeItem(key);
    }
};

function isEmptyObject(obj)
{
    var name;
    for (name in obj)
    {
        return false;
    }
    return true;
}