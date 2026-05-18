-- Extend DSEP analytics event partitions through 2028.
-- Keep at least 12 months of future partitions available before production deploys.

CREATE TABLE IF NOT EXISTS platform_experience_events_2027_q2
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2027-04-01') TO ('2027-07-01');

CREATE TABLE IF NOT EXISTS platform_experience_events_2027_q3
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2027-07-01') TO ('2027-10-01');

CREATE TABLE IF NOT EXISTS platform_experience_events_2027_q4
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2027-10-01') TO ('2028-01-01');

CREATE TABLE IF NOT EXISTS platform_experience_events_2028_q1
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2028-01-01') TO ('2028-04-01');

CREATE TABLE IF NOT EXISTS platform_experience_events_2028_q2
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2028-04-01') TO ('2028-07-01');

CREATE TABLE IF NOT EXISTS platform_experience_events_2028_q3
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2028-07-01') TO ('2028-10-01');

CREATE TABLE IF NOT EXISTS platform_experience_events_2028_q4
    PARTITION OF platform_experience_events
    FOR VALUES FROM ('2028-10-01') TO ('2029-01-01');
