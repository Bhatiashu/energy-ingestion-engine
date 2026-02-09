const express = require("express");
const router = express.Router();

const ingestion = require("./ingestion/ingestion.controller");
const analytics = require("./analytics/analytics.controller");

router.post("/v1/ingest", ingestion.ingest);
router.get("/v1/analytics/performance/:vehicleId", analytics.performance);

module.exports = router;
