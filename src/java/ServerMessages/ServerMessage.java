/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ServerMessages;

import ClientMessages.ClientMessage;
import Game.GameState;
import java.io.StringWriter;
import java.util.Set;
import javax.json.Json;
import javax.json.JsonBuilderFactory;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.websocket.Session;

/**
 *
 * @author Damien
 */
public class ServerMessage {


    private JsonObject json;
    
    public JsonObject getJson() {
        return json;
    }

    public ServerMessage(JsonObject json) {
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
    
    public static JsonObject createAnnouncement(String message){
        return Json.createBuilderFactory(null).createObjectBuilder().
                        add("Server",Json.createBuilderFactory(null).createObjectBuilder().
                            add("ServerMessageType", "message").
                            add("Message", message)).
                        build();
    }
    
    public static JsonObject createMemberList(Set<Session> sessions, Session currentSession){
        
        JsonBuilderFactory factory = Json.createBuilderFactory(null);
        
        JsonObjectBuilder members = factory.createObjectBuilder();
        
        JsonObjectBuilder member = factory.createObjectBuilder();
        
        String username = "";
        int i = 0;
        for (Session peer : sessions) {
            //Index 0 is always the new user
            member = factory.createObjectBuilder();
            username = (String) peer.getUserProperties().get("user");
            
            member.add("User", username);
            member.add("LogStatus","signedin");
            
            int x = GameState.Players.get(username) == null ? GameState.ClientSettings.DefaultX : GameState.Players.get(username).getX();
            int y = GameState.Players.get(username) == null ? GameState.ClientSettings.DefaultY : GameState.Players.get(username).getY();
            int sprite = GameState.Players.get(username) == null ? 0 : GameState.Players.get(username).getSpriteNumber();
            
            member.add("X",x);
            member.add("Y",y);
            member.add("Sprite",sprite);
            
            members.add(Integer.toString(i),member);
            i++;
        }
        
        if (!sessions.contains(currentSession)){
            member = factory.createObjectBuilder();
            username = (String) currentSession.getUserProperties().get("user");
            
            member.add("User", username);
            member.add("LogStatus","signedout");
            members.add(Integer.toString(i),member);
        }
        
        JsonObjectBuilder serverItems = factory.createObjectBuilder();
        serverItems.add("ServerMessageType", "memberlist");
        serverItems.add("MemberList", members);
                
        JsonObjectBuilder result = factory.createObjectBuilder().add("Server", serverItems);
        
        return result.build();
    }
    
    public static JsonObject createPlayerMovement(String username, int x, int y, String facing, int sprite, String id) {
        
        return Json.createBuilderFactory(null).createObjectBuilder().
                        add("Server",Json.createBuilderFactory(null).createObjectBuilder().
                            add("ServerMessageType", "playerMovement").
                            add("User", username).
                            add("X", x).
                            add("Y", y).
                            add("Facing",facing).
                            add("Sprite",sprite).
                            add("SendId",id)).
                        build();
    }
    
    public static JsonObject getNewPlayerName(String newName){
        JsonObject json = Json.createBuilderFactory(null).createObjectBuilder().
                        add("Server",Json.createBuilderFactory(null).createObjectBuilder().
                                add("ServerMessageType","duplicateUsername").
                                add("NewUsername",newName)
                        ).build();
        
        return json;
    }
    
    public static JsonObject getClientSettings(){
        JsonObject json = Json.createBuilderFactory(null).createObjectBuilder().
                        add("Server",GameState.ClientSettings.getClientJson()).build();
        
        return json;
    }
    
    public static String getNewName(String duplicateName){
        int randomNumber = 0 + (int)(Math.random()*50000);
        return duplicateName+"-"+randomNumber;
    }
    
}
