const db = require("../../models");
const { Op } = require("sequelize");

async function get(req, res) {
  try {
    const transactions = await db.transaction.findAll({
      where: {
        createdAt: {
          [Op.between]: [req.params.startDate, req.params.endDate],
        },
      },
      include: [
        {
          model: db.detailed_transaction,
          attributes: ["detailed_transaction_id", "qty_stock_change"],
          include: [
            {
              model: db.item,
              attributes: ["item_id", "price", "cogs"],
            },
          ],
        },
      ],
    });

    return res.status(500).json(transactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = get;
