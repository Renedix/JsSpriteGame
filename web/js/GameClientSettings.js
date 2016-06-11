var ClientSettings;
var movementLog = new Array();

var db;

function addLog(id, startOrFinish){
    var log = new Object();
        log.id = id;
        log.timeStamp = new Date().getTime();
    
    executeSql("INSERT INTO MovementPingLog (id, timestamp, sof) values("+log.id+", "+log.timeStamp+","+startOrFinish+")");
}

function setClientSettings( spriteSize,
                            mapWidth,
                            mapHeight,
                            spriteAnimations,
                            backgroundColor,
                            clientDrawRate,
                            clientMessageRate,
                            clientMovementDistance,
                            ownUsernameColor,
                            otherUsernameColor,
                            spriteSheetType,
                            spriteOverlapWidth,
                            spriteOverlapHeight
                        ){

    ClientSettings = new Object();
    ClientSettings.spriteSize = spriteSize;
    ClientSettings.mapWidth = mapWidth;
    ClientSettings.mapHeight = mapHeight;
    ClientSettings.spriteAnimations = spriteAnimations;
    ClientSettings.backgroundColor = backgroundColor;
    ClientSettings.clientDrawRate = clientDrawRate;
    ClientSettings.clientMessageRate = 1/clientMessageRate;
    ClientSettings.ownUsernameColor = ownUsernameColor;
    ClientSettings.otherUsernameColor = otherUsernameColor;
    ClientSettings.spriteSheetType = spriteSheetType;
    ClientSettings.clientMovementDistance = clientMovementDistance;
    ClientSettings.spriteOverlapWidth = spriteOverlapWidth;
    ClientSettings.spriteOverlapHeight = spriteOverlapHeight;
    
    ClientSettings.tileSize = 32;
    ClientSettings.tileViewLength = 10;
    ClientSettings.centerOfLockedCamera = (ClientSettings.tileSize*ClientSettings.tileViewLength)-(spriteSize/2);
    

    db = openDatabase('mydb', '1.0', 'my first database', 2 * 1024 * 1024);
    executeSql('CREATE TABLE MovementPingLog (id, timestamp, sof)');
}


function executeSql(sql){
    db.transaction(function (tx) {tx.executeSql(sql);});
}

function executeReport(){
    
    db.transaction(function (tx) {
        tx.executeSql("select ", [], function (tx, results) {
        var len = results.rows.length, i;
            for (i = 0; i < len; i++) {
                console.log(results.rows.item(i).averageTime);
            }
         });
    });
    
}

function clearLog(){
    executeSql('delete from MovementPingLog');
}