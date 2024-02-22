const db = require("../../models");

async function deleteItem(req, res) {
  try {
    const item = await db.item.findByPk(req.body.item_id);
    if (!item) {
      throw new Error(`Item with ID ${req.body.item_id} not found.`);
    }

    await db.item.destroy({
      where: { item_id: req.body.item_id },
    });

    res.status(201).json({
      message: `Item with ID ${req.body.item_id} deleted successfully.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = deleteItem;
