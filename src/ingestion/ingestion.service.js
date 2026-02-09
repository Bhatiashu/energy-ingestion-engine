const VehicleLive = require("../models/vehicle.live.model");
const VehicleHistory = require("../models/vehicle.history.model");
const MeterLive = require("../models/meter.live.model");
const MeterHistory = require("../models/meter.history.model");
const logger = require("../utils/logger");


exports.ingestTelemetry = async (payload) => {
    if (!payload || Object.keys(payload).length === 0) {
        const err = new Error("Payload is empty");
        err.statusCode = 400;
        throw err;
    }

    const timestamp = payload.timestamp
        ? new Date(payload.timestamp)
        : new Date();

    // VEHICLE STREAM
    if (payload.vehicleId) {
        if (
            payload.kwhDeliveredDc === undefined ||
            payload.soc === undefined
        ) {
            const err = new Error(
                "Invalid vehicle payload"
            );
            err.statusCode = 400;
            throw err;
        }

        logger.info(`Vehicle telemetry received for vehicleId: ${payload.vehicleId}, timestamp: ${timestamp}`);

        await VehicleHistory.create({ ...payload, timestamp });

        await VehicleLive.updateOne(
            { vehicleId: payload.vehicleId },
            {
                $set: {
                    soc: payload.soc,
                    batteryTemp: payload.batteryTemp,
                    lastKwhDeliveredDc: payload.kwhDeliveredDc,
                    updatedAt: timestamp
                }
            },
            { upsert: true }
        );

        return {
            type: "VEHICLE",
            message: "Vehicle telemetry ingested successfully"
        };
    }

    // METER STREAM
    if (payload.meterId) {
        if (payload.kwhConsumedAc === undefined) {
            const err = new Error(
                "Invalid meter payload"
            );
            err.statusCode = 400;
            throw err;
        }

        logger.info(`Meter telemetry received for meterId: ${payload.meterId}, timestamp: ${timestamp}`);

        await MeterHistory.create({ ...payload, timestamp });

        await MeterLive.updateOne(
            { meterId: payload.meterId },
            {
                $set: {
                    voltage: payload.voltage,
                    lastKwhConsumedAc: payload.kwhConsumedAc,
                    updatedAt: timestamp
                }
            },
            { upsert: true }
        );

        return {
            type: "METER",
            message: "Meter telemetry ingested successfully"
        };
    }

    // UNKNOWN PAYLOAD
    const err = new Error("Unknown telemetry type");
    err.statusCode = 400;
    throw err;
};