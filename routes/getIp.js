const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const getIpCtrl = require('../controllers/getIp');

router.use(bodyParser.json());

router.get('/', getIpCtrl.getIp);

module.exports = router;
