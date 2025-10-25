const Taxi = require("../models/taxi");
const Driver = require("../models/driver");
const Price = require("../models/price");
const GlobalPrice = require("../models/globalPrice");
const TaxiOrder = require("../models/taxiOrder");
const Shift = require("../models/shift");
const Ride = require("../models/ride");

const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");

// Restart DB.
router.get("/", asyncHandler(async (req, res, next) => {

  // apagar tudo na DB existente
  await Taxi.deleteMany({});
  await Driver.deleteMany({});
  await Price.deleteMany({});
  await GlobalPrice.deleteMany({});
  await TaxiOrder.deleteMany({});
  await Shift.deleteMany({});
  await Ride.deleteMany({});

  // enderecos
  const driverAddresses = [
    { street: "Rua Principal", doorNumber: "1", postalCode: "1000-001", locality: "Lisboa" },
    { street: "Avenida Central", doorNumber: "100", postalCode: "2000-002", locality: "Porto" },
    { street: "Travessa do Sol", doorNumber: "50", postalCode: "3000-003", locality: "Coimbra" }
  ];

  // motoristas
  const drivers = [
    {
      nif: "123456789",
      name: "Alice Silva",
      gender: "female",
      birthYear: 1985,
      driversLicense: "AB12345678",
      address: driverAddresses[0]
    },
    {
      nif: "987654321",
      name: "Bruno Costa",
      gender: "male",
      birthYear: 1978,
      driversLicense: "CD87654321",
      address: driverAddresses[1]
    },
    {
      nif: "456789123",
      name: "Carla Sousa",
      gender: "female",
      birthYear: 1990,
      driversLicense: "EF45678912",
      address: driverAddresses[2]
    }
  ];
  await Driver.insertMany(drivers);

  // taxis
  const taxis = [
    { licensePlate: "AB-12-CD", purchaseYear: 2018, brand: "Toyota", modelName: "Prius", comfortLevel: "standard" },
    { licensePlate: "12-EF-34", purchaseYear: 2020, brand: "Mercedes", modelName: "S-Class", comfortLevel: "luxury" },
    { licensePlate: "GH-56-78", purchaseYear: 2019, brand: "Ford", modelName: "Focus", comfortLevel: "standard" },
    { licensePlate: "BA-10-SI", purchaseYear: 2017, brand: "Alfa Romeo", modelName: "Sedan", comfortLevel: "luxury" },
    { licensePlate: "SJ-47-OK", purchaseYear: 2010, brand: "Volkswagen", modelName: "Polo", comfortLevel: "standard" }
  ];
  await Taxi.insertMany(taxis);

  // precos
  const prices = [
    { taxiType: "standard", pricePerMinute: 0.60 },
    { taxiType: "luxury", pricePerMinute: 0.9 }
  ];
  await Price.insertMany(prices);

  // aumento preco durante noite
  const increase = { nightTimeIncrease: 15 };
  await GlobalPrice.create(increase);

  // endereços (apenas em Lisboa)
  const addresses = [
    { street: "Rua da Prata", doorNumber: "87", postalCode: "1100-420", locality: "Lisboa", lat: 38.707593, lon: -9.136555 },
    { street: "Largo do Chiado", doorNumber: "39", postalCode: "1200-307", locality: "Lisboa", lat: 38.709088, lon: -9.141470 },
    { street: "Praça do Comércio", doorNumber: "1", postalCode: "1100-148", locality: "Lisboa", lat: 38.707750, lon: -9.136592 },
    { street: "Avenida da Liberdade", doorNumber: "180", postalCode: "1250-147", locality: "Lisboa", lat: 38.722252, lon: -9.139337 },
    { street: "Rua Garrett", doorNumber: "50", postalCode: "1200-203", locality: "Lisboa", lat: 38.710071, lon: -9.142615 }
  ];

  // pedidos
  const taxiOrders = [
    {
      client: { name: "Tiago Mendes", nif: "123123123", gender: "male" },
      location: { lat: addresses[0].lat, lon: addresses[0].lon },
      destination: { lat: addresses[1].lat, lon: addresses[1].lon },
      locationAddress: addresses[0],
      destinationAddress: addresses[1],
      numberOfPeople: 2,
      comfortLevel: "standard"
    },
    {
      client: { name: "João Carvalho", nif: "555444333", gender: "male" },
      location: { lat: addresses[2].lat, lon: addresses[2].lon },
      destination: { lat: addresses[3].lat, lon: addresses[3].lon },
      locationAddress: addresses[2],
      destinationAddress: addresses[3],
      numberOfPeople: 1,
      comfortLevel: "luxury"
    },
    {
      client: { name: "Maria Ferreira", nif: "777888999", gender: "female" },
      location: { lat: addresses[4].lat, lon: addresses[4].lon },
      destination: { lat: addresses[0].lat, lon: addresses[0].lon },
      locationAddress: addresses[4],
      destinationAddress: addresses[0],
      numberOfPeople: 3,
      comfortLevel: "standard"
    }
  ];
  await TaxiOrder.insertMany(taxiOrders);

  // adiciona turnos ativos aos motoristas
  var now = new Date();
  var threeHoursLater = new Date(now.getTime() + 180 * 60 * 1000);

  var allDrivers = await Driver.find();
  var allTaxis = await Taxi.find();

  var shifts = allDrivers.map((driver, i) => ({
    driver: driver._id,
    taxi: allTaxis[i % allTaxis.length]._id, // distribui taxis circularmente
    timePeriod: {
      start: now,
      end: threeHoursLater
    }
  }));

  await Shift.insertMany(shifts);

  // adiciona turnos antigos aos motoristas
  now.setDate(now.getDate() - 1);
  threeHoursLater = new Date(now.getTime() + 180 * 60 * 1000);

  allDrivers = await Driver.find();
  allTaxis = await Taxi.find();

  shifts = allDrivers.map((driver, i) => ({
    driver: driver._id,
    taxi: allTaxis[i % allTaxis.length]._id, // distribui taxis circularmente
    timePeriod: {
      start: now,
      end: threeHoursLater
    }
  }));

  const activeShifts = await Shift.insertMany(shifts);

  //viagens
  const rides = [];

  const ridesPerShift = 3;
  const rideDurationMs = 30 * 60 * 1000; // 30 minutos

  activeShifts.forEach((shift, shiftIndex) => {
    for (let i = 0; i < ridesPerShift; i++) {
      // hora de início da viagem i para este shift, sequencial
      const rideStart = new Date(shift.timePeriod.start.getTime() + i * rideDurationMs);
      const rideEnd = new Date(rideStart.getTime() + rideDurationMs);

      // reutilizar pedidos de taxi de forma circular
      const order = taxiOrders[(shiftIndex * ridesPerShift + i) % taxiOrders.length];

      rides.push({
        client: order.client,
        shift: shift._id,
        timePeriod: {
          start: rideStart,
          end: rideEnd,
        },
        start: order.location,
        end: order.destination,
        startAddress: order.locationAddress,
        endAddress: order.destinationAddress,
        numberOfPeople: order.numberOfPeople,
        distanceKm: 5,
        price: 10,
        sequenceNumber: i + 1, // sequência por shift, pode ajustar
      });
    }
  });

  await Ride.insertMany(rides);

  const driver = {
    nif: "987656789",
    name: "Gustavo Fring",
    gender: "male",
    birthYear: 1986,
    driversLicense: "GX48678912",
    address: addresses[2]
  }
  await Driver.create(driver);

  res.status(200).json({ message: "DB inicializada." });
}));

module.exports = router;
