const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { auth } = require('../middlewares/auth');

router.post('/', auth, exportController.exportData);

module.exports = router;