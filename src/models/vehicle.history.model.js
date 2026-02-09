const mongoose = require("mongoose");

const VehicleHistorySchema = new mongoose.Schema({
    vehicleId: String,
    soc: Number,
    batteryTemp: Number,
    kwhDeliveredDc: Number,
    timestamp: Date
});

VehicleHistorySchema.index({ vehicleId: 1, timestamp: 1 });

module.exports = mongoose.model("vehicle_history", VehicleHistorySchema);
