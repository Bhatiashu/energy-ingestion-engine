const { getPerformance } = require("./analytics.service");
const logger = require("../utils/logger");

exports.performance = async (req, res) => {
    try {
        const { vehicleId } = req.body;

        if (!vehicleId) {
            return res.status(400).json({
                error: "vehicleId is required"
            });
        }

        logger.info(`Analytics request received for vehicleId: ${vehicleId}`);

        const data = await getPerformance(vehicleId);

        return res.status(200).json(data);
    } catch (err) {
        logger.error(`Analytics failed for vehicleId: ${err.message}`);
        return res.status(500).json({
            error: err.message
        });
    }
};

