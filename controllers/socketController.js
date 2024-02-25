const axios = require("axios");
const db = require("../models");

let io = null;
let access_token = "";
let device_id = "";
let currentTrack = [];
const trackQueue = {};
let clerkSockets = {};
let guestSockets = {};
let timeoutRef;

const voteTrack = async (user_id, trackId, isOk) => {
  if (trackQueue.hasOwnProperty(trackId)) {
    // Check if the user_id has already voted on the track
    const upvotes = trackQueue[trackId][1];
    const downvotes = trackQueue[trackId][2];
    
    if (!upvotes.includes(user_id) && !downvotes.includes(user_id)) {
      // If the user hasn't voted, add the user_id to the appropriate array
      if (isOk) {
        upvotes.push(user_id);
        io.emit("addqueue", trackQueue);
        return "upvote success";
      } else {
        downvotes.push(user_id);
        io.emit("addqueue", trackQueue);
        return "downvote success";
      }
    }
    return "already voted";
  }
};


//if theres a success transaction, this will be called
const emitTransaction = (transaction_id) => {
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }
  console.log("new transaction");
  Object.values(clerkSockets).forEach((socketId) => {
    io.to(socketId).emit("transaction", { transaction_id });
  });
};

const emitFollowUp = (buyer_id) => {
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }

  Object.entries(guestSockets).forEach(([user_id, socketId]) => {
    if (user_id === buyer_id) {
      io.to(socketId).emit("followUp");
    }
  });
};

//this will be called by signcheck if theres a clerk load
const signClerk = (socketId, user_id) => {
  clerkSockets[user_id] = socketId;
  console.log(clerkSockets);
};

//this will be called by signcheck if theres a clerk load
const signGuest = (socketId, user_id) => {
  guestSockets[user_id] = socketId;
  console.log(guestSockets);
};

//this will be called if clerk is login spotify
const setAccessToken = (token) => {
  access_token = token;
};

//this will be called if clerk is login spotify
const setDeviceId = (token) => {
  device_id = token;

  clearTimeout(timeoutRef); // Clear any existing timeout
  timeoutRef = setTimeout(() => getCurrentTrack(io), 2000); // Set the timeout again
};

const clearCurrentTrack = () => {
  currentTrack = [];
  io.emit("spotifyStatus", 401);
};

//this will be called sometime by its own interval
const getCurrentTrack = async (io) => {
  try {
    if (access_token === "") throw "no token";
    const response = await axios.get(
      `https://api.spotify.com/v1/me/player/currently-playing`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const { item } = response.data;
    const trackName = item.name;
    const trackImage = item.album.images[0].url; // Assuming you want the first image
    const artists = item.artists.map((artist) => artist.name).join(", ");
    const duration = item.duration_ms;

    const progress_ms = response.data.progress_ms;
    const remaining_ms = duration - progress_ms;
    const intervalTime = remaining_ms > 0 ? remaining_ms : 1000;

    console.log("Track Name:", trackName);
    console.log("Track Image URL:", trackImage);
    console.log("Artists:", artists);

    // Update current track information
    if (response.data.is_playing) currentTrack = item;
    else {
      currentTrack = [];
      io.emit("current", currentTrack);

      throw "no track";
    }

    // Emit current track information to all sockets
    io.emit("current", currentTrack);

    timeoutRef = setTimeout(() => getCurrentTrack(io), intervalTime); // Update the timeout reference
  } catch (error) {
    console.error("Error fetching currently playing track:", error);
    timeoutRef = setTimeout(() => getCurrentTrack(io), 10000); // Retry after 10 seconds on error
  }
};

//this will be called when clerk is login, to detect if there a song played
const emitCurrentTrack = async (io) => {
  try {
    io.emit("current", currentTrack);
  } catch (error) {
    console.error("Error fetching currently playing track:", error);
  }
};

const playVotedTrack = async (trackId) => {
    console.log(trackId);
    console.log(device_id);
    const socketId = socket.id;

    try {
      await axios.post(
        `https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A${trackId}&device_id=${device_id}`,
        null, // No data to send in the request body
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      // Assuming you want to inform the client that the track was added successfully
      io.to(socketId).emit("trackadded", { success: true });
    } catch (error) {
      console.error("Error adding track to queue:", error);
      // Emit an error event to inform the client about the failure
      io.to(socketId).emit("tracknotadded", {
        success: false,
        error: error.message,
      });
    }

    if (currentTrack.length > 0) return;

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play`,
        null, // No data to send in the request body
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
    } catch (error) {
      console.error("Error resuming queue:", error);
    }
};

module.exports = (socketIo) => {
  io = socketIo; // Assign the passed socketIo to the io variable
  
  io.on("connection", (socket) => {
    io.emit("current", currentTrack);
    console.log("A user connected");
    io.emit("addqueue", trackQueue);
    socket.on("disconnect", () => {
      console.log("User disconnected");

      // Remove the user_id association on disconnect
      Object.keys(clerkSockets).forEach((user_id) => {
        if (clerkSockets[user_id] === socket.id) {
          delete clerkSockets[user_id];
        }
      });

      Object.keys(guestSockets).forEach((user_id) => {
        if (guestSockets[user_id] === socket.id) {
          delete guestSockets[user_id];
        }
      });
    });

    socket.on("chat message", (msg) => {
      console.log("message: " + msg);
      io.emit("chat message", msg); // Broadcast the message to all clients
    });

    //will be called if a user search for a song
    socket.on("reqtrack", async (data) => {
      console.log(socket.id);
      const { searchTerm } = data;
      const socketId = socket.id;

      try {
        const response = await axios.get(
          `https://api.spotify.com/v1/search?q=${searchTerm}&type=track&limit=5`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        );

        const tracks = response.data.tracks.items;
        io.to(socketId).emit("restrack", {
          action: "reqtrack",
          tracks,
          socketId,
        });

        // Send current track information if available
        if (currentTrack) {
          socket.emit("current", currentTrack);
        }
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    });

    socket.on("addtrack", async (trackId) => {
      console.log(trackId);
      console.log(device_id);
      const socketId = socket.id;
    
      try {
        const track = await axios.get(
          `https://api.spotify.com/v1/tracks/${trackId}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        );

        if (!trackQueue.hasOwnProperty(trackId)) {
          trackQueue[trackId] = [track.data, [], []]; // Save track data in index 0
          io.emit("addqueue", trackQueue); // Emit the updated trackQueue to all sockets
        }
      } catch (error) {
        console.error("Error adding track to queue:", error);
      }
    });

    //called on user login
    emitCurrentTrack(io);
  });

  //called on start
  getCurrentTrack(io);
};

// module.exports.clerkSockets = clerkSockets;
module.exports.voteTrack = voteTrack;
module.exports.signClerk = signClerk;
module.exports.signGuest = signGuest;
module.exports.setAccessToken = setAccessToken;
module.exports.setDeviceId = setDeviceId;
module.exports.emitTransaction = emitTransaction;
module.exports.emitFollowUp = emitFollowUp;
module.exports.clearCurrentTrack = clearCurrentTrack;
