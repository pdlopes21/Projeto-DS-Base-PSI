const Shift = require("../models/shift");
const Taxi = require("../models/taxi");

const asyncHandler = require("express-async-handler");
const { body, validationResult, param } = require("express-validator");

// mostrar todos os turnos
exports.index = asyncHandler(async (req, res, next) => {
    const allShifts = await Shift.find({})
        .populate("driver")
        .populate("taxi")
        .exec();

    res.json(allShifts);
});

// mostrar um turno especifico
exports.get_shift = asyncHandler(async (req, res) => {
    console.log("Requested shift ID:", req.params.id);

    const shift = await Shift.findById(req.params.id).populate('taxi driver').exec();
    if (!shift) {
        return res.status(404).json({ message: 'Shift not found' });
    }
    res.json(shift);
});

// mostra os turnos de um motorista
exports.get_driver_shifts = [
    param('driver')
        .trim()
        .isMongoId()
        .withMessage('Driver ID must be a valid ID'),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { driver } = req.params;
        const shifts = await Shift.find({ driver })
            .populate('taxi driver')
            .sort({ 'timePeriod.start': 1 })
            .exec();

        res.status(200).json(shifts);
    }),
];

// mostra o turno ativo de um motorista
exports.get_driver_active_shift = [
    param('driver')
        .trim()
        .isMongoId()
        .withMessage('Driver ID must be a valid ID'),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { driver } = req.params;
        const now = new Date();
        const activeShift = await Shift.findOne({
            driver,
            'timePeriod.start': { $lte: now },
            'timePeriod.end': { $gt: now }
        }).populate('taxi driver');

        if (!activeShift) {
            return res.status(404).send();
        }

        res.status(200).json(activeShift);
    }),
];

// mostra os taxis disponiveis para reservar durante o periodo dado
exports.get_available_taxis = [
    body('timePeriod.start').
        isISO8601().
        toDate().
        withMessage('Start time must be a valid date'),
    body('timePeriod.end').
        isISO8601().
        toDate().
        withMessage('End time must be a valid date'),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const timePeriod = req.body.timePeriod;

        const start = new Date(timePeriod.start);
        const end = new Date(timePeriod.end);

        const allShifts = await Shift.find()
            .populate('taxi');

        // verificar quais taxis intersetam
        const busyTaxis = allShifts
            .filter(s => s.timePeriod.start < end && s.timePeriod.end > start)
            .map(s => s.taxi._id.toString());

        const availableTaxis = await Taxi.find({
            _id: { $nin: busyTaxis }
        });

        res.status(200).json(availableTaxis);
    }),
];

// criar um turno
exports.create_shift = [
    body('driver')
        .trim()
        .isMongoId()
        .withMessage('Driver must be a valid ID'),
    body('taxi')
        .trim()
        .isMongoId()
        .withMessage('Taxi must be a valid ID'),
    body('timePeriod.start').
        isISO8601().
        toDate().
        withMessage('Start time must be a valid date'),
    body('timePeriod.end').
        isISO8601().
        toDate().
        withMessage('End time must be a valid date'),

    // processar pedido depois da validacao
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { driver, taxi, timePeriod } = req.body;

        const start = new Date(timePeriod.start);
        const end = new Date(timePeriod.end);
        const now = new Date();

        if (start >= end) return res.status(400).json({ error: 'Shift may not begin after it has ended.' });
        if (start < now) return res.status(400).json({ error: 'Shift may not be booked for the past.' });

        const durationHours = (end - start) / (1000 * 60 * 60);
        if (durationHours > 8) return res.status(400).json({ error: 'Shift may not be longer than 8 hours.' });

        // verificar se motorista tem algum turno que interseta
        const driverShifts = await Shift.find({ driver });
        const overlappingDriverShift = driverShifts.find(s =>
            s.timePeriod.start < end && s.timePeriod.end > start
        );

        if (overlappingDriverShift) {
            return res.status(400).json({ error: 'Driver has an overlapping shift.' });
        }

        // verificar se o taxi tem algum turno que interseta
        const taxiShifts = await Shift.find({ taxi });
        const overlappingTaxiShift = taxiShifts.find(s =>
            s.timePeriod.start < end && s.timePeriod.end > start
        );

        if (overlappingTaxiShift) {
            return res.status(400).json({ error: 'Taxi has an overlapping shift.' });
        }

        const shift = new Shift({
            driver,
            taxi,
            timePeriod
        });

        await shift.save();
        res.status(201).json(shift);
    }),
];