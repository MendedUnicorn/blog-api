var express = require('express');
var router = express.Router();
const auth = require('../controllers/authController');

/* GET users listing. */
router.post('/signup', auth.register);

//
router.post('/login', auth.login);

module.exports = router;
