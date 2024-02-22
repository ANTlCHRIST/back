const db = require("../../models");
const router = require("express").Router();
const randomID = require("../../components/randomID");
const bcrypt = require("bcrypt");

//making guest account
router.post("/", async (req, res) => {
  try {
    const id = await randomID.generateID(db.user);

    await db.user.create({
      user_id: id,
      role: "guest",
    });

    // bcrypt tidak akan di compare seperti password, hanya untuk membuat random id
    const hashedSession = await bcrypt.hash(id + Date.now().toString(), 10);

    await db.session.create({
      session_id: hashedSession,
      user_id: id,
      expired: false,
    });

    //after the guest scan the qr code, it will be a guest mode-
    //-if they skipped to update account, then client side save the session_id to local
    res.status(201).json({ success: true, session_id: hashedSession });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
