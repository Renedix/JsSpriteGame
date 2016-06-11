var websocket;

function createWebSocket(){
    websocket = createWebsocket("ws://" + document.location.host + document.location.pathname + "chat",
                                function(evt) { serverConnectSuccessful(evt) },
                                null,
                                function(evt) { serverMessageReceived(evt) });

}

// Executed when a message from the server is received
function serverMessageReceived(evt) {
    
    var json = JSON.parse(evt.data);
    
    if (json.MassEvents == null){
        processJson(json);    
    }else{
        //get all messages
        var event = json.MassEvents[0];
        var i = 0;
        while(event!=null){
            processJson(event);
            i++;
            event = json.MassEvents[i];
        }
        updateUI = true;
    }
    
}

function processJson(json){
    var newMessage = "";
        
    if (json.Client!=null){
        //Client Message
        //Throw in case function
        newMessage = newMessage+"("+json.Client.User+"): "+json.Client.Message;
        appendMessageToChatWindow(newMessage);
    }else if(json.Server!=null){
        //Server Message
        executeServerAction(json);
    }else{
        if (json.MassEvents!=null){
            alert("A JSON was received that has not been labelled Client Or Server. See console.");
            console.log(json);
        }
    }
}

// Message received from the server.
// Update connected users
// Message being sent by server to all connected users
function executeServerAction(json){
    var type = json.Server.ServerMessageType;
    
    switch (type){
        
        case 'clientSettings':
            
            setClientSettings(  json.Server.SpriteSize,
                                json.Server.MapWidth,
                                json.Server.MapHeight,
                                json.Server.SpriteAnimations,
                                json.Server.BackgroundColor,
                                json.Server.ClientDrawRate,
                                json.Server.ClientMessageRate,
                                json.Server.ClientMovementDistance,
                                json.Server.OwnUsernameColor,
                                json.Server.OtherUsernameColor,
                                json.Server.SpriteSheetType,
                                json.Server.SpriteOverlapWidth,
                                json.Server.SpriteOverlapHeight);
            initializeMovingSprite();
            break;
        
        case 'playerMovement':
            var player = getPlayer(json.Server.User);
            if (player==null){
                console.log('adding player:'+json.Server.User);
                createPlayer(json.Server.User,json.Server.X ,json.Server.Y, json.Server.Facing);
            }else{
                setPlayerLocation(json.Server.User,json.Server.X ,json.Server.Y, json.Server.Facing);
            }
            
            //addLog(json.Server.SendId,1);
            
            break;
        
        case 'message':
            var newMessage = "(SERVER): "+json.Server.Message;
            appendMessageToChatWindow(newMessage);    
            
            websocket.isOpen = true;
            setInterfaceVisibility("block","gameContainer");
            setInterfaceVisibility("none","usernameContainer");
            break;

        case 'memberlist':
            var allItemsEntered = false;
            var i = 0;
            
            var activeMemberNames = new Array();
            while(!allItemsEntered){
                var userElement = json.Server.MemberList[i];
                if (userElement==null){
                    allItemsEntered=true;
                }else{
                    if (userElement.LogStatus=="signedin"){
                        activeMemberNames.push(userElement.User);
                    }
                    
                    //User 0 is the new member, send announcement to everyone but the person who has joined
                    if (userElement.User != getUsername()){
                        var newMessage = "";
                        
                        if(userElement.LogStatus=="signedin"){
                            newMessage = "(SERVER): '"+userElement.User+"' has joined!";
                            createPlayer(userElement.User,userElement.X,userElement.Y,null,userElement.Sprite);
                        }else{
                            newMessage = "(SERVER): '"+userElement.User+"' has left.";
                            removePlayer(userElement.User);
                        }
                        
                        appendMessageToChatWindow(newMessage);
                    }else{
                        if (getPlayer(userElement.User)==null){
                            createPlayer(userElement.User,userElement.X,userElement.Y,null,userElement.Sprite);
                        }
                    }
                }
                i++;
            }
            
            refreshChatMembers(activeMemberNames);
            
            break;
        
        case 'duplicateUsername':
            setUsername(json.Server.NewUsername);
            break;
        
        default:
            alert("Unhandled server type message '"+type+"'. Please see console.");
            console.log(json);
            break;
    }
    
}

