const express = require('express');
const router = express.Router();

const taxiOrderController = require('../controllers/taxiOrderController');

// listar todos os pedidos
router.get('/', taxiOrderController.index);

// listar todos os pedidos pendentes
router.get('/pending', taxiOrderController.get_pending_taxiOrders);

// listar todos os pedidos pendentes onde o motorista nao foi rejeitado
router.get('/pending-for-driver/:driverId', taxiOrderController.get_pending_taxiOrders_for_driver);

// mostrar um pedido especifico
router.get('/taxiOrder/:id', taxiOrderController.get_taxiOrder);

// criar um novo pedido
router.post('/', taxiOrderController.create_taxiOrder);

// aceitar um pedido
router.put('/accept/:id', taxiOrderController.accept_taxiOrder);

// confirmar um pedido
router.put('/confirm/:id', taxiOrderController.confirm_taxiOrder);

// rejeitar um pedido
router.put('/reject/:id', taxiOrderController.reject_taxiOrder);

// cancelar um pedido
router.put('/cancel/:id', taxiOrderController.cancel_taxiOrder);

// resetar um pedido
router.put('/reset/:id', taxiOrderController.reset_to_pending);

// motorista avisar que chegou
router.put('/arrived/:id', taxiOrderController.driver_arrived);

module.exports = router;