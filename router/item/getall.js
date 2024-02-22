const db = require("../../models");

async function getAllItems(req, res) {
  try {
    const items = await db.item.findAll();
    return res.status(200).json(items);
  } catch (error) {
    console.error("Error while fetching items:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = getAllItems;
