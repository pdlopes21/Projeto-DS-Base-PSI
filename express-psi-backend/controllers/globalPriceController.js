const GlobalPrice = require("../models/globalPrice");
const asyncHandler = require("express-async-handler");

// obtem o aumento de preco noturno
exports.get_night_increase = asyncHandler(async (req, res, next) => {
    const increase = await GlobalPrice.findOne();
    if (!increase) {
        return res.status(404).json({ message: "Night-time increase not found." });
    }
    res.json(increase);
});

// atualiza o aumento de preco noturno
exports.update_night_increase = asyncHandler(async (req, res, next) => {
    const { nightTimeIncrease } = req.body;

    if (nightTimeIncrease < 0 || nightTimeIncrease > 100) {
        return res.status(400).json({ message: "Night-time increase must be between 0 and 100." });
    }

    let increase = await GlobalPrice.findOne();

    increase.nightTimeIncrease = nightTimeIncrease;

    await increase.save();
    res.json({ message: "Night time increase updated.", increase });
});
