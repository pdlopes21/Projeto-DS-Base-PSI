const Driver = require("../models/driver");
const Shift = require('../models/shift');

const asyncHandler = require("express-async-handler");
const { body, validationResult, param } = require("express-validator");

// listar todos os motoristas
exports.index = asyncHandler(async (req, res, next) => {
    const allDrivers = await Driver.find({})
        .sort({ createdAt: -1 }) // para alinea d)
        .exec();

    res.json(allDrivers);
});

// obter um motorista especifico
exports.get_driver = asyncHandler(async (req, res, next) => {
    const driver = await Driver.findById(req.params.id).exec();
    if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver);
});

// obter um motorista especifico pelo nif
exports.get_driver_by_nif = asyncHandler(async (req, res, next) => {
    const nif = req.params.nif;
    const driver = await Driver.findOne({ nif: nif }).exec();
    if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver);
});

// remover um motorista especifico
exports.delete_driver = asyncHandler(async (req, res, next) => {
    const driver = await Driver.findById(req.params.id).exec();

    if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
    }

    const shiftExists = await Shift.exists({ driver: driver._id });

    if (shiftExists) {
        return res.status(400).json({
            message: "Cannot delete driver: it has already been assigned to at least one shift.",
        });
    }

    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: `Driver with nif ${driver.nif} successfully deleted` });
});

// adicionar um motorista
exports.create_driver = [
    // validar campos
    body("nif")
        .trim()
        .matches(/^[0-9]{9}$/)
        .withMessage('NIF must be 9 digits'),
    body("name")
        .trim()
        .isLength({ min: 1, max: 100 })
        .escape()
        .withMessage("Driver name must be specified.")
        .isAlphanumeric('en-US', { ignore: " " })
        .withMessage("Driver name has non-alphanumeric characters."),
    body("gender")
        .trim()
        .isIn(['male', 'female'])
        .withMessage('Gender must be male or female'),
    body('birthYear')
        .isInt({ min: 1900, max: new Date().getFullYear() - 18 })
        .withMessage('Driver must be at least 18 years old'),
    body('driversLicense')
        .trim()
        .matches(/^[A-Z0-9]{1,12}$/)
        .withMessage('Driver license is required and max length 12'),

    body("address.street")
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Street must be specified."),
    body("address.doorNumber")
        .trim()
        .isLength({ min: 1, max: 10 })
        .withMessage("Door number must be specified."),
    body("address.postalCode")
        .trim()
        .matches(/^[0-9]{4}-[0-9]{3}$/)
        .withMessage('Postal code must match format: 1234-567'),
    body('address.locality')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Locality must be specified."),

    // processar pedido depois da validacao
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const driver = new Driver({
            nif: req.body.nif,
            name: req.body.name,
            gender: req.body.gender,
            birthYear: req.body.birthYear,
            driversLicense: req.body.driversLicense,

            address: {
                street: req.body.address.street,
                doorNumber: req.body.address.doorNumber,
                postalCode: req.body.address.postalCode,
                locality: req.body.address.locality,
            }
        });

        try {
            await driver.save();
            res.status(201).json(driver);
        } catch (err) {
            // codigo 11000 = duplicate key error, garantir que nif e driversLicense sao unicos
            if (err.code === 11000) {
                const key = Object.keys(err.keyPattern)[0];

                let readableKey = key;
                if (key === 'driversLicense') {
                    readableKey = "Driver's license";
                } else if (key === 'nif') {
                    readableKey = "NIF";
                }

                return res.status(409).json({ message: `${readableKey} already exists.` });
            }
            // propagar erro em outros casos
            next(err);
        }
    }),

];

// atualizar um motorista especifico
exports.update_driver = [
    // validação dos campos (igual ao create_driver)
    body("nif")
        .trim()
        .matches(/^[0-9]{9}$/)
        .withMessage('NIF must be 9 digits'),
    body("name")
        .trim()
        .isLength({ min: 1, max: 100 })
        .escape()
        .withMessage("Driver name must be specified.")
        .isAlphanumeric('en-US', { ignore: " " })
        .withMessage("Driver name has non-alphanumeric characters."),
    body("gender")
        .trim()
        .isIn(['male', 'female'])
        .withMessage('Gender must be male or female'),
    body('birthYear')
        .isInt({ min: 1900, max: new Date().getFullYear() - 18 })
        .withMessage('Driver must be at least 18 years old'),
    body('driversLicense')
        .trim()
        .matches(/^[A-Z0-9]{1,12}$/)
        .withMessage('Driver license is required and max length 12'),
    body("address.street")
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Street must be specified."),
    body("address.doorNumber")
        .trim()
        .isLength({ min: 1, max: 10 })
        .withMessage("Door number must be specified."),
    body("address.postalCode")
        .trim()
        .matches(/^[0-9]{4}-[0-9]{3}$/)
        .withMessage('Postal code must match format: 1234-567'),
    body('address.locality')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Locality must be specified."),

    // processar pedido depois da validação
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const driverData = {
            nif: req.body.nif,
            name: req.body.name,
            gender: req.body.gender,
            birthYear: req.body.birthYear,
            driversLicense: req.body.driversLicense,
            address: {
                street: req.body.address.street,
                doorNumber: req.body.address.doorNumber,
                postalCode: req.body.address.postalCode,
                locality: req.body.address.locality,
            },
            createdAt: Date.now()
        };

        try {
            const updatedDriver = await Driver.findByIdAndUpdate(
                req.params.id,
                driverData,
                { new: true, runValidators: true }
            );
            if (!updatedDriver) {
                return res.status(404).json({ message: "Driver not found" });
            }
            res.json(updatedDriver);
        } catch (err) {
            // código 11000 = duplicate key error
            if (err.code === 11000) {
                const key = Object.keys(err.keyPattern)[0];

                let readableKey = key;
                if (key === 'driversLicense') {
                    readableKey = "Driver's license";
                } else if (key === 'nif') {
                    readableKey = "NIF";
                }

                return res.status(409).json({ message: `${readableKey} already belongs to another driver.` });
            }
            next(err);
        }
    }),
];

// verificar se motorista ja reservou algum turno
exports.driver_has_shifts = [
    param('driverId')
        .trim()
        .isMongoId()
        .withMessage('Invalid Driver ID'),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { driverId } = req.params;

        const driver = await Driver.findById(driverId).exec();
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // verifica se o motorista ja foi usado em algum turno
        const shiftExists = await Shift.exists({ driver: driver._id });

        res.json({ exists: Boolean(shiftExists) });
    }),
];