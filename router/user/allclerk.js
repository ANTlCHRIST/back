var db = require("../../models");
const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const user = await db.user.findOne({
      where: { role: "clerk" },
    });

    if (!user) {
      return res.status(404).json({ message: "No clerk found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
