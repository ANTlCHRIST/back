// email zaditgans671555@gmail.com
//instagram@insvrgent
//kodingan hanya saya dan tuhan yang tau
//siapa tau pengen mukul saya
const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const db = require("./models");

const userController = require("./controllers/userController");
const tableController = require("./controllers/tableController");
const itemController = require("./controllers/itemController");
const transactionController = require("./controllers/transactionController");
const detailController = require("./controllers/detailController");
const spotifyController = require("./controllers/spotifyController");
const socketController = require("./controllers/socketController");
const callbackController = require("./controllers/callbackController");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/users", userController);
app.use("/table", tableController);
app.use("/transaction", transactionController);
app.use("/item", itemController);
app.use("/detail", detailController);
app.use("/spotify", spotifyController);
app.use("/callback", callbackController);

const PORT = process.env.PORT;
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "https://7rhqk8-3000.csb.app",
  },
});

db.sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });

socketController(io);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
