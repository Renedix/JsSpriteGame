package Game;

import ClientMessages.ClientMessage;
import ServerMessages.ServerMessage;
import ServerSocket.GameEventExecutor;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class GameState implements Cloneable{
    
    public static ClientSettings ClientSettings = new ClientSettings();
    public static Map<String, Player> Players = Collections.synchronizedMap(new HashMap<String, Player>());

    public GameState() {
        GameEventExecutor.kickoffProcess();
    }
    
    public void addPlayer(String username){
        int randomSprite = 0 + (int)(Math.random()*ClientSettings.numberOfSprites);
        Players.put(username, new Player(ClientSettings.DefaultX,ClientSettings.DefaultY,randomSprite));
    }
    
    public boolean playerAlreadyExists(String username){
        return Players.get(username)!=null;
    }
    
    
    public void removePlayer(String username){
        Players.remove(username);
    }
    
    public GameState clone(){
        try{
            return (GameState) super.clone();
        }catch(CloneNotSupportedException e){
            e.printStackTrace();
            throw new RuntimeException();
        }
    }
    
    public void processClientCommand(ClientMessage message){
        
        boolean stateChanged = false;
        String username = message.getUsername();
        
        switch (message.getType()){
            case MOVEMENT: //sprite.getGameCommand()
                String direction = message.getDirection();
                String facing = message.getFacing();
                String id = message.getId();
                
                int axisMovements = 0;
                
                Player targetPlayer = Players.get(username);
                int newX = targetPlayer.getX();
                int newY = targetPlayer.getY();
                        
                if (direction.contains("N")){
                    newY = newY+(ClientSettings.clientMovementDistance*-1);
                    stateChanged=true;
                    axisMovements++;
                }
                
                if (direction.contains("S")){
                    newY = newY+(ClientSettings.clientMovementDistance*1);
                    stateChanged=true;
                    axisMovements++;
                }
                
                if (direction.contains("W")){
                    newX = newX+(ClientSettings.clientMovementDistance*-1);
                    stateChanged=true;
                    axisMovements++;
                }
                
                if (direction.contains("E")){
                    newX = newX+(ClientSettings.clientMovementDistance*1);
                    stateChanged=true;
                    axisMovements++;
                }
                
                if (axisMovements==1){
                    if (direction.contains("N")){
                        facing = "N";
                    }else if (direction.contains("S")){
                        facing = "S";
                    } else if (direction.contains("E")){
                        facing = "E";
                    } else {
                        facing = "W";
                    }
                }
                
                if (stateChanged&&!targetPlayer.isPlayerIsMoving()){
                    if (validateMovement(targetPlayer, newX, newY, username)){
                        targetPlayer.setX(newX);
                        targetPlayer.setY(newY);
                        targetPlayer.setPlayerIsMoving(true);
                        GameEventExecutor.addEvent(targetPlayer,ServerMessage.createPlayerMovement(username,newX,newY,facing, targetPlayer.getSpriteNumber(),id));
                    }
                }
                
                break;
        }
        
    }
    
    public boolean validateMovement(Player player, int newX, int newY, String username){
        int minX = newX+ClientSettings.spriteOverlapWidth;
        int minY = newY+ClientSettings.spriteOverlapHeight;
        int maxX = newX+ClientSettings.spriteSize-ClientSettings.spriteOverlapWidth;
        int maxY = newY+ClientSettings.spriteSize-ClientSettings.spriteOverlapHeight;

        if (minX<0||minY<0||maxX>ClientSettings.gameWidth||maxY>ClientSettings.gameHeight){
            return false;
        }
        
        //player collision
        Iterator<Map.Entry<String, Player>> entries = Players.entrySet().iterator();
        while (entries.hasNext()){
            Map.Entry<String, Player> entry = entries.next();
            if (!entry.getKey().equals(username)){
                //spriteOverlapHeight
                if (entry.getValue().collidesWithPlayer(minX, maxX, minY, maxY)){
                    return false;
                }
            }
        }
        
        //map collision

        return true;
    }
    
}
