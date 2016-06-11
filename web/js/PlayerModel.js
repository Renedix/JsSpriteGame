var players;
var currentPlayer;

function initializeGameState(){
    players = new Array();
}

function createPlayer(localusername,localx,localy,facing, sprite){
    
    var newPlayer = new Object();
        newPlayer.username = localusername;
        newPlayer.x = localx;
        newPlayer.y = localy;
        newPlayer.sprite = sprite;
        newPlayer.facing = facing;
        newPlayer.animationNumber = 0;
        newPlayer.animationDirection = 1;
        
        //Distance the character will travel before the next animation
        newPlayer.pixelAnimation = 55;
        newPlayer.pixelAnimationCount = 0;
    
    if (localusername==getUsername()){
       currentPlayer = newPlayer; 
    }
    
    addPlayer(newPlayer);
}

function getPlayers(){
    if (players==null){return new Array();}
    return players;
}

function setPlayerLocation(username,x ,y, facing){
    
    var player = getPlayer(username);
    
    removePlayer(username);
            
    var xDif = Math.abs(player.x-x);
    var yDif = Math.abs(player.y-y);

    player.x=x;
    player.y=y;
    player.facing=facing;

    var distance;
    if (xDif>0){
        distance = xDif;
    }else if(yDif>0){
        distance = yDif;
    }

    player.pixelAnimationCount = player.pixelAnimationCount + distance;

    if (player.pixelAnimationCount>player.pixelAnimation){
        player.pixelAnimationCount = 0;
        switch (player.animationNumber){
        case 0:
            player.animationNumber = 1;
            player.animationDirection = 1;
            break;
        case 1:
            switch (player.animationDirection){
                case 1:
                    player.animationNumber = 2;    
                    break;
                case -1:
                    player.animationNumber = 0;
                    break;
            }
            break;
        case 2:
            player.animationNumber = 1;
            player.animationDirection = -1;
            break;
        }
    }
 
    addPlayer(player);
    
}

function getPlayer(username){

    for (var i = 0; i < players.length; i++) {
        if (players[i].username == username){
            return players[i];
        }
    }
    
    return null;
}

function removePlayer(username){
    var newPlayerList = new Array();
    
    for (var i = 0; i < players.length; i++) {
        if (players[i].username != username){
            newPlayerList.push(players[i]);
        }
    }
    players = newPlayerList;
}

function addPlayer(player){

    var added = false;
    
    if (players.length==0){
        players.push(player);
    }else{
        
        for (var i = 0; i < players.length; i++) {
            var y = players[i].y;
            if (player.y<=y){
                players.splice(i,0,player);
                added = true;
                break;
            }
        }
        
        if (!added){
           players.push(player); 
        }
    }
}