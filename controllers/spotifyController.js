require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const axios = require("axios");
const authRouter = express.Router();
const auth = require("../components/auth");
const socketController = require("./socketController");

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

let access_token = "";
let refresh_token = "";
let device_id = "";

// Routes
authRouter.get("/login", auth(["clerk"]), (req, res) => {
  const scope = encodeURIComponent(
    "user-read-private user-read-email user-read-playback-state user-modify-playback-state",
  );

  res.json({
    redirectUrl: `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${scope}&redirect_uri=${REDIRECT_URI}`,
  });
});

authRouter.get("/logout", auth(["clerk"]), (req, res) => {
  access_token = "";
  refresh_token = "";
  device_id = "";
  socketController.clearCurrentTrack();
});

authRouter.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    // Exchange code for tokens
    await exchangeCodeForTokens(code);

    // Fetch user devices
    await fetchUserDevices();

    // Set up token refresh mechanism
    setInterval(refreshToken, 1000 * 60 * 60); // 1 hour interval

    // Redirect the user back to the frontend with the tokens
    res.redirect(`https://wcwxocv.localto.net/`);
  } catch (error) {
    console.error("Error during authorization:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//its for checking if theres a device or not that this backend take hold
authRouter.get("/check", auth(["clerk"]), async (req, res) => {
  try {
    const validationResponse = await axios.get(
      "https://api.spotify.com/v1/me/player/devices",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (
      validationResponse.status === 200 &&
      validationResponse.data.devices[0].id === device_id
    ) {
      checkSubscription(res);
    } else {
      res.status(401).json({ error: "Token is invalid" });
    }
  } catch (error) {
    // console.error("Error during token validation:", error);
    res.status(401).json({ error: "Internal server error" });
  }
});

async function checkSubscription(res) {
  try {
    await axios.put(
      "https://api.spotify.com/v1/me/player",
      {
        device_ids: [""],
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    if (error.response) {
      if (error.response.data.error.reason === "PREMIUM_REQUIRED")
        res.status(403).json({ error: "Premium required" });
    } else if (error.request) {
      res.status(500).json({ error: error.message });
    } else {
      console.log("Error:", error.message);
    }
  }
}

// Function to exchange authorization code for access token and refresh token after clerk successed login with spotify
async function exchangeCodeForTokens(code) {
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    method: "post",
    params: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const response = await axios(authOptions);
  access_token = response.data.access_token;
  refresh_token = response.data.refresh_token;
  socketController.setAccessToken(access_token);
}

// Function to fetch user devices
async function fetchUserDevices() {
  const devicesResponse = await axios.get(
    "https://api.spotify.com/v1/me/player/devices",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
  );

  // Check if devices exist in the response
  if (devicesResponse.data.devices && devicesResponse.data.devices.length > 0) {
    device_id = devicesResponse.data.devices[0].id;
    socketController.setDeviceId(device_id);
    console.log("User devices:", device_id);
  } else {
    console.log("No devices found for the user.");
  }
}

async function refreshToken() {
  try {
    const refreshOptions = {
      url: "https://accounts.spotify.com/api/token",
      method: "post",
      params: {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const response = await axios(refreshOptions);
    access_token = response.data.access_token;
    refresh_token = response.data.refresh_token;
    socketController.setAccessToken(access_token);

    console.log("Token refreshed:", access_token);
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}

authRouter.post("/vote", auth(["guest"]), async (req, res) => {
  try {
    const {trackId, isOk} = req.body;
    const votion = await socketController.voteTrack(req.ses.user_id, trackId, isOk);
    console.log(votion);
    res.json({ message: votion });
  } catch (error) {
    // console.error("Error during token validation:", error);
    res.status(401).json({ error: "Internal server error" });
  }
});

module.exports = authRouter;
