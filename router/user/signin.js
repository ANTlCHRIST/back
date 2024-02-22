const db = require("../../models");
const router = require("express").Router();
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    const cek = await db.user.findOne({
      where: { username: username },
    });

    if (!cek) throw new Error("tidak ada akun");

    const passwordMatch = await bcrypt.compare(password, cek.password);

    if (!passwordMatch) throw new Error("password salah");

    const hashedSession = await bcrypt.hash(
      cek.user_id + Date.now().toString(),
      10,
    ); // tidak akan di compare seperti password, hanya untuk membuat random id

    await db.session.create({
      session_id: hashedSession,
      user_id: cek.user_id,
      expired: false,
    });

    res.status(200).json({ success: true, session_id: hashedSession });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
});

module.exports = router;
