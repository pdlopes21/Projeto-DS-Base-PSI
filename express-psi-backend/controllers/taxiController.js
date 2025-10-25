const Taxi = require("../models/taxi");
const Ride = require("../models/ride");
const Shift = require('../models/shift');

const asyncHandler = require("express-async-handler");
const { body, validationResult, param } = require("express-validator");

// listar todos os taxis
exports.index = asyncHandler(async (req, res, next) => {
  const allTaxis = await Taxi.find({})
    .sort({ createdAt: -1 }) // para alinea f)
    .exec();

  res.json(allTaxis);
});

// obter um taxi especifico
exports.get_taxi = asyncHandler(async (req, res, next) => {
  const taxi = await Taxi.findById(req.params.id).exec();
  if (!taxi) {
    return res.status(404).json({ message: "Taxi not found" });
  }
  res.json(taxi);
});

// obter um taxi especifico pela matricula
exports.get_taxi_by_plate = asyncHandler(async (req, res, next) => {
  const licensePlate = req.params.licensePlate;
  const taxi = await Taxi.findOne({ licensePlate: licensePlate }).exec();
  if (!taxi) {
    return res.status(404).json({ message: "Taxi not found" });
  }
  res.json(taxi);
});

// remover um taxi especifico
exports.delete_taxi = asyncHandler(async (req, res, next) => {
  const taxi = await Taxi.findById(req.params.id).exec();

  if (!taxi) {
    return res.status(404).json({ message: "Taxi not found" });
  }

  const shiftExists = await Shift.exists({ taxi: taxi._id });

  if (shiftExists) {
    return res.status(400).json({
      message: "Cannot delete taxi: it has already been assigned to at least one shift.",
    });
  }

  await Taxi.findByIdAndDelete(req.params.id);
  res.json({ message: `Taxi with plate ${taxi.licensePlate} successfully deleted` });
});

// adicionar um taxi
exports.create_taxi = [
  // validar campos
  body("brand")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Brand must be specified."),
  body("modelName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Model must be specified."),
  body("comfortLevel")
    .trim()
    .isIn(['standard', 'luxury'])
    .withMessage("Comfort level must be either 'standard' or 'luxury'."),
  body("purchaseYear")
    .isInt({ min: 1886, max: new Date().getFullYear() })
    .withMessage("Purchase year must be a valid year between 1886 and current year."),

  // processar pedido depois da validacao
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // validar matricula
    let formattedPlate;
    try {
      formattedPlate = validateLicensePlate(req.body.licensePlate);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const taxi = new Taxi({
      licensePlate: formattedPlate,
      purchaseYear: req.body.purchaseYear,
      brand: req.body.brand,
      modelName: req.body.modelName,
      comfortLevel: req.body.comfortLevel,
    });

    try {
      await taxi.save();
      res.status(201).json(taxi);
    } catch (err) {
      // codigo 11000 = duplicate key error, garantir que a matricula eh unica
      if (err.code === 11000 && err.keyPattern && err.keyPattern.licensePlate) {
        return res.status(409).json({ message: "License plate already belongs to another taxi." });
      }
      // propagar erro em outros casos
      next(err);
    }
  }),
];

// atualizar um taxi especifico
exports.update_taxi = [
  // validar campos
  body("brand")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Brand must be specified."),
  body("modelName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Model must be specified."),
  body("comfortLevel")
    .trim()
    .isIn(['standard', 'luxury'])
    .withMessage("Comfort level must be either 'standard' or 'luxury'."),
  body("purchaseYear")
    .isInt({ min: 1886, max: new Date().getFullYear() })
    .withMessage("Purchase year must be a valid year between 1886 and current year."),

  // processar pedido depois da validacao
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // validar matricula
    let formattedPlate;
    try {
      formattedPlate = validateLicensePlate(req.body.licensePlate);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const taxiToUpdate = await Taxi.findById(req.params.id);
    if (!taxiToUpdate) {
      return res.status(404).json({ message: "Taxi doesnt exist" });
    }

    else {
      taxiToUpdate.licensePlate = req.body.licensePlate;
      taxiToUpdate.purchaseYear = req.body.purchaseYear;
      taxiToUpdate.brand = req.body.brand;
      taxiToUpdate.modelName = req.body.modelName;
      taxiToUpdate.comfortLevel = req.body.comfortLevel;
      taxiToUpdate.createdAt = Date.now();

      try {
        await taxiToUpdate.save();
        res.status(200).json(taxiToUpdate);
      } catch (err) {
        // codigo 11000 = duplicate key error, garantir que a matricula eh unica
        if (err.code === 11000 && err.keyPattern && err.keyPattern.licensePlate) {
          return res.status(409).json({ message: "License plate already belongs to another taxi." });
        }
        // propagar erro em outros casos
        next(err);
      }
    }
  }),
];

// verificar se taxi ja foi usado em algum turno
exports.taxi_has_shifts = [
  param('taxiId')
    .trim()
    .isMongoId()
    .withMessage('Invalid Taxi ID'),

  asyncHandler(async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taxiId } = req.params;

    const taxi = await Taxi.findById(taxiId).exec();
    if (!taxi) {
      return res.status(404).json({ message: 'Taxi not found' });
    }

    //checa se existe pelo menos 1 shift onde o taxi foi usado
    const shiftExists = await Shift.exists({ taxi: taxi._id });

    res.json({ exists: Boolean(shiftExists) });
  })
];

// verificar se taxi ja foi usado em alguma viagem
exports.taxi_has_rides = [
  param('taxiId')
    .trim()
    .isMongoId()
    .withMessage('Invalid Taxi ID'),

  asyncHandler(async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taxiId } = req.params;

    const taxi = await Taxi.findById(taxiId).exec();
    if (!taxi) {
      return res.status(404).json({ message: 'Taxi not found' });
    }

    // busca os IDs de shift desse taxi
    const shifts = await Shift.find({ taxi: taxi._id }).select('_id');
    const shiftIds = shifts.map(s => s._id);

    // checa se existe pelo menos 1 ride para qualquer desses shifts
    const rideExists = await Ride.exists({ shift: { $in: shiftIds } });

    res.json({ exists: Boolean(rideExists) });
  })
];

function validateLicensePlate(unfilteredPlate) {

  if (!unfilteredPlate) {
    throw new Error("License plate is required.");
  }

  const filteredPlate = unfilteredPlate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();    // remover tudo que nao for letra ou numero, e deixar upperCase

  if (filteredPlate.length !== 6) {
    throw new Error("License plate must have exactly 6 alphanumeric characters.");
  }

  // dividir em 3 pares, ja que pares tem que ter o mesmo tipo (letra ou digito)
  const parts = [
    filteredPlate.slice(0, 2),
    filteredPlate.slice(2, 4),
    filteredPlate.slice(4, 6),
  ];

  let hasLetters = false
  let hasDigits = false

  for (const p of parts) {
    if (/^[A-Z]{2}$/.test(p)) {
      hasLetters = true;
    }
    else if (/^[0-9]{2}$/.test(p)) {
      hasDigits = true;
    }
    else {
      throw new Error("Invalid license plate: pairs must be two letters or two digits.");
    }
  }

  // pelo menos um par de cada tipo  
  if (!hasLetters || !hasDigits) {
    throw new Error("License plate must include at least one pair of letters and one pair of digits.");
  }

  return parts.join('-');
}
