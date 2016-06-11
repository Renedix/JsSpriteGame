// Component parameters
var canvas;
var canvasContext;
var tileset;
var spriteSheet;
var tileSize = 32;

//Movement variables
var verticalMovement;
var horizontalMovement;
var messageEvent;

//Drawing
var updateUI; //Set by the server to indicate the ui needs to be updated
var drawingEvent;

$(window).load(function(){
    //initializeMovingSprite();
});

function initializeMovingSprite(){
        canvas = $("#myCanvas")[0];

        if (canvas==null){
                alert("Canvas component with ID myCanvas was not found. Canvas cannot be initialized.");
                return;
        }
        canvasContext = canvas.getContext("2d");
        
        canvas.width = ClientSettings.tileSize*(ClientSettings.tileViewLength*2);
        canvas.height = ClientSettings.tileSize*(ClientSettings.tileViewLength*2);
        
        tileset = document.getElementById('tileset');
        spriteSheet = document.getElementById('spritesheet');

        verticalMovement = 0;
        horizontalMovement = 0;
        
        updateUI = true;
        drawingEvent = setInterval(function(){drawCanvas()},1000/ClientSettings.clientDrawRate);
        
        setMap(JSON.parse(generateMapJson(ClientSettings.mapWidth,ClientSettings.mapHeight)));

        window.addEventListener("keydown", function(evt){

                var command = evt.keyCode;
                var direction;
                var currentlyInMotion = isCurrentlyMoving();

                if (command==87){
                    direction = 'N';
                    verticalMovement = -1;
                }else if (command== 83){
                    direction = 'S';
                    verticalMovement = 1;
                }

                if (command==65){
                    direction = 'W';
                    horizontalMovement = -1;
                }else if (command==68){
                    direction = 'E';
                    horizontalMovement = 1;
                }

                if (direction==null){
                    return;
                }else{
                    currentPlayer.facing = direction;
                }
                
                if (!currentlyInMotion&&messageEvent==null){
                    messageEvent = setInterval(function(){moveTargetEvent()},ClientSettings.clientMessageRate*1000);
                }

        },false);

        window.addEventListener("keyup", function(evt){

                var command = evt.keyCode;
                var direction;

                if (command==87){
                        direction = 'N';
                        if (verticalMovement==-1)
                            verticalMovement = 0;
                }else if (command== 83){
                        direction = 'S';
                        if (verticalMovement==1)
                            verticalMovement = 0;
                }

                if (command==65){
                        direction = 'W';
                        if (horizontalMovement==-1)
                            horizontalMovement = 0;
                }else if (command==68){
                        direction = 'E';
                        if (horizontalMovement==1)
                            horizontalMovement = 0;
                }
                

        },false);
}

function isCurrentlyMoving(){
    return !(verticalMovement==0&&horizontalMovement==0);
}

function movementBlocked(){
        
        if (verticalMovement==0&&horizontalMovement==0){
            return false;
        }

        var newX = currentPlayer.x + ClientSettings.clientMovementDistance*(horizontalMovement);
        var newY = currentPlayer.y + ClientSettings.clientMovementDistance*(verticalMovement);

        var minX = newX;
        var minY = newY;
        var maxX = newX+ClientSettings.spriteSize;
        var maxY = newY+ClientSettings.spriteSize;

        if (minX<0||minY<0||maxX>(ClientSettings.mapWidth*ClientSettings.tileSize)||maxY>(ClientSettings.mapHeight*ClientSettings.tileSize)){
            return true;
        }
        
        if (blockedByMap(newX,newY)){
            return true;
        }

        return false;
}

function drawCanvas(){
    if (updateUI && currentPlayer!=null){
        updateUI = false;
        drawBackground();
        drawPlayers(getPlayers());
    }
}


function drawBackground(){
    drawMap(mapJson);
}

function drawPlayers(players){
    for (var i=0;i<players.length;i++){
        drawPlayer(players[i]);
    }
}

function drawPlayer(localPlayer){
    
    var offsetX = localPlayer.x-(ClientSettings.spriteSize/2);
    var offsetY = localPlayer.y-(ClientSettings.spriteSize/2);
    
    drawSprite(localPlayer);
    
    if (localPlayer.username==getUsername()){
        canvasContext.fillStyle = ClientSettings.ownUsernameColor; 
    }else{
        canvasContext.fillStyle = ClientSettings.otherUsernameColor;
    }
    
    //canvasContext.font = "16px serif";
    //canvasContext.fillText(localPlayer.username, offsetX+(ClientSettings.spriteSize/2), offsetY+(ClientSettings.spriteSize/3));
}

function drawSprite(player){

        if(player.username==null)
            return;
        //get player sprite number
        var animations = ClientSettings.spriteAnimations;
        var animationNumber = player.animationNumber;
        var spriteNumber = player.sprite;
        var direction = player.facing;

        var xLocation = 0;
        var yLocation = ClientSettings.spriteSize*spriteNumber;
        var width = ClientSettings.spriteSize;
        var height = ClientSettings.spriteSize;

        if (ClientSettings.spriteSheetType="Line"){
            switch (direction){
                case "N":
                        xLocation = (animations*ClientSettings.spriteSize)*3;
                        break;
                case "S":
                        //xLocation = 0;
                        break;
                case "W":
                        xLocation = (animations*ClientSettings.spriteSize);
                        break;
                case "E":
                        xLocation = (animations*ClientSettings.spriteSize)*2;
                        break;
            };

            xLocation = xLocation+(animationNumber*ClientSettings.spriteSize);
        }
        
        if (ClientSettings.spriteSheetType="Box"){
            
            var spriteBoxWidth = 4;
            
            
            var spriteSetColumn = (spriteNumber) % spriteBoxWidth;
            var spriteSetRow = Math.floor(spriteNumber/spriteBoxWidth);
           
            xLocation = spriteSetColumn*(animations*ClientSettings.spriteSize);//3 animations
            

            yLocation = (ClientSettings.spriteSize*4)*spriteSetRow; //4 directions
            
            
            switch (direction){
                case "N":
                        yLocation += ClientSettings.spriteSize*3;
                        break;
                case "S":
                        //yLocation += 0;
                        break;
                case "W":
                        yLocation += ClientSettings.spriteSize;
                        break;
                case "E":
                        yLocation += ClientSettings.spriteSize*2;
                        break;
            };
            
            xLocation = xLocation+(animationNumber*ClientSettings.spriteSize);
            
        }
        
        var canvasX = player.x;
        var canvasY = player.y;
        
        if (player.username == currentPlayer.username){
            canvasX = ClientSettings.centerOfLockedCamera;
            canvasY = ClientSettings.centerOfLockedCamera;    
        }else{
            canvasX = canvasX - currentPlayer.x + ClientSettings.centerOfLockedCamera;
            canvasY = canvasY - currentPlayer.y + ClientSettings.centerOfLockedCamera;
        }

        canvasContext.drawImage(spriteSheet, xLocation, yLocation, width, height, canvasX, canvasY, width, height);
}

function generateMapJson(width, height){

    var jsonString = '';
    var blockNumber = 1;
    var layers = 1;

    jsonString+='{"Map": {"Id":"1","TileWidth":"'+width+'","TileHeight":"'+height+'","TileSet":"tileset.png",';		
            jsonString+='"MapLayers":{';
            for (var k=1;k<=layers;k++){
                    jsonString += '"Layer'+k+'":{';
                    for(var i=0;i<width;i++){
                            for (var j=0;j<height;j++){
                                    jsonString +=getBlockJsonString(i,j,blockNumber,k);
                                    blockNumber++;
                                    if (!(i==width-1&&j==height-1)){
                                        jsonString+=",";
                                    }
                            }
                    }
                    jsonString+='}';
                    if (k!=layers){
                        jsonString+=",";
                    }
            }
            
            jsonString += ',"StatusLayer":{"Block-X0-Y0":{"Status":"block"},"Block-X20-Y18":{"Status":"block"},"Block-X21-Y18":{"Status":"block"},"Block-X20-Y19":{"Status":"block"},"Block-X21-Y19":{"Status":"block"}}';
            
            

            jsonString+='}';
    jsonString+='}}';

    return jsonString;
}

function getBlockJsonString(x,y,blockNumber){
    
    var tileX = 0;
    
    var tileY = 0;
    
    if (y==0||y==23){
        if (x==0){
            tileX = 2;
            tileY = 2;
        }else if(x==33){
            tileX = 3;
            tileY = 2;
        }else{
            tileX = 3;
            tileY = 0;
        } 
    }
    
    if (y>=18 &&y<=19 && x>=20 && x<=21){
        if (y==18&&x==20){
            tileX = 4;
            tileY = 7;
        }else if (y==18&&x==21){
            tileX = 5;
            tileY = 7;
        } else if (y==19&&x==20){
            tileX = 4;
            tileY = 8;
        } else{
            tileX = 5;
            tileY = 8;
        }
    }
    
    return '"Block'+blockNumber+'":{"X":"'+x+'","Y":"'+y+'","TileX":"'+tileX+'","TileY":"'+tileY+'"}';
}


// Locked Camera View Draw

// Regular draw
function drawMap(json){
    
    canvasContext.fillStyle = ClientSettings.backgroundColor;
    canvasContext.rect(0,0,canvas.width,canvas.height);
    canvasContext.fill();

    var layers = json.Map.MapLayers;
    
    var tileViewLength = ClientSettings.tileViewLength;
    
    var minXBlock = Math.floor(currentPlayer.x/ClientSettings.tileSize)- tileViewLength;
    var minYBlock = Math.floor(currentPlayer.y/ClientSettings.tileSize)- tileViewLength;
    var maxXBlock = Math.floor(currentPlayer.x/ClientSettings.tileSize)+ tileViewLength + ClientSettings.tileSize;
    var maxYBlock = Math.floor(currentPlayer.y/ClientSettings.tileSize) + tileViewLength + ClientSettings.tileSize;

    var i = 1;
    var layer;
    while (true)
    {
        layer = layers["Layer"+i];
        if (layer==null){
                break;
        }
        drawLayerFromJson(layer,minXBlock,minYBlock,maxXBlock,maxYBlock);
        i++;
    }
}

function drawLayerFromJson(layer,minXBlock,minYBlock,maxXBlock,maxYBlock){

    var block;
    var i=1;
    while(true){
        block = layer["Block"+i];
        if (block==null){
                break;
        }
        if (block.X >= minXBlock && block.X <= maxXBlock && block.Y >= minYBlock && block.Y <= maxYBlock){
            drawTile(block.TileX,block.TileY,block.X,block.Y);
        }
        
        i++;
    }
}

function drawTile(mapTileX, mapTileY, tileX, tileY){
    
    var drawTileX = mapTileX*tileSize;
    var drawTileY = mapTileY*tileSize;
    var posX = tileX*tileSize;
    var posY = tileY*tileSize;
    
    if (1==1){
       posX = posX - currentPlayer.x + ClientSettings.centerOfLockedCamera;
       posY = posY - currentPlayer.y + ClientSettings.centerOfLockedCamera;
    }

    canvasContext.drawImage(tileset, drawTileX, drawTileY, tileSize, tileSize, posX, posY, tileSize, tileSize);
}