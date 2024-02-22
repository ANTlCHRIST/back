const router = require("express").Router();

var routerTable = require("require-directory")(module, "../router/table/");

router.use("/all", routerTable.getall);

router.use("/", routerTable.get);

const auth = require("../components/auth");

//create item
router.use("/", auth(["admin"]), routerTable.create);

//get item
router.use("/", auth(["admin"]), routerTable.edit);

//delete item
router.use("/", auth(["admin"]), routerTable.rm);

module.exports = router;
