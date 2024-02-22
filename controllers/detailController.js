const express = require("express");
const router = express.Router();
const auth = require("../components/auth");

var routerDetail = require("require-directory")(module, "../router/detail/");

router.use(auth(["admin"]));

router.get("/alltransaction/:startDate/:endDate", routerDetail.alltransaction);

router.get("/alldetailed/:startDate/:endDate", routerDetail.alldetailed);

router.get("/detailed/:startDate/:endDate", routerDetail.getdetailed);

router.get("/mutation/:startDate/:endDate", routerDetail.mutation);

router.get("/income/:startDate/:endDate", routerDetail.income);

router.get("/iteminfo/:startDate/:endDate", routerDetail.iteminfo);

router.delete("/deleteAll", routerDetail.deleteAllTransactions);

module.exports = router;
