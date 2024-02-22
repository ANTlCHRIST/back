const db = require("../../models");
const randomID = require("../../components/randomID");

async function createItem(req, res) {
  const t = await db.sequelize.transaction();

  try {
    const { name, price, cogs, qty } = req.body;
    if (parseInt(cogs) > parseInt(price))
      return res.status(400).json({
        message: "cogs value can't be over the price value",
        cogs: cogs,
        price: price,
      });

    // Process uploaded image
    const imageUrl = req.file ? req.file.path : null;

    const id = await randomID.generateID(db.item);

    const result = await db.item.create(
      {
        item_id: id,
        owner_id: req.ses.user_id,
        name: name,
        price: price,
        cogs: cogs,
        qty: qty,
        image_url: imageUrl,
      },
      { transaction: t },
    );

    const Tid = await randomID.generateID(db.transaction);
    await db.transaction.create(
      {
        transaction_id: Tid,
      },
      { transaction: t },
    );

    const Did = await randomID.generateID(db.detailed_transaction);
    await db.detailed_transaction.create(
      {
        detailed_transaction_id: Did,
        transaction_id: Tid,
        item_id: id,
        qty_stock_change: qty,
      },
      { transaction: t },
    );

    await t.commit();

    res.status(201).json(result);
  } catch (error) {
    console.error("Error:", error);
    await t.rollback();
    res.status(500).json({ message: "Error creating user" });
  }
}

module.exports = createItem;
