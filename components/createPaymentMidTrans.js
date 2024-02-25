const midtransClient = require("midtrans-client");

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "SB-Mid-server-FDBeHcWeoTuwa3ct4NjXNFe-",
  clientKey: "SB-Mid-client-jhbclQhqnlL52XSN",
});

async function createTransaction(Tid, gross) {
  try {
    let parameter = {
      payment_type: "gopay",
      transaction_details: {
        order_id: Tid, //same as transaction_id
        gross_amount: gross,
      },
      gopay: {
        enable_callback: true,
        callback_url: "https://wcwxocv.localto.net/",
      },
    };

    return snap
      .createTransaction(parameter)
      .then((transaction) => {
        let transactionToken = transaction.token;
        let redirectUrl = transaction.redirect_url;
        return { transactionToken, redirectUrl };
      })
      .catch((error) => {
        console.error(error);
        throw new Error("Failed to create transaction");
      });
  } catch (error) {
    console.error("Create transaction failed:", error);
    throw new Error("Internal server error");
  }
}

module.exports = createTransaction;
