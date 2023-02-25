"use strict";

const socketioJwt = require( "socketio-jwt" );

module.exports = function ( io, opts ) {

  io.sockets.on( "connection", socketioJwt.authorize( {
    secret: JWT,
    timeout: 15000 // 15 seconds to send the authentication message
  } ) ).on( "authenticated", function ( socket ) {
    socket.on( "entered", () => {

      let user = socket.decoded_token.user.name;
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

    users.push( {
      user: "test"
    } );

    socket.emit( "entered--", users );

  } );

};
