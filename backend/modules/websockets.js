const cookieParser = require("socket.io-cookie-parser");
const sessions = require("./sessions");

module.exports = {
  io: null,
  registerServer: io => {
    module.exports.io = io;
    // This function is being called from within bin/www
    io.use(cookieParser());
  
    io.use((socket, next) => {
      sessions
        .fetchLoggedUser(socket.request.cookies)
        .then(user => {
          // TODO: maybe place user info on socket
          next();
        })
        .catch(err => {
          // disconnect unwanted visitors
          next(new Error("Authentication error"));
        });
    });
  }
};

