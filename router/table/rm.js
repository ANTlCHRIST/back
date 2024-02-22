const db = require("../../models");
const router = require("express").Router();

router.delete("/", async (req, res) => {
  try {
    await db.table.destroy({ where: { table_id: req.body.table_id } });

    res.status(201).json({ success: true, message: "delete success" });
  } catch (error) {
    res.status({ success: false, message: error.message });
  }
});

module.exports = router;
