/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ClientMessages;

import java.io.StringWriter;
import javax.json.Json;
import javax.json.JsonObject;

/**
 *
 * @author Damien
 */
public class ClientMessage {
    private JsonObject json;
    
    public JsonObject getJson() {
        return json;
    }

    public ClientMessage(JsonObject json) {
        this.json = json;
    }

    public void setJson(JsonObject json) {
        this.json = json;
    }
    
    @Override
    public String toString() {
        StringWriter writer = new StringWriter();
        Json.createWriter(writer).write(json);
        return writer.toString();
    }
    
    public String getUsername(){
        return json.getJsonObject("Client").getString("User");
    }
    
    public ClientMessageType getType(){

        String type = json.getJsonObject("Client").getString("ClientMessageType");
        
        switch (type) { 
            case "message": return ClientMessageType.MESSAGE;
            case "setuser": return ClientMessageType.SETUSERNAME;
            case "move": return ClientMessageType.MOVEMENT;
            
            default: return ClientMessageType.MESSAGE;
        }
    }

    public String getDirection() {
       return json.getJsonObject("Client").getString("Direction"); 
    }

    public String getFacing() {
       return json.getJsonObject("Client").getString("Facing");  
    }
    
    public String getId(){
        return json.getJsonObject("Client").getString("Id");   
    }
}
