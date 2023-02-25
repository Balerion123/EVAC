const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

let app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});



httpServer.listen(port, () => {
  console.log(`evac app listening on port ${port}`);
});



module.exports = function ( io, opts ) {

  io.sockets.on( "connection", function ( socket ) {
    socket.on( "entered", () => {

      let user = socket.decoded_token.user.name;
      console.log( "hi user", user ,socket.id);
      let outlet = socket.decoded_token.outlet;

      opts.outlets.filter( ( o ) => o.name === outlet )[0].users.push( user );
      socket.join( outlet );

      io.to( outlet ).emit( "user entered", user );
    } );

    socket.on( "message sent", ( message ) => {
      let user = socket.decoded_token.user.name;
      let outlet = socket.decoded_token.outlet;

      io.to( outlet ).emit( "message received", user, message );
    } );

    socket.on( "disconnect", () => {
      let user = socket.decoded_token.user.name;
      let outlet = socket.decoded_token.outlet;

      opts.outlets.filter( ( r ) => r.name === outlet )[0].users.splice( user, 1 );

      io.to( outlet ).emit( "user exited", user );
    } );

    let users = [];
    //need to send list to outlets.people present

    users.push( {
      user: "test"
    } );

    socket.emit( "entered--", users );

  } );

};
