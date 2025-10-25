const express = require("express");
const router = express.Router();

const taxi_controller = require("../controllers/taxiController");

// listar todos os taxis
router.get("/", taxi_controller.index);

// obter um taxi especifico
router.get("/:id", taxi_controller.get_taxi);

// obter um taxi especifico pela matricula
router.get("/by-plate/:licensePlate", taxi_controller.get_taxi_by_plate);

// remover um taxi especifico
router.delete("/:id", taxi_controller.delete_taxi);

// adicionar um taxi
router.post("/", taxi_controller.create_taxi);

// atualizar um taxi especifico
router.put("/:id", taxi_controller.update_taxi);

// verificar se taxi ja foi usado em algum turno
router.get("/has-shifts/:taxiId", taxi_controller.taxi_has_shifts);

// verificar se taxi ja foi usado em alguma viagem
router.get("/has-rides/:taxiId", taxi_controller.taxi_has_rides);

module.exports = router;
