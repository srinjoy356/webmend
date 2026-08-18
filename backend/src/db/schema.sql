-- schema.sql

CREATE TABLE IF NOT EXISTS collectors (
    id VARCHAR(255) PRIMARY KEY,
    target_url TEXT NOT NULL,
    expected_schema JSONB NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS runs (
    id VARCHAR(255) PRIMARY KEY,
    collector_id VARCHAR(255) REFERENCES collectors(id),
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS rows (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(255) REFERENCES runs(id),
    collector_id VARCHAR(255) REFERENCES collectors(id),
    data JSONB NOT NULL,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    collector_id VARCHAR(255) REFERENCES collectors(id),
    event_type VARCHAR(50) NOT NULL, -- 'run', 'break', 'heal'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
