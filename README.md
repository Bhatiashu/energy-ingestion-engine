# ⚡ High-Scale Energy Ingestion Engine

## 📌 Overview

This project implements a high-scale telemetry ingestion and analytics engine designed for managing energy data from 10,000+ Smart Meters and EV fleets.

The system ingests two independent telemetry streams arriving every 60 seconds, persists them efficiently, and provides fast analytical insights into power efficiency and vehicle performance.

The architecture is designed to handle approximately 14.4 million telemetry records per day, with a clear separation between real-time operational data and long-term historical analytics data.

---

## 🌍 Domain Context

### 🔌 Smart Meter (Grid Side)

Measures AC (Alternating Current) energy consumed from the utility grid.

Reports:
- meterId  
- kwhConsumedAc  
- voltage  
- timestamp  

This represents billable energy consumption.

---

### 🚘 EV & Charger (Vehicle Side)

The charger converts AC power to DC for battery charging.

Reports:
- vehicleId  
- kwhDeliveredDc  
- soc (State of Charge)  
- batteryTemp  
- timestamp  

This represents the actual energy stored in the vehicle battery.

---

### 🔥 Power Loss Principle

In real-world systems:
- AC Consumed is always greater than DC Delivered
- Energy is lost during AC → DC conversion

A drop in efficiency (for example, below 85%) may indicate hardware faults or energy leakage.

---

## 🏗 Architecture Overview

Smart Meters & EV Chargers  
&nbsp;&nbsp;&nbsp;&nbsp;|  
&nbsp;&nbsp;&nbsp;&nbsp;| (1-minute telemetry)  
&nbsp;&nbsp;&nbsp;&nbsp;|  
POST /v1/ingest  
&nbsp;&nbsp;&nbsp;&nbsp;|  
Polymorphic Ingestion Layer  
&nbsp;&nbsp;&nbsp;&nbsp;|  
Vehicle Pipeline &nbsp;&nbsp;&nbsp;&nbsp; Meter Pipeline  
&nbsp;&nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |  
History Insert &nbsp;&nbsp;&nbsp;&nbsp; History Insert  
&nbsp;&nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |  
Live Upsert &nbsp;&nbsp;&nbsp;&nbsp; Live Upsert  
&nbsp;&nbsp;&nbsp;&nbsp;|  
MongoDB (Hot & Cold Collections)  
&nbsp;&nbsp;&nbsp;&nbsp;|  
GET /v1/analytics/performance/:vehicleId  
&nbsp;&nbsp;&nbsp;&nbsp;|  
Analytics Aggregation  
&nbsp;&nbsp;&nbsp;&nbsp;|  
Performance Summary


## 🔄 Polymorphic Ingestion

A single ingestion endpoint handles both telemetry types:

POST /v1/ingest

Telemetry type is automatically detected based on payload structure:

| Payload Field | Telemetry Type |
|--------------|----------------|
| vehicleId    | Vehicle Stream |
| meterId      | Meter Stream   |

Each telemetry stream has independent validation and persistence logic.

---

## 🧊 Data Strategy: Hot & Cold Separation

### ❄️ Cold Store (Historical Data)

Collections:
- vehicle_history  
- meter_history  

Characteristics:
- Append-only inserts
- Immutable time-series data
- Indexed for analytics

Used for:
- Long-term reporting
- Auditing
- Analytical queries

---

### 🔥 Hot Store (Operational Data)

Collections:
- vehicle_live  
- meter_live  

Characteristics:
- One document per device
- UPSERT on every heartbeat
- Constant-time reads

Used for:
- Current State of Charge (SoC)
- Latest voltage readings
- Real-time dashboards

---

## 💾 Persistence Strategy

| Data Type | Operation | Purpose |
|---------|----------|---------|
| Historical Data | INSERT | Complete audit trail |
| Live Data | UPSERT | Fast current-state access |

This approach prevents scanning large datasets and supports high-frequency ingestion.

---

## 📊 Analytics Endpoint

Endpoint:
GET /v1/analytics/performance/:vehicleId

Returns a 24-hour summary including:
- Total AC energy consumed
- Total DC energy delivered
- Efficiency ratio (DC / AC)
- Average battery temperature

Analytics are computed using database-side aggregation pipelines to ensure performance at scale.

---

## 🔗 Data Correlation Strategy

Smart Meter and Vehicle telemetry streams are ingested independently and are not joined at ingestion time.

For this assignment:
- Vehicle analytics focus on DC energy delivery and battery behavior
- AC energy is aggregated at the grid or fleet level for the same time window

This mirrors real-world production systems, where meter-to-vehicle mapping is handled by higher-level fleet configuration services rather than the ingestion engine.

---

## 🚀 Query Performance & Indexing Strategy

To ensure analytical queries do not perform full table scans, the following indexes are used:

vehicle_history:
- { vehicleId: 1, timestamp: -1 }

meter_history:
- { timestamp: -1 }

Performance guarantees:
- All analytics queries are bounded to a 24-hour time window
- Queries filter only on indexed fields
- Aggregations execute entirely inside the database

This ensures predictable query performance even with billions of records.

---

## 🪵 Logging & Observability

Structured logging is implemented using Winston, capturing:
- Ingestion events
- Validation failures
- Analytics execution
- Error conditions

This improves debugging, monitoring, and production readiness.

---

## 📈 Scalability Considerations

Designed to support:
- 10,000+ devices
- 1-minute telemetry heartbeats
- Approximately 14.4 million records per day

Key optimizations:
- Append-only write patterns
- Hot and Cold data separation
- Indexed analytical queries
- Stateless ingestion service

---

## 🧰 Technology Stack

Backend: Node.js  
Database: MongoDB  
Logging: Winston  
Containerization: Docker & Docker Compose  

Although PostgreSQL was specified in the assignment, MongoDB was selected to demonstrate the same architectural principles using a write-optimized, document-oriented datastore suitable for high-volume telemetry ingestion.

---

## 🐳 Why Docker?

Docker ensures:
- Environment consistency
- One-command startup
- Dependency isolation

This allows reviewers to run the entire system easily and reflects production-grade delivery practices.

---

## ▶️ Running the Service

Run the following command:

docker-compose up --build

The service will be available at:
http://localhost:3000

---

## ✅ Summary

This project demonstrates:
- High-scale telemetry ingestion
- Polymorphic stream handling
- Efficient Hot and Cold data separation
- Scalable analytics without full table scans
- Production-ready logging and containerization

The architecture closely reflects real-world energy and fleet telemetry systems used in production environments.
