var osc = require("osc"),
    http = require("http"),
    express = require("express"),
    WebSocket = require("ws");
 
// Create an Express server app
// and serve up a directory of static files.
let portNum = 8081;
var app = express(),
    server = app.listen(portNum);
 
app.use("/", express.static(__dirname + "/static"));
 
// Listen for Web Socket requests.
var wss = new WebSocket.Server({
    server: server
});
 
// Listen for Web Socket connections.
wss.on("connection", function (socket) {
    var socketPort = new osc.WebSocketPort({
        socket: socket,
        metadata: true
    });

    console.log("WebSocket connection made on port", portNum)

    socketPort.on("message", function (oscMsg) {
        console.log("An OSC Message was received!", oscMsg);
    });
});

console.log("Express server up and running")