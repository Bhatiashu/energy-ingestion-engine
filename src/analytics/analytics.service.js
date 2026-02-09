const VehicleHistory = require("../models/vehicle.history.model");
const MeterHistory = require("../models/meter.history.model");
const logger = require("../utils/logger");

exports.getPerformance = async (vehicleId) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    logger.info(`Running analytics aggregation for vehicleId: ${vehicleId} , ${since}`);

    const vehicleAgg = await VehicleHistory.aggregate([
        {
            $match: {
                vehicleId,
                timestamp: { $gte: since }
            }
        },
        {
            $group: {
                _id: null,
                totalDc: { $sum: "$kwhDeliveredDc" },
                avgTemp: { $avg: "$batteryTemp" }
            }
        }
    ]);

    const meterAgg = await MeterHistory.aggregate([
        {
            $match: {
                timestamp: { $gte: since }
            }
        },
        {
            $group: {
                _id: null,
                totalAc: { $sum: "$kwhConsumedAc" }
            }
        }
    ]);

    const totalDc = vehicleAgg.length ? vehicleAgg[0].totalDc : 0;
    const avgTemp = vehicleAgg.length ? vehicleAgg[0].avgTemp : 0;
    const totalAc = meterAgg.length ? meterAgg[0].totalAc : 0;

    if (totalAc === 0) {
        logger.warn(`No AC energy data found for vehicleId: ${vehicleId}`);
    }

    return {
        totalEnergyAc: totalAc,
        totalEnergyDc: totalDc,
        efficiency: totalAc ? totalDc / totalAc : 0,
        avgBatteryTemp: avgTemp
    };
};

