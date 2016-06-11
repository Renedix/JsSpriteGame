/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ServerSocket;

import ClientMessages.ClientMessage;
import ClientMessages.ClientMessageDecoder;
import ClientMessages.ClientMessageEncoder;
import Game.GameState;
import ServerMessages.ServerMessage;
import java.io.IOException;
import java.util.Date;
import javax.json.JsonObject;
import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 *
 * @author Damien
 */
@ServerEndpoint(value = "/chat", encoders = {ClientMessageEncoder.class}, decoders = {ClientMessageDecoder.class})
public class Endpoint {
    
    private static GameState game = new GameState();

    @OnMessage
    public void messageReceived(ClientMessage message, Session session) throws IOException, EncodeException {
        
        switch (message.getType()){
            case MESSAGE: //gameSocket.sendMessageToServer()
                broadcastMessage(message.getJson());
                break;
                
            case SETUSERNAME: //gameSocket.sendClientUsername()
                String username = message.getUsername();
                if (usernameExists(username)){
                    username = ServerMessage.getNewName(username);
                    sendMesesage(session,ServerMessage.getNewPlayerName(username));
                }
                setUser(session, username);
                announceNewMembers(session);
                break;
                
            case MOVEMENT: //sprite.getGameCommand()
                game.processClientCommand(message);
                break;
        }
    }
    
    private void broadcastMessage(JsonObject message) throws IOException, EncodeException{
        GameEventExecutor.addEvent(null,message);
    }
    
    private void sendMesesage(Session peer, Object object) throws IOException, EncodeException{
        peer.getBasicRemote().sendObject(object);
    }
    
    @OnOpen
    public void onOpen (Session peer) throws IOException, EncodeException {
        GameEventExecutor.connections.add(peer);
        
        sendMesesage(peer,ServerMessage.getClientSettings());
        sendMesesage(peer,ServerMessage.createAnnouncement("Welcome to Renedix Websocket Chat!"));
    }
    
    private void announceNewMembers(Session session) throws IOException, EncodeException{
        JsonObject object = ServerMessage.createMemberList(GameEventExecutor.connections,session);
        broadcastMessage(object);
    }
    
    private void setUser(Session session, String username){
        session.getUserProperties().put("user",username);
        game.addPlayer(username);
    }

    @OnClose
    public void onClose (Session peer) throws IOException, EncodeException {
        GameEventExecutor.connections.remove(peer);
        game.removePlayer((String)peer.getUserProperties().get("user"));
        announceNewMembers(peer); 
    }

    private boolean usernameExists(String username) {
        return game.playerAlreadyExists(username);
    }
    
}
