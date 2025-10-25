const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');

// mostra um relatorio geral de um periodo
router.get('/totals', reportController.get_report_totals);

// mostra um relatorio mais detalhado
router.get('/subtotals', reportController.get_report_subtotals);

// mostra um relatorio mais detalhado do motorista
router.get('/subtotals/driver/:driverId', reportController.get_report_subtotals_driver);

// mostra um relatorio mais detalhado do taxi
router.get('/subtotals/taxi/:taxiId', reportController.get_report_subtotals_taxi);

module.exports = router;