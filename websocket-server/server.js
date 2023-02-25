const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { initializeRoutes } = require("./routes/index");
const { Outlet } = require('../REST-server/models/outletModel');

let app = express();
app = initializeRoutes(app);
app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "welcome",
  });
});
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


const id = '1234567890';//outlet id



  io.on( "connection", socket => {
    console.log( "New client connected" );
   // get the count of currently connected users
  const connectedUsers = io.sockets.sockets.size;
  console.log(`Total connected users: ${connectedUsers}`);
  Outlet.findById(id, (err, record) => {
    if (err) {
      console.error(err);
      return;
    }
    record.headCount = io.sockets.sockets.size;
    record.save((err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('headcount updated !');
    });
  });

  // handle disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
    // update the count of connected users
    const connectedUsers = io.sockets.sockets.size;
    console.log(`Total connected users: ${connectedUsers}`);
    Outlet.findById(id, (err, record) => {
      if (err) {
        console.error(err);
        return;
      }
      record.headCount = io.sockets.sockets.size;
      record.save((err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('headcount updated !');
      });
    });

  });
  


  } );

