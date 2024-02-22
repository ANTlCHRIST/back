const db = require("../../models");
const Op = require("sequelize").Op;

async function get(req, res) {
  try {
    const result = await db.transaction.findOne({
      attributes: [
        [
          db.sequelize.literal(`
                    (SELECT SUM(-1 * d.qty_stock_change * (i.price - i.cogs))
                     FROM detailed_transactions d
                     JOIN items i ON d.item_id = i.item_id
                     WHERE d.transaction_id = transaction_id AND d.qty_stock_change < 0
                    )`),
          "net",
        ],
        [
          db.sequelize.literal(`
                        (SELECT SUM(-1 * d.qty_stock_change * i.price)
                         FROM detailed_transactions d
                         JOIN items i ON d.item_id = i.item_id
                         WHERE d.transaction_id = transaction_id AND d.qty_stock_change < 0
                        )`),
          "gross",
        ],
        [
          db.sequelize.literal(`
                            (SELECT SUM(-1 * d.qty_stock_change * i.cogs)
                             FROM detailed_transactions d
                             JOIN items i ON d.item_id = i.item_id
                             WHERE d.transaction_id = transaction_id AND d.qty_stock_change > 0
                            )`),
          "capital",
        ],
      ],
      where: {
        createdAt: {
          [Op.between]: [req.params.startDate, req.params.endDate],
        },
      },
      raw: true,
    });

    return res
      .status(201)
      .json({ net: result.net, gross: result.gross, capital: result.capital });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = get;
