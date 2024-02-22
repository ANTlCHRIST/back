const db = require("../../models");
const router = require("express").Router();
const randomID = require("../../components/randomID");

router.post("/", async (req, res) => {
  try {
    const { no_table, xpos, ypos } = req.body;

    const id = await randomID.generateID(db.table);

    const cek = await db.table.findOne({
      where: { no_table: no_table },
    });
    if (cek) throw new Error("nomor meja sudah ada");

    await db.table.create({
      table_id: id,
      no_table: no_table,
      xpos: xpos,
      ypos: ypos,
    });

    res.status(201).json({ success: true, message: id });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
