const Ride = require("../models/ride");
const Shift = require('../models/shift');
const Price = require("../models/price");
const GlobalPrice = require("../models/globalPrice");

const asyncHandler = require("express-async-handler");
const { body, validationResult, param } = require("express-validator");

// listar todas as viagens
exports.index = asyncHandler(async (req, res, next) => {
    const allRides = await Ride.find({})
        .populate("shift")
        .exec();

    res.json(allRides);
});

// mostrar uma viagem especifica
exports.get_ride = asyncHandler(async (req, res) => {
    const ride = await Ride.findById(req.params.id).populate('shift').exec();
    if (!ride) {
        return res.status(404).json({ message: 'Ride not found' });
    }
    res.json(ride);
});

// obter todas as viagens de um motorista especifico
exports.get_rides_by_driver = asyncHandler(async (req, res) => {
    const { driverId } = req.params;

    if (!driverId) {
        return res.status(400).json({ message: "Driver ID is required." });
    }

    const rides = await Ride.find({})
        .populate({
            path: 'shift',
            match: { driver: driverId },
        })
        .exec();

    // filtrar para pegar apenas viagens do motorista
    const filteredRides = rides.filter(ride => ride.shift !== null);

    res.json(filteredRides);
});

// comecar uma viagem
exports.start_ride = [
    body("client.nif")
        .trim()
        .matches(/^[0-9]{9}$/)
        .withMessage('NIF must be 9 digits'),
    body("client.name")
        .trim()
        .isLength({ min: 1, max: 100 })
        .escape()
        .withMessage("Client name must be specified.")
        .isAlphanumeric('en-US', { ignore: " " })
        .withMessage("Client name has non-alphanumeric characters."),
    body("client.gender")
        .trim()
        .isIn(['male', 'female'])
        .withMessage('Gender must be male or female'),
    body('shift')
        .trim()
        .isMongoId()
        .withMessage('Shift must be a valid ID'),
    body('timePeriod.start').
        isISO8601().
        toDate().
        withMessage('Start time must be a valid date'),
    body('start.lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Start address latitude must be between -90 and 90'),
    body('start.lon')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Start address longitude must be between -180 and 180'),
    body('numberOfPeople')
        .isInt({ min: 1, max: 6 })
        .withMessage('Number of people must be at least 1 and maximum 6'),
    body('taxiOrder')
        .trim()
        .isMongoId()
        .withMessage('Taxi Order must be a valid ID'),

    body("startAddress.street").trim().isLength({ min: 1, max: 100 }).withMessage("Street must be specified."),
    body("startAddress.doorNumber").trim().isLength({ min: 1, max: 10 }).withMessage("Door number must be specified."),
    body("startAddress.postalCode").trim().matches(/^[0-9]{4}-[0-9]{3}$/).withMessage('Postal code must match format: 1234-567'),
    body('startAddress.locality').trim().isLength({ min: 1, max: 100 }).withMessage("Locality must be specified."),

    // processar pedido depois da validacao
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { timePeriod, client, start, numberOfPeople, taxiOrder } = req.body;

        const now = new Date();
        if (timePeriod.start < now) return res.status(400).json({ message: 'Ride may not start in the past.' });

        const shift = await Shift.findById(req.body.shift).populate("timePeriod");
        if (!shift) return res.status(404).json({ message: "Shift not found" });

        // verificar validade do comeco da viagem em relacao ao turno
        const { start: shiftStart, end: shiftEnd } = shift.timePeriod;
        if (timePeriod.start < shiftStart || timePeriod.start > shiftEnd) {
            return res.status(400).json({ message: "Ride must start within the shift period" });
        }

        // verificar validade do comeco da viagem em relacao a viagem
        const overlappingOpen = await Ride.findOne({
            shift: shift._id,
            "timePeriod.start": { $lte: timePeriod.start },
            // considerar viagens acabadas e nao acabadas
            $or: [
                { "timePeriod.end": { $exists: false } },
                { "timePeriod.end": null },
                { "timePeriod.end": { $gt: timePeriod.start } }
            ]
        });
        if (overlappingOpen) {
            return res
                .status(400)
                .json({ message: "There is another ongoing ride at that start time." });
        }

        const seqCount = await Ride.countDocuments({ shift: shift._id });
        const sequenceNumber = seqCount + 1;

        const ride = new Ride({
            client,
            shift,
            timePeriod,
            start,
            numberOfPeople,
            sequenceNumber,
            taxiOrder,
            startAddress: {
                street: req.body.startAddress.street,
                doorNumber: req.body.startAddress.doorNumber,
                postalCode: req.body.startAddress.postalCode,
                locality: req.body.startAddress.locality,
            },
        });

        await ride.save();
        res.status(201).json(ride);
    }),
];

