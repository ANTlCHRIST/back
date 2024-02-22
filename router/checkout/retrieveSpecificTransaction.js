const db = require("../../models");

async function retrieveSpecificTransaction(req, res) {
  try {
    const transaction_id = req.params.transaction_id;
    const get = await db.transaction.findOne({
      where: { buyer_id: req.ses.user_id, transaction_id: transaction_id },
    });

    if (get) {
      res.status(200).json(get);
    } else {
      res.status(404).json({ message: "transaction not found" });
    }
  } catch (error) {
    console.error("Error while fetching item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = retrieveSpecificTransaction;
