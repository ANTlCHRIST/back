const db = require("../../models");
const router = require("express").Router();
const socketController = require("../../controllers/socketController");

router.put("/", async (req, res) => {
  try {
    const { detailed_transaction_id } = req.body;

    const detailedTransaction = await db.detailed_transaction.findOne({
      where: { detailed_transaction_id: detailed_transaction_id },
      include: [{ model: db.transaction, attributes: ["buyer_id"] }],
    });

    if (detailedTransaction.dataValues.status !== "11") return res.status(400);

    await db.detailed_transaction.update(
      {
        status: "43",
      },
      {
        where: { detailed_transaction_id: detailed_transaction_id },
      },
    );

    socketController.emitTransaction();
    socketController.emitFollowUp(detailedTransaction.transaction.buyer_id);

    res.status(200).json({ message: "follow up transaction successfully." });
  } catch (error) {
    console.error("update transaction failed:", error);
    res.status(500).json(error.message);
  }
});

module.exports = router;
