var mapJson;

function setMap(json){
   mapJson=json; 
}

function blockedByMap(x,y){
    
    var minX, maxX, minY, maxY;
    
    minX = x+ClientSettings.spriteOverlapWidth;
    minY = y+ClientSettings.spriteOverlapHeight;
    maxX = x+ClientSettings.spriteSize-ClientSettings.spriteOverlapWidth;
    maxY = y+ClientSettings.spriteSize-ClientSettings.spriteOverlapHeight;
    
    // Get the LEFT coordinate.
    if (willBeBlocked(minX,minY)||
        willBeBlocked(minX,maxY)||
        willBeBlocked(maxX,minY)||
        willBeBlocked(maxX,maxY)){

        return true;
    }else{

        return false;
    }
    
}

function willBeBlocked(x,y){
    
    var blockCoordinateX = Math.floor(x/tileSize);
    var blockCoordinateY = Math.floor(y/tileSize);
    
    var statusBlock;
    
    if (mapJson.Map.MapLayers.StatusLayer!=null){
        statusBlock = mapJson.Map.MapLayers.StatusLayer["Block-X"+blockCoordinateX+"-Y"+blockCoordinateY];
    
        if (statusBlock==null){
            return false;
        }else{
            return statusBlock.Status=="block";
        }
    }
}