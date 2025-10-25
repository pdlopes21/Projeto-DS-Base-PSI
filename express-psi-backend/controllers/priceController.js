const Price = require('../models/price');
const asyncHandler = require('express-async-handler');

// retorna ambos os precos
exports.index = asyncHandler(async (req, res) => {
  const prices = await Price.find().sort({ createdAt: -1 });
  res.json(prices);
});

// retorna o preco associado ao nivel de conforto do taxi
exports.get_price_by_taxi_type = asyncHandler(async (req, res, next) => {
    const taxiType = req.params.taxiType;
    const price = await Price.findOne({ taxiType: taxiType }).exec();
    if (!price) {
      return res.status(404).json({ message: "Price not found" });
    }
    res.json(price);
});

// atualiza o preco associado ao nivel de conforto do taxi
exports.update_price = asyncHandler(async (req, res) => {
  const { taxiType, pricePerMinute } = req.body;

  // verificar se todos os campos necessarios estao presentes
  if (!taxiType || typeof pricePerMinute !== 'number') {
    return res.status(400).json({
      message: "Invalid or missing fields. Ensure 'taxiType' is provided and 'pricePerMinute' are numbers."
    });
  }

  const price = await Price.findOne({ taxiType: taxiType });

  if (!price) {
    return res.status(404).json({ message: "Price not found for the specified taxi type" });
  }

  price.pricePerMinute = pricePerMinute;

  const updatedPrice = await price.save();

  res.status(200).json(updatedPrice);
});