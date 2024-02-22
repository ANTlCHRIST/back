const db = require("../../models");
const router = require("express").Router();
const { Op } = require("sequelize");

router.get("/", async (req, res) => {
  try {
    const transactions = await db.transaction.findAll({
      where: { buyer_id: req.ses.user_id },
      include: [
        {
          model: db.detailed_transaction,
          attributes: ["detailed_transaction_id", "qty_stock_change", "status"],
          include: [
            {
              model: db.item,
              attributes: ["item_id", "price", "name", "image_url"],
            },
          ],
        },
        {
          model: db.table,
          attributes: ["table_id", "no_table"],
        },
      ],
    });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
