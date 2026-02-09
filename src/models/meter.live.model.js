const mongoose = require("mongoose");

const MeterLiveSchema = new mongoose.Schema({
    meterId: { type: String, unique: true },
    voltage: Number,
    lastKwhConsumedAc: Number,
    updatedAt: Date
});

module.exports = mongoose.model("meter_live", MeterLiveSchema);
