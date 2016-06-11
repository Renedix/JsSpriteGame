/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package Game;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

/**
 *
 * @author damien.stevens
 */
public class ClientSettings {
    
    int spriteSize;
    private int mapWidth;
    private int mapHeight;
    private int spriteAnimations;
    private String backgroundColor;
    private int clientDrawRate;
    public int clientMessageRate;
    int clientMovementDistance;
    private String ownUsernameColor;
    private String otherUsernameColor;
    private String spriteSheetType;
    
    int tileSize;
    int numberOfSprites;
    int gameWidth;
    int gameHeight;
    
    int spriteOverlapHeight;
    int spriteOverlapWidth;
    
    public int DefaultX;
    public int DefaultY;
    
    public ClientSettings(){
        
        DefaultX = 250;
        DefaultY = 250;
        
        // Map specific
        tileSize = 32;
        mapWidth = 34;
        mapHeight = 24;
        gameWidth = tileSize*mapWidth;
        gameHeight = tileSize*mapHeight;
        
        //How often the client will draw to the screen
        clientDrawRate = 60;
        
        //Sprite specific
        spriteSize = 64;
        spriteSheetType = "Box";
        numberOfSprites = 8;
        spriteAnimations = 3;
        spriteOverlapWidth = 8;
        spriteOverlapHeight = 16;
        
        //Client movement
        clientMessageRate = 15; //messages a second
        clientMovementDistance = 21; //pixels to move per message
        
        //UI Colors
        ownUsernameColor = "#FFFF00";
        otherUsernameColor = "#FFFFFF";
        backgroundColor = "#000000";
    }
    
    public JsonObjectBuilder getClientJson(){
        return Json.createBuilderFactory(null).createObjectBuilder().
                                add("ServerMessageType","clientSettings").
                                add("SpriteSize",spriteSize).
                                add("MapWidth",mapWidth).
                                add("MapHeight",mapHeight).
                                add("SpriteAnimations",spriteAnimations).
                                add("BackgroundColor",backgroundColor).
                                add("ClientDrawRate",clientDrawRate).
                                add("ClientMessageRate",clientMessageRate).
                                add("ClientMovementDistance",clientMovementDistance).
                                add("OwnUsernameColor",ownUsernameColor).
                                add("OtherUsernameColor",otherUsernameColor).
                                add("SpriteSheetType",spriteSheetType).
                                add("SpriteOverlapWidth",spriteOverlapWidth).
                                add("SpriteOverlapHeight",spriteOverlapHeight);
    }
    
    
}
