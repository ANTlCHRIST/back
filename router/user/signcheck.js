const router = require("express").Router();
const socketController = require("../../controllers/socketController");

router.post("/", async (req, res) => {
  if (req.ses.user.role === "clerk")
    socketController.signClerk(req.body.socketId, req.ses.user.user_id);
  else if (req.ses.user.role === "guest")
    socketController.signGuest(req.body.socketId, req.ses.user.user_id);

  return res.status(200).json({
    success: true,
    user_id: req.ses.user.user_id,
    role: req.ses.user.role,
  });
});

module.exports = router;