// Write message to chat window
function appendMessageToChatWindow(message){
    var chatMessageWindow = document.getElementsByClassName("chatMessages")[0];
    
    if (chatMessageWindow.value.length>0){
        chatMessageWindow.value += "\n";
    }
    
    chatMessageWindow.value += message; 
}

// Refresh the UI that contains the users that are signed in
function refreshChatMembers(memberNames){
    var membersComponent = document.getElementsByClassName("connectedUsers")[0];
    
    var i;
    for(i=membersComponent.options.length-1;i>=0;i--)
    {
        membersComponent.remove(i);
    }
    
    for(i=0;i<memberNames.length;i++){
        var element = document.createElement("option");
        element.text = memberNames[i];
        membersComponent.add(element);
    }
}

// Get the username from the form. Use 'anonymous' if unspecified
function getUsername(){
    var usernameComponent = document.getElementsByClassName("usernameInput")[0];
    
    if (usernameComponent.value.length==0){
        return "anonymous";
    }else{
        return usernameComponent.value;
    }
}

function setUsername(newUsername){
    document.getElementsByClassName("usernameInput")[0].value = newUsername;
}

function connectHandler(button){
    if (!(websocket!=null && websocket.isOpen)){
        createWebSocket();
    }
}

function disconnect(){
    if (websocket.isOpen){
        websocket.close();
        setUsername("");
        setInterfaceVisibility("none","gameContainer");
        setInterfaceVisibility("block","usernameContainer");
        var button = document.getElementsByClassName("connectOrDisconnectButton")[0];
        button.value = "Connect";
        websocket.isOpen = false;
    }
}

//Called after successfully connecting to the server
function serverConnectSuccessful(evt){
    initializeGameState();
    var button = document.getElementsByClassName("connectOrDisconnectButton")[0];
    button.value = "Connecting...";
    document.getElementsByClassName("chatMessages")[0].value="";
    sendClientUsername(websocket);
}

// Set whether the visibility of the chat components
function setInterfaceVisibility(display,className){
    
    if (display=="none"){
        $('.'+className).fadeOut('slow');
    }else{
        $('.'+className).fadeIn('slow');
    }
}

/*
 * CLIENT JSONS
 */

// Request users list.
function sendClientUsername(websocket){
    var json = JSON.stringify(
        {"Client":   {
                    "ClientMessageType":"setuser",
                    "User":getUsername()
                    }
        });
        sendJsonToServer(json,websocket);
}

// To send the message to the server
function sendMessageToServer(ele){
    if(event.keyCode == 13) {
        var json = JSON.stringify(
        {"Client":   {
                    "ClientMessageType":"message",
                    "Message": ele.value,
                    "User":getUsername()
                    }
        });
        sendJsonToServer(json,websocket);
        ele.value = "";
    }
}

// Sent to the server when character is moving
function moveTargetEvent(){

        var blocked = movementBlocked();

        if (!blocked){
            var gameCommand = getGameMovementCommand();
                
            if (gameCommand!=null){
                //console.log(new Date().getTime());
                sendJsonToServer(gameCommand,websocket);  
            }
        }

        if (verticalMovement==0&&horizontalMovement==0){
            clearInterval(messageEvent);
            messageEvent = null;
        }
}


// Generates the json object to send to the server for player movement
function getGameMovementCommand(){
    
    if (verticalMovement==0&&horizontalMovement==0){
        return null;
    }
    
    var id = Math.floor(Math.random() * 1000000000);
    
    var json = JSON.stringify(
        {"Client":   {
                    "ClientMessageType":"move",
                    "User":getUsername(),
                    "Direction":getGameCommandDirection(),
                    "Facing":getCharacterFacing(),
                    "Id": ""+id
                    }
        });
    return json;

}

// Determines which direction the player is moving, to send to the server
function getGameCommandDirection(){
    var direction = "";
    
    switch (verticalMovement){
        case -1:
            direction+="N";
            break;
            
        case 1:
            direction+="S";
            break;
    }
    
    switch (horizontalMovement){
        case -1:
            direction+="W";
            break;
        case 1:
            direction+="E";
            break;
    }
    
    return direction;
}

//Determines which way a player is facing, to send to the server
function getCharacterFacing(){
    if (currentPlayer.facing==null){
        return "S";
    }else{
        return currentPlayer.facing;
    }
}