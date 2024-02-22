const router = require("express").Router();
const midtransClient = require("midtrans-client");
const db = require("../../models");

const socketController = require("../../controllers/socketController");

let core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: "SB-Mid-server-FDBeHcWeoTuwa3ct4NjXNFe-",
  clientKey: "SB-Mid-client-jhbclQhqnlL52XSN"
});

router.post("/payment_handler", async (req, res) => {
  try {
    let receivedJson = req.body;
    core.transaction.notification(receivedJson).then(async (transactionStatusObject) => {
      let orderId = transactionStatusObject.order_id;
      let transactionStatus = transactionStatusObject.transaction_status;
      let fraudStatus = transactionStatusObject.fraud_status;

      let summary = `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}.<br>Raw notification object:<pre>${JSON.stringify(transactionStatusObject, null, 2)}</pre>`;

      // Handle transaction status on your backend via notification alternatively
      // Sample transactionStatus handling logic
      if (transactionStatus === "capture") {
        if (fraudStatus === "challenge") {
          // TODO: Set transaction status on your database to 'challenge'
        } else if (fraudStatus === "accept") {
          // TODO: Set transaction status on your database to 'success'
        }
      } else if (transactionStatus === "settlement") {
        
        //actually i can just add user_id to customer_information when creating this transaction
        //but i want to maintain credentials. even the user_id will never be changed
        const get = await db.transaction.findOne({ where: { transaction_id: orderId } });

        await db.transaction.update(
          { payment_status: 'paid' },
          { where: { transaction_id: orderId } } //i've set the transaction_id and order_id as the same 
        );
        
        socketController.emitTransaction();
        socketController.emitFollowUp(get.buyer_id);

      } else if (
        transactionStatus === "cancel" ||
        transactionStatus === "deny" ||
        transactionStatus === "expire"
      ) {
        // TODO: Set transaction status on your database to 'failure'
      } else if (transactionStatus === "pending") {
        // TODO: Set transaction status on your database to 'pending' / waiting payment
      } else if (transactionStatus === "refund") {
        // TODO: Set transaction status on your database to 'refund'
      }
      console.log(summary);
      res.send(summary);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
