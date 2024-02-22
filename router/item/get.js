const db = require("../../models");

async function getItem(req, res) {
  try {
    const itemId = req.params.item_id;
    const get = await db.item.findOne({
      where: { item_id: itemId },
    });

    if (get) {
      res.status(200).json(get);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Error while fetching item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = getItem;
