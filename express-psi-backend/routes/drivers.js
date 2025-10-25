const express = require("express");
const router = express.Router();

const driver_controller = require("../controllers/driverController");

// listar todos os motoristas
router.get("/", driver_controller.index);

// obter um motorista especifico
router.get("/:id", driver_controller.get_driver);

// obter um motorista especifico pelo nif
router.get("/by-nif/:nif", driver_controller.get_driver_by_nif);

// verificar se motorista ja reservou algum turno
router.get("/has-shifts/:driverId", driver_controller.driver_has_shifts);

// remover um motorista especifico
router.delete("/:id", driver_controller.delete_driver);

// adicionar um motorista
router.post("/", driver_controller.create_driver);

// atualizar um motorista especifico
router.put("/:id", driver_controller.update_driver);

module.exports = router;
