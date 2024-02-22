const router = require("express").Router();
var routerItem = require("require-directory")(module, "../router/item/");
const upload = require("../components/fileStorage");

//get all item
router.get("/all", routerItem.getall);

//get item
router.get("/:item_id", routerItem.get);

const auth = require("../components/auth");

//create item
router.post("/", auth(["admin"]), upload.single("image"), routerItem.create);

//edit item
router.put("/", auth(["admin"]), upload.single("image"), routerItem.edit);

//delete item
router.delete("/", auth(["admin"]), routerItem.rm);

module.exports = router;