// terminar uma viagem
exports.finish_ride = [
    param("id")
        .isMongoId()
        .withMessage("Invalid ride ID"),
    body("end.lat")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude invalid"),
    body("end.lon")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude invalid"),
    body('timePeriod.end').
        isISO8601().
        toDate().
        withMessage('End time must be a valid date'),

    body("endAddress.street").trim().isLength({ min: 1, max: 100 }).withMessage("Street must be specified."),
    body("endAddress.doorNumber").trim().isLength({ min: 1, max: 10 }).withMessage("Door number must be specified."),
    body("endAddress.postalCode").trim().matches(/^[0-9]{4}-[0-9]{3}$/).withMessage('Postal code must match format: 1234-567'),
    body('endAddress.locality').trim().isLength({ min: 1, max: 100 }).withMessage("Locality must be specified."),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const ride = await Ride.findById(req.params.id).populate({ path: "shift", populate: "taxi" }).exec();
        if (!ride) return res.status(404).json({ message: "Ride not found" });

        const { timePeriod } = req.body;

        // verificar validade do comeco da viagem em relacao ao turno
        const { start: shiftStart, end: shiftEnd } = ride.shift.timePeriod;
        if (timePeriod.end < shiftStart || timePeriod.end > shiftEnd) {
            return res.status(400).json({ message: "Ride must end within the shift period." });
        }
        if (timePeriod.end < ride.timePeriod.start) {
            return res.status(400).json({ message: "Ride must end after it has started" });
        }

        // verificar validade do comeco da viagem em relacao a viagem
        const overlapping = await Ride.findOne({
            shift: ride.shift._id,
            "timePeriod.start": { $lt: timePeriod.end },
            "timePeriod.end": { $gt: timePeriod.start },
        });
        if (overlapping) {
            return res
                .status(400)
                .json({ message: "There is already a ride in this shift that overlaps the given period." });
        }

        // calcular distancia Haversine
        const toRad = v => (v * Math.PI) / 180;
        const { lat: φ1, lon: λ1 } = ride.start;
        const { lat: φ2, lon: λ2 } = req.body.end;
        const R = 6371;
        const dφ = toRad(φ2 - φ1), dλ = toRad(λ2 - λ1);
        const a =
            Math.sin(dφ / 2) ** 2 +
            Math.cos(toRad(φ1)) * Math.cos(toRad(φ2)) * Math.sin(dλ / 2) ** 2;
        const d = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        ride.end = req.body.end;
        ride.distanceKm = parseFloat(d.toFixed(2));
        ride.timePeriod.end = timePeriod.end;
        ride.endAddress = {
            street: req.body.endAddress.street,
            doorNumber: req.body.endAddress.doorNumber,
            postalCode: req.body.endAddress.postalCode,
            locality: req.body.endAddress.locality,
        };

        // obter preco do tipo do taxi
        const comfort = ride.shift.taxi.comfortLevel;
        const priceDoc = await Price.findOne({ taxiType: comfort }).exec();
        if (!priceDoc) {
            return res.status(500).json({ message: "Price config missing for taxi type" });
        }
        const baseRate = priceDoc.pricePerMinute;

        // obter acrescimo noturno
        let gp = await GlobalPrice.findOne().exec();
        if (!gp) gp = await new GlobalPrice().save();
        const nightInc = gp.nightTimeIncrease;

        // calcular preco
        const startMin = Math.round(new Date(ride.timePeriod.start).getTime() / 60000);
        const endMin = Math.round(timePeriod.end.getTime() / 60000);
        let totalCost = 0;

        for (let m = startMin; m < endMin; m++) {
            const minuteOfDay = (m % (24 * 60) + 24 * 60) % (24 * 60);
            const isNight = minuteOfDay >= 21 * 60 || minuteOfDay < 6 * 60;
            const rate = baseRate * (isNight ? (1 + nightInc / 100) : 1);
            totalCost += rate;
        }

        ride.price = parseFloat(totalCost.toFixed(2));

        await ride.save();
        res.json(ride);
    }),
];

// obter uma viagem pelo pedido de taxi feito pelo cliente
exports.get_ride_by_taxi_order = async (req, res) => {
    const { taxiOrderId } = req.params;

    const ride = await Ride.findOne({ taxiOrder: taxiOrderId, 'timePeriod.end': { $exists: true, $ne: null } })
        .populate('shift')

    return res.json(ride);
};