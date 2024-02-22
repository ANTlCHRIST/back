var db = require("../../models");

async function editItem(req, res) {
  try {
    const { item_id, name, price, cogs, qty } = req.body;
    if (cogs > price)
      return res
        .status(400)
        .json({ message: "cogs value can't be over the db.item price" });

    let imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    }

    await db.item.update(
      {
        name: name,
        price: price,
        cogs: cogs,
        qty: qty,
        image_url: imageUrl,
      },
      { where: { item_id: item_id } },
    );

    return res.status(201).json({ message: "editing success" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error editing item" });
  }
}

module.exports = editItem;
