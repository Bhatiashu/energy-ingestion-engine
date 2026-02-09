const mongoose = require("mongoose");

const MeterHistorySchema = new mongoose.Schema({
    meterId: String,
    kwhConsumedAc: Number,
    voltage: Number,
    timestamp: Date
});

MeterHistorySchema.index({ timestamp: 1 });

module.exports = mongoose.model("meter_history", MeterHistorySchema);
