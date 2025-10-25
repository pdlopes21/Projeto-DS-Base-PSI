const express = require('express');
const router = express.Router();

const rideController = require('../controllers/rideController');

// listar todas as viagens
router.get('/', rideController.index);

// mostrar uma viagem especifica
router.get('/ride/:id', rideController.get_ride);

// obter todas as viagens de um motorista especifico
router.get('/driver/:driverId', rideController.get_rides_by_driver);

// obter uma viagem pelo pedido de taxi feito pelo cliente
router.get('/taxiOrder/:taxiOrderId', rideController.get_ride_by_taxi_order);

// comecar uma viagem
router.post('/', rideController.start_ride);

// terminar uma viagem
router.patch('/ride/:id', rideController.finish_ride);

module.exports = router;