package ServerSocket;
import Game.GameState;
import Game.Player;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.websocket.EncodeException;
import javax.websocket.Session;

public class GameEventExecutor {
    
    public static Set<Session> connections = new HashSet<Session>();
    private static List<Event> events = new ArrayList<Event>();
    private static int tickrate = GameState.ClientSettings.clientMessageRate;
    private static int tickrateMs = 1000/tickrate;
    
    private static Timer tickrateTimer;
    
    public static void kickoffProcess(){
        if (tickrateTimer==null){
            tickrateTimer = new Timer();
            tickrateTimer.schedule(new AnnounceEvent(), 0, tickrateMs);
        }
    }
    
    public static void addEvent(Player player, JsonObject json){
        events.add(new Event(json,player));
    }
    
    static class AnnounceEvent extends TimerTask {
        public void run() {
            
            if (!events.isEmpty()){
                // get messages
                List<Event> sendEvents = events;
                events = new ArrayList<Event>();
                
                //probably best to package them all
                JsonObjectBuilder packagedEvents = Json.createBuilderFactory(null).createObjectBuilder();
                JsonObjectBuilder multipleEvents = Json.createBuilderFactory(null).createObjectBuilder();
                
                for (int i = 0; i < sendEvents.size(); i++) {
                    // To prevent 
                    if (sendEvents.get(i).getPlayer()!=null){
                        sendEvents.get(i).getPlayer().setPlayerIsMoving(false);
                    }
                    
                    JsonObject sendEvent = sendEvents.get(i).getJson();
                    
                    multipleEvents.add(Integer.toString(i), sendEvent);
                }
                packagedEvents.add("MassEvents",multipleEvents);
                
                broadcastEvent(packagedEvents.build());
            }
        }
        
        private void broadcastEvent(JsonObject event){
            for (Session peer : connections) {
                try {
                    peer.getBasicRemote().sendObject(event);
                } catch (IOException ex) {
                    Logger.getLogger(GameEventExecutor.class.getName()).log(Level.SEVERE, null, ex);
                } catch (EncodeException ex) {
                    Logger.getLogger(GameEventExecutor.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        }
        
    }
    
    private static class Event{
        private JsonObject json;
        private Player player;

        public Event(JsonObject json, Player player) {
            this.json = json;
            this.player = player;
        }

        public JsonObject getJson() {
            return json;
        }

        public void setJson(JsonObject json) {
            this.json = json;
        }

        public Player getPlayer() {
            return player;
        }

        public void setPlayer(Player player) {
            this.player = player;
        }
    }
    
    
    

}
