package Game;

import static Game.GameState.ClientSettings;
import java.awt.Color;

public class Player {
    
    private int x;
    private int y;
    private int spriteNumber;
    
    private int maxX;
    private int maxY;
    
    private boolean playerIsMoving;
    
    public Player(int x, int y, int spriteNumber) {
        this.x = x;
        this.y = y;
        this.spriteNumber = spriteNumber;
        this.playerIsMoving = false;
    }

    public boolean isPlayerIsMoving() {
        return playerIsMoving;
    }

    public void setPlayerIsMoving(boolean playerIsMoving) {
        this.playerIsMoving = playerIsMoving;
    }
    
    public int getSpriteNumber() {
        return spriteNumber;
    }

    public void setSpriteNumber(int spriteNumber) {
        this.spriteNumber = spriteNumber;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.maxX = x+GameState.ClientSettings.spriteSize;
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.maxY = y+GameState.ClientSettings.spriteSize;
        this.y = y;
    }
    
    public void addX(int x){
        this.x+=x;
    }
    
    public void addY(int y){
        this.y+=y;
    }
    
    public int getMinX(){
        return x;
    }
    
    public int getMinY(){
        return y;
    }
    
    public int getMaxX(){
        return maxX;
    }
    
    public int getMaxY(){
        return maxY;
    }
    
    public boolean collidesWithPlayer(int minX, int maxX, int minY, int maxY){
        
        if ((this.x+GameState.ClientSettings.spriteOverlapWidth)>=minX&&
            (this.x+GameState.ClientSettings.spriteOverlapWidth)<=maxX&&
            (this.y+GameState.ClientSettings.spriteOverlapHeight)>=minY&&
            (this.y+GameState.ClientSettings.spriteOverlapHeight)<=maxY){
            return true;
        }
        
        if ((this.x+GameState.ClientSettings.spriteOverlapWidth)>=minX&&
            (this.x+GameState.ClientSettings.spriteOverlapWidth)<=maxX&&
            (this.maxY-GameState.ClientSettings.spriteOverlapHeight)>=minY&&
            (this.maxY-GameState.ClientSettings.spriteOverlapHeight)<=maxY){
            return true;
        }
        
        if ((this.maxX-GameState.ClientSettings.spriteOverlapWidth)>=minX&&
            (this.maxX-GameState.ClientSettings.spriteOverlapWidth)<=maxX&&
            (this.y+GameState.ClientSettings.spriteOverlapHeight)>=minY&&
            (this.y+GameState.ClientSettings.spriteOverlapHeight)<=maxY){
            return true;
        }
        
        if ((this.maxX-GameState.ClientSettings.spriteOverlapWidth)>=minX&&
            (this.maxX-GameState.ClientSettings.spriteOverlapWidth)<=maxX&&
            (this.maxY-GameState.ClientSettings.spriteOverlapHeight)>=minY&&
            (this.maxY-GameState.ClientSettings.spriteOverlapHeight)<=maxY){
            return true;
        }
        
        return false;
    }

}