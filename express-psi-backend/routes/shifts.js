const express = require('express');
const router = express.Router();

const shiftController = require('../controllers/shiftController');

// mostrar todos os turnos
router.get('/', shiftController.index);

// mostrar um turno especifico
router.get('/shift/:id', shiftController.get_shift);

// mostra os turnos de um motorista
router.get('/driver/:driver', shiftController.get_driver_shifts);

// mostra o turno ativo de um motorista
router.get('/driver/active-shift/:driver', shiftController.get_driver_active_shift);

// mostra os taxis disponiveis para reservar durante o periodo dado
router.post('/taxis', shiftController.get_available_taxis);

// criar um turno
router.post('/', shiftController.create_shift);

module.exports = router;