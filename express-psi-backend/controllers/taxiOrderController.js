const TaxiOrder = require("../models/taxiOrder");
const Driver = require("../models/driver");
const Taxi = require("../models/taxi");

const asyncHandler = require("express-async-handler");
const { body, param, validationResult } = require("express-validator");

// criar um novo pedido
exports.create_taxiOrder = [
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
    body('location.lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Location latitude must be between -90 and 90'),
    body('location.lon')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Location longitude must be between -180 and 180'),
    body('destination.lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Destination latitude must be between -90 and 90'),
    body('destination.lon')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Destination longitude must be between -180 and 180'),
    body('numberOfPeople')
        .isInt({ min: 1, max: 6 })
        .withMessage('Number of people must be at least 1 and maximum 6'),
    body("comfortLevel")
        .trim()
        .isIn(['standard', 'luxury'])
        .withMessage("Comfort level must be either 'standard' or 'luxury'."),

    body("locationAddress.street").trim().isLength({ min: 1, max: 100 }).withMessage("Street must be specified."),
    body("locationAddress.doorNumber").trim().isLength({ min: 1, max: 10 }).withMessage("Door number must be specified."),
    body("locationAddress.postalCode").trim().matches(/^[0-9]{4}-[0-9]{3}$/).withMessage('Postal code must match format: 1234-567'),
    body('locationAddress.locality').trim().isLength({ min: 1, max: 100 }).withMessage("Locality must be specified."),

    body("destinationAddress.street").trim().isLength({ min: 1, max: 100 }).withMessage("Street must be specified."),
    body("destinationAddress.doorNumber").trim().isLength({ min: 1, max: 10 }).withMessage("Door number must be specified."),
    body("destinationAddress.postalCode").trim().matches(/^[0-9]{4}-[0-9]{3}$/).withMessage('Postal code must match format: 1234-567'),
    body('destinationAddress.locality').trim().isLength({ min: 1, max: 100 }).withMessage("Locality must be specified."),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const taxiOrder = new TaxiOrder({
            client: {
                name: req.body.client.name,
                nif: req.body.client.nif,
                gender: req.body.client.gender
            },
            location: {
                lat: req.body.location.lat,
                lon: req.body.location.lon
            },
            destination: {
                lat: req.body.destination.lat,
                lon: req.body.destination.lon
            },
            locationAddress: {
                street: req.body.locationAddress.street,
                doorNumber: req.body.locationAddress.doorNumber,
                postalCode: req.body.locationAddress.postalCode,
                locality: req.body.locationAddress.locality,
            },
            destinationAddress: {
                street: req.body.destinationAddress.street,
                doorNumber: req.body.destinationAddress.doorNumber,
                postalCode: req.body.destinationAddress.postalCode,
                locality: req.body.destinationAddress.locality,
            },
            numberOfPeople: req.body.numberOfPeople,
            status: req.body.status,
            comfortLevel: req.body.comfortLevel,
        });

        await taxiOrder.save();
        res.status(201).json(taxiOrder);
    })
];

// listar todos os pedidos
exports.index = asyncHandler(async (req, res) => {
    const taxiOrders = await TaxiOrder.find().exec();
    res.json(taxiOrders);
});

// listar todos os pedidos pendentes
exports.get_pending_taxiOrders = asyncHandler(async (req, res) => {
    const pending = await TaxiOrder.find({ status: 'pending' })
        .sort({ _id: -1 })
        .exec();
    res.json(pending);
});

// listar todos os pedidos pendentes onde o motorista nao foi rejeitado
exports.get_pending_taxiOrders_for_driver = asyncHandler(async (req, res) => {
    const driverId = req.params.driverId;
    if (!driverId) {
        return res.status(401).json({ message: 'Driver could not be found' });
    }
    const pending = await TaxiOrder.find({
        status: 'pending',
        rejectedDrivers: { $ne: driverId },
        $or: [
            { 'offer.driver': { $exists: false } },
            { 'offer.driver': { $ne: driverId } }
        ]
    }).exec();
    res.json(pending);
});

// mostrar um pedido especifico
exports.get_taxiOrder = asyncHandler(async (req, res) => {
    const taxiOrder = await TaxiOrder.findById(req.params.id).exec();
    if (!taxiOrder) {
        return res.status(404).json({ message: 'Taxi order not found' });
    }

    if (taxiOrder.offer) {
        await taxiOrder.populate([
            { path: 'offer.driver' },
            { path: 'offer.taxi' }
        ]);
    }
    res.json(taxiOrder);
});

// aceitar um pedido
exports.accept_taxiOrder = [
    param('id')
        .trim()
        .isMongoId()
        .withMessage('TaxiOrder ID must be a valid ID'),
    body('offer.driver')
        .trim()
        .isMongoId()
        .withMessage('Driver ID must be a valid ID'),
    body('offer.taxi')
        .trim()
        .isMongoId()
        .withMessage('Taxi ID must be a valid ID'),
    body('offer.location.lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be valid'),
    body('offer.location.lon')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be valid'),
    body('offer.distance')
        .isFloat({ min: 0 })
        .withMessage('Distance must be non-negative'),
    body('offer.price')
        .isFloat({ min: 0 })
        .withMessage('Price must be non-negative'),

    asyncHandler(async (req, res) => {
        const taxiOrder = await TaxiOrder.findById(req.params.id).exec();
        if (!taxiOrder) {
            return res.status(404).json({ message: 'Taxi order not found' });
        }
        if (taxiOrder.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending taxi orders can be accepted' });
        }

        const offer = req.body.offer;

        const driver = await Driver.findById(offer.driver).exec();
        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        const taxi = await Taxi.findById(offer.taxi).exec();
        if (!taxi) return res.status(404).json({ message: 'Taxi not found' });

        taxiOrder.offer = offer;
        taxiOrder.status = 'accepted';
        await taxiOrder.save();

        res.json(taxiOrder);
    })
];

// confirmar um pedido
exports.confirm_taxiOrder = [
    param('id')
        .trim()
        .isMongoId()
        .withMessage('TaxiOrder ID must be a valid ID'),

    asyncHandler(async (req, res) => {
        const taxiOrder = await TaxiOrder.findById(req.params.id).exec();
        if (!taxiOrder) {
            return res.status(404).json({ message: 'Taxi order not found' });
        }
        if (taxiOrder.status !== 'accepted') {
            return res.status(400).json({ message: 'Only accepted taxi orders can be confirmed' });
        }

        taxiOrder.status = 'confirmed';
        await taxiOrder.save();
        res.json(taxiOrder);
    })
];

// rejeitar um pedido
exports.reject_taxiOrder = [
    param('id')
        .trim()
        .isMongoId()
        .withMessage('TaxiOrder ID must be a valid ID'),

    asyncHandler(async (req, res) => {
        const taxiOrder = await TaxiOrder.findById(req.params.id).exec();
        if (!taxiOrder) {
            return res.status(404).json({ message: 'Taxi order not found' });
        }
        if (taxiOrder.status !== 'accepted') {
            return res.status(400).json({ message: 'Only accepted taxi orders can be rejected' });
        }

        if (taxiOrder.offer != null) {
            const rejectedDriver = taxiOrder.offer.driver;
            if (!taxiOrder.rejectedDrivers.includes(rejectedDriver)) {
                taxiOrder.rejectedDrivers.push(rejectedDriver);
            }
            taxiOrder.offer = null;
        }

        taxiOrder.status = 'rejected';
        await taxiOrder.save();
        res.json(taxiOrder);
    })
];

// cancelar um pedido
exports.cancel_taxiOrder = [
    param('id')
        .trim()
        .isMongoId()
        .withMessage('TaxiOrder ID must be a valid ID'),

    asyncHandler(async (req, res) => {
        const taxiOrder = await TaxiOrder.findById(req.params.id).exec();
        if (!taxiOrder) {
            return res.status(404).json({ message: 'Taxi order not found' });
        }
        if (['accepted', 'pending', 'rejected'].indexOf(taxiOrder.status) === -1) {
            return res.status(400).json({ message: 'Only pending, accepted or rejected taxi orders can be canceled' });
        }

        taxiOrder.status = 'canceled';
        await taxiOrder.save();
        res.json(taxiOrder);
    })
];

// resetar um pedido
exports.reset_to_pending = [
    param('id')
        .trim()
        .isMongoId()
        .withMessage('TaxiOrder ID must be a valid ID'),

    asyncHandler(async (req, res) => {
        const taxiOrder = await TaxiOrder.findById(req.params.id).exec();
        if (!taxiOrder) {
            return res.status(404).json({ message: 'Taxi order not found' });
        }
        if (taxiOrder.status !== 'rejected') {
            return res.status(400).json({ message: 'Only rejected taxi orders can be confirmed' });
        }

        taxiOrder.status = 'pending';
        await taxiOrder.save();
        res.json(taxiOrder);
    })
];

// motorista avisar que chegou
exports.driver_arrived = [
    param('id')
        .trim()
        .isMongoId()
        .withMessage('TaxiOrder ID must be a valid ID'),

    asyncHandler(async (req, res) => {
        const taxiOrder = await TaxiOrder.findById(req.params.id).exec();
        if (!taxiOrder) {
            return res.status(404).json({ message: 'Taxi order not found' });
        }
        if (taxiOrder.status !== 'confirmed') {
            return res.status(400).json({ message: 'Only confirmed taxi orders can be changed to driverArrived' });
        }

        taxiOrder.status = 'driverArrived';
        await taxiOrder.save();
        res.json(taxiOrder);
    })
];
