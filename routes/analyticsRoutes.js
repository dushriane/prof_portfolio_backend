const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, analyticsController.getAnalytics);

module.exports = router;