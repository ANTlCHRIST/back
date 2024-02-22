const express = require('express');
const router = express.Router();

var routerUser = require('require-directory')(module, '../router/callback/');

router.use('/', routerUser.payment);

module.exports = router;
