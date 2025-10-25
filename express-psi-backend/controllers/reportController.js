const Shift = require("../models/shift");
const Ride = require('../models/ride');
const Taxi = require("../models/taxi");
const Driver = require("../models/driver");

const asyncHandler = require("express-async-handler");
const { validationResult, param, query } = require("express-validator");

// mostra um relatorio geral de um periodo
exports.get_report_totals = [
    query('start').optional().isISO8601().toDate(),
    query('end').optional().isISO8601().toDate(),

    asyncHandler(async (req, res, next) => {
        const today = new Date();
        const startToday = new Date(today.setHours(0, 0, 0, 0));
        const endToday = new Date(today.setHours(23, 59, 59, 999));

        const start = req.query.start || startToday;
        const end = req.query.end || endToday;

        if (start > end) {
            return res.status(400).json({ error: 'Start date must be before end date.' });
        }

        const rides = await Ride.find({
            "timePeriod.start": { $lt: end },
            "timePeriod.end": { $gt: start }
        });

        let totalHours = 0;
        let totalDistance = 0;

        for (const ride of rides) {
            if (!ride.timePeriod.end || !ride.distanceKm) {
                continue;
            }
            const startTime = new Date(ride.timePeriod.start);
            const endTime = new Date(ride.timePeriod.end);
            const duration = (endTime - startTime) / 3600000;
            totalHours += duration;

            totalDistance += ride.distanceKm;
        }

        res.status(200).json({
            totalRides: rides.length,
            totalHours: parseFloat(totalHours.toFixed(2)),
            totalDistance: parseFloat(totalDistance.toFixed(2))
        });
    }),
];

// mostra um relatorio mais detalhado
exports.get_report_subtotals = [
    query('start').optional().isISO8601().toDate(),
    query('end').optional().isISO8601().toDate(),

    asyncHandler(async (req, res, next) => {
        const today = new Date();
        const startToday = new Date(today.setHours(0, 0, 0, 0));
        const endToday = new Date(today.setHours(23, 59, 59, 999));

        const start = req.query.start || startToday;
        const end = req.query.end || endToday;

        if (start > end) {
            return res.status(400).json({ error: 'Start date must be before end date.' });
        }

        const rides = await Ride.find({
            "timePeriod.start": { $lt: end },
            "timePeriod.end": { $gt: start }
        }).populate({
            path: "shift",
            populate: { path: "taxi driver" }
        });

        const driverMap = new Map();
        const taxiMap = new Map();

        for (const ride of rides) {
            if (!ride.timePeriod.end) {
                continue;
            }

            const startTime = new Date(ride.timePeriod.start);
            const endTime = new Date(ride.timePeriod.end);
            const duration = parseFloat(((endTime - startTime) / 3600000).toFixed(2));

            const distance = ride.distanceKm;

            // motorista
            const driverId = ride.shift.driver._id.toString();
            const driverName = ride.shift.driver.name;
            if (!driverMap.has(driverId)) {
                const driverInfo = { id: driverId, name: driverName, totalHours: duration, totalRides: 1, totalDistance: distance };
                driverMap.set(driverId, driverInfo);
            }
            else {
                const dInfo = driverMap.get(driverId)
                dInfo.totalHours += duration;
                dInfo.totalRides += 1;
                dInfo.totalDistance += distance;
            }

            // taxi
            const taxiId = ride.shift.taxi._id.toString();
            const taxiPlate = ride.shift.taxi.licensePlate;
            if (!taxiMap.has(taxiId)) {
                const taxiInfo = { id: taxiId, name: taxiPlate, totalHours: duration, totalRides: 1, totalDistance: distance };
                taxiMap.set(taxiId, taxiInfo);
            }
            else {
                const tInfo = taxiMap.get(taxiId)
                tInfo.totalHours += duration;
                tInfo.totalRides += 1;
                tInfo.totalDistance += distance;
            }
        }

        // converter em arrays
        const drivers = Array.from(driverMap.values());
        const taxis = Array.from(taxiMap.values());

        res.status(200).json({ drivers, taxis });
    }),
];

// mostra um relatorio mais detalhado do motorista
exports.get_report_subtotals_driver = [
    param('driverId')
        .trim()
        .isMongoId()
        .withMessage('Driver ID must be a valid ID'),
    query('start').optional().isISO8601().toDate(),
    query('end').optional().isISO8601().toDate(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const today = new Date();
        const startToday = new Date(today.setHours(0, 0, 0, 0));
        const endToday = new Date(today.setHours(23, 59, 59, 999));

        const start = req.query.start || startToday;
        const end = req.query.end || endToday;

        if (start > end) {
            return res.status(400).json({ error: 'Start date must be before end date.' });
        }

        const driver = await Driver.findById(req.params.driverId).exec();
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        const allRides = await Ride.find({
            "timePeriod.end": { $gt: start }
        })
            .populate({
                path: "shift",
                populate: { path: "driver" }
            })
            .sort({ "timePeriod.end": -1 });

        const rides = allRides.filter(r =>
            r.shift.driver._id.equals(driver._id)
        );

        res.status(200).json({ driver, rides });
    }),
];

// mostra um relatorio mais detalhado do taxi
exports.get_report_subtotals_taxi = [
    param('taxiId')
        .trim()
        .isMongoId()
        .withMessage('Taxi ID must be a valid ID'),
    query('start').optional().isISO8601().toDate(),
    query('end').optional().isISO8601().toDate(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const today = new Date();
        const startToday = new Date(today.setHours(0, 0, 0, 0));
        const endToday = new Date(today.setHours(23, 59, 59, 999));

        const start = req.query.start || startToday;
        const end = req.query.end || endToday;

        const taxi = await Taxi.findById(req.params.taxiId).exec();
        if (!taxi) {
            return res.status(404).json({ message: 'Taxi not found' });
        }

        const allRides = await Ride.find({
            "timePeriod.start": { $lt: end },
            "timePeriod.end": { $gt: start },
        })
            .populate({
                path: "shift",
                populate: { path: "taxi" }
            })
            .sort({ "timePeriod.end": -1 });

        const rides = allRides.filter(r =>
            r.shift.taxi._id.equals(taxi._id)
        );

        res.status(200).json({ taxi, rides });
    }),
];