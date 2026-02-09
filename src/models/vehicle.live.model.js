const mongoose = require("mongoose");

const VehicleLiveSchema = new mongoose.Schema({
    vehicleId: { type: String, unique: true },
    soc: Number,
    batteryTemp: Number,
    lastKwhDeliveredDc: Number,
    updatedAt: Date
});

module.exports = mongoose.model("vehicle_live", VehicleLiveSchema);
