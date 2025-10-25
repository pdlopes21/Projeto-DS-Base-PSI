const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');
const globalPriceController = require('../controllers/globalPriceController');

// retorna o preco associado ao nivel de conforto do taxi
router.get('/by-taxi-type/:taxiType', priceController.get_price_by_taxi_type);

// retorna ambos os precos
router.get('/', priceController.index);

// atualiza o preco associado ao nivel de conforto do taxi
router.put('/', priceController.update_price);

// obtem o aumento de preco noturno
router.get('/night-increase', globalPriceController.get_night_increase);

// atualiza o aumento de preco noturno
router.put('/night-increase', globalPriceController.update_night_increase);

module.exports = router;