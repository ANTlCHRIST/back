const express = require('express');
const router = express.Router();

var routerUser = require('require-directory')(module, '../router/user/');

//register as guest
router.use('/firstscan', routerUser.firstscan);

//login
router.use('/signin', routerUser.signin);

const auth = require('../components/auth');

//check if user is still logged id
router.use('/signcheck', auth([]), routerUser.signcheck);

//update
router.use('/update', auth([]), routerUser.update);

//logout
router.use('/signout', auth([]), routerUser.signout);

//get all sessions
router.use('/allsession', auth([]), routerUser.allsession);

//get all users
router.use('/allguest', auth(['admin', 'clerk']), routerUser.allguest);

//get all users
router.use('/allclerk', auth(['admin']), routerUser.allclerk);

//register clerk
router.use('/reg', auth(['admin']), routerUser.regClerk);

module.exports = router;
