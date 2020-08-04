var osc = require("osc"),
    http = require("http"),
    express = require("express"),
    WebSocket = require("ws");
 




var getIPAddresses = function () {
    var os = require("os"),
    interfaces = os.networkInterfaces(),
    ipAddresses = [];

    for (var deviceName in interfaces){
        var addresses = interfaces[deviceName];

        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];

            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};


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

var udp = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 5432,
    remoteAddress: "127.0.0.1",
    remotePort: 57120
});

udp.on("ready", function () {
    var ipAddresses = getIPAddresses();
    console.log("Interface:");
    ipAddresses.forEach(function (address) {
        console.log("Listening on", address + ":" + udp.options.localPort);
    });
    console.log("Sending to", udp.options.remoteAddress + ":" + udp.options.remotePort);
    console.log("");
});

udp.open();

 
// Listen for Web Socket connections.
wss.on("connection", function (socket) {
    var socketPort = new osc.WebSocketPort({
        socket: socket,
        metadata: true
    });

    console.log("WebSocket connection made on port", portNum)

    var relay = new osc.Relay(udp, socketPort, {
        raw: true
    });

    socketPort.on("message", function (oscMsg) {
        console.log("An OSC Message was received!", oscMsg);
    });

    udp.on("message", function (oscMsg) {
        console.log("An OSC Message was received!", oscMsg);
    });
});

console.log("Express server up and running")
