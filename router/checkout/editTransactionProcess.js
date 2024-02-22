const db = require("../../models");
const router = require("express").Router();
const socketController = require("../../controllers/socketController");

router.put("/", async (req, res) => {
  try {
    const { detailed_transaction_id } = req.body;

    const detailedTransaction = await db.detailed_transaction.findOne({
      where: { detailed_transaction_id: detailed_transaction_id },
      include: [{ model: db.transaction, attributes: ["buyer_id", "payment_status"] }],
    });

    if(detailedTransaction.transaction.payment_status === "pending") return res.status(405);
    if (detailedTransaction.dataValues.status === "33") return res.status(400);

    await db.detailed_transaction.update(
      {
        status: db.sequelize.literal(`status + ${11}`),
      },
      {
        where: { detailed_transaction_id: detailed_transaction_id },
      },
    );

    socketController.emitFollowUp(detailedTransaction.transaction.buyer_id);

    res.status(200).json({ message: "follow up transaction successfully." });
  } catch (error) {
    console.error("update transaction failed:", error);
    res.status(500).json(error.message);
  }
});

module.exports = router;
