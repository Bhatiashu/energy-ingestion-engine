const { ingestTelemetry } = require("./ingestion.service");
const logger = require("../utils/logger");

exports.ingest = async (req, res) => {
    try {
        const result = await ingestTelemetry(req.body);

        return res.status(200).json({
            message: result.message,
            type: result.type
        });
    } catch (err) {
        logger.error(`Ingestion failed: ${err.message}`);

        return res.status(err.statusCode || 500).json({
            error: err.message
        });
    }
};


