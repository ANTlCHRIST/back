const db = require("../../models");
const Op = require("sequelize").Op;

async function get(req, res) {
  try {
    const result = await db.detailed_transaction.findAll({
      attributes: [
        "item_id",
        [db.sequelize.literal('DATE("createdAt")'), "date"],
        [
          db.sequelize.literal(
            'SUM(CASE WHEN "qty_stock_change" > 0 THEN "qty_stock_change" ELSE 0 END)',
          ),
          "in_qty",
        ],
        [
          db.sequelize.literal(
            'SUM(CASE WHEN "qty_stock_change" < 0 THEN -1 * "qty_stock_change" ELSE 0 END)',
          ),
          "out_qty",
        ],
      ],
      where: {
        createdAt: {
          [Op.between]: [req.params.startDate, req.params.endDate],
        },
      },
      group: ["item_id", "date"],
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = get;
