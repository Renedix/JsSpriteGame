function createWebsocket(   url,
                            onOpenFunction,
                            onErrorFunction,
                            OnMessageFunction){
    var newWebSocket = new WebSocket(url);
    
    if (onOpenFunction==null){
        newWebSocket.onopen = function(evt) { websocketOpen(evt) };
    }else{
        newWebSocket.onopen = onOpenFunction;
    }
    
    if (onErrorFunction==null){
        newWebSocket.onerror = function(evt) { websocketError(evt) };
    }else{
        newWebSocket.onerror = onErrorFunction;
    }
    
    newWebSocket.onmessage = OnMessageFunction;
    
    newWebSocket.isOpen = true;
    
    return newWebSocket;
}

//websocket error handling
function websocketError(evt) {
    alert(evt.data);
}

//What to do when the websocket has been open
function websocketOpen(evt) {
    //writeToScreen("Connected to " + wsUri);
}

function sendJsonToServer(json, websocket){
    if (json==null){
        var err = new Error();
        console.log(err.stack);
    }
    websocket.send(json);
}

