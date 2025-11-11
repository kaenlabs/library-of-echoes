-- ================================================
-- LIBRARY OF ECHOES - DATABASE SCHEMA
-- ================================================
-- Version: 1.0
-- Purpose: Mystical anonymous message platform
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: epochs (Çağlar)
-- ================================================
-- Stores information about each epoch/age
-- An epoch is a complete cycle that ends with a Babel Moment

CREATE TABLE IF NOT EXISTS epochs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,                          -- e.g., "Age 1", "Age 2"
    is_active BOOLEAN DEFAULT true,              -- Only one epoch can be active at a time
    created_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP,
    stats JSONB                                  -- Stores final statistics when epoch closes
);

-- Index for faster active epoch lookup
CREATE INDEX idx_epochs_active ON epochs(is_active) WHERE is_active = true;

-- Ensure only one active epoch at a time (using unique partial index)
CREATE UNIQUE INDEX unique_active_epoch ON epochs(is_active) WHERE is_active = true;

-- ================================================
-- TABLE: layers (Katmanlar)
-- ================================================
-- Defines the layer structure for each epoch
-- Each layer has a message range and visual theme

CREATE TABLE IF NOT EXISTS layers (
    id SERIAL PRIMARY KEY,
    epoch_id INTEGER NOT NULL REFERENCES epochs(id) ON DELETE CASCADE,
    layer_index INTEGER NOT NULL,                -- 1-9 (I-IX)
    min_messages INTEGER NOT NULL,               -- Minimum total messages for this layer
    max_messages INTEGER NOT NULL,               -- Maximum total messages for this layer
    theme_name TEXT,                             -- e.g., "Void", "Whisper", "Glitch"
    css_class TEXT,                              -- CSS class name for styling
    
    -- Constraints
    CONSTRAINT unique_layer_per_epoch UNIQUE(epoch_id, layer_index),
    CONSTRAINT valid_layer_range CHECK (min_messages < max_messages),
    CONSTRAINT valid_layer_index CHECK (layer_index BETWEEN 1 AND 9)
);

-- Index for layer lookups
CREATE INDEX idx_layers_epoch ON layers(epoch_id);

-- ================================================
-- TABLE: rooms (Odalar)
-- ================================================
-- Rooms distribute messages within each layer
-- Messages are assigned to rooms using modulo operation

CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    epoch_id INTEGER NOT NULL REFERENCES epochs(id) ON DELETE CASCADE,
    layer_index INTEGER NOT NULL,
    room_index INTEGER NOT NULL,                 -- Room number within the layer
    message_count INTEGER DEFAULT 0,             -- Cached count for performance
    
    -- Constraints
    CONSTRAINT unique_room_per_layer UNIQUE(epoch_id, layer_index, room_index),
    CONSTRAINT valid_room_index CHECK (room_index >= 0)
);

-- Index for room lookups
CREATE INDEX idx_rooms_epoch_layer ON rooms(epoch_id, layer_index);

-- ================================================
-- TABLE: messages (Mesajlar)
-- ================================================
-- Stores all user messages
-- Messages are completely anonymous

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    epoch_id INTEGER NOT NULL REFERENCES epochs(id) ON DELETE CASCADE,
    layer_index INTEGER NOT NULL,
    room_index INTEGER NOT NULL,
    
    -- Message content
    text TEXT NOT NULL,                          -- Original message (max 1 line)
    normalized_text TEXT NOT NULL,               -- Normalized for duplicate detection
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT message_not_empty CHECK (LENGTH(TRIM(text)) > 0),
    CONSTRAINT message_single_line CHECK (text NOT LIKE '%\n%')
);

-- Indexes for performance
CREATE INDEX idx_messages_epoch ON messages(epoch_id);
CREATE INDEX idx_messages_layer ON messages(epoch_id, layer_index);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_normalized ON messages(normalized_text);

-- ================================================
-- FUNCTION: Get current active epoch
-- ================================================

CREATE OR REPLACE FUNCTION get_active_epoch()
RETURNS TABLE (
    epoch_id INTEGER,
    epoch_name TEXT,
    total_messages BIGINT,
    current_layer INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        COUNT(m.id) as total_messages,
        COALESCE(
            (SELECT layer_index 
             FROM layers l 
             WHERE l.epoch_id = e.id 
             AND COUNT(m.id) BETWEEN l.min_messages AND l.max_messages
             LIMIT 1
            ), 1
        ) as current_layer
    FROM epochs e
    LEFT JOIN messages m ON m.epoch_id = e.id
    WHERE e.is_active = true
    GROUP BY e.id, e.name;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- FUNCTION: Get duplicate count for a message
-- ================================================

CREATE OR REPLACE FUNCTION get_exact_count(
    p_epoch_id INTEGER,
    p_normalized_text TEXT
)
RETURNS INTEGER AS $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO duplicate_count
    FROM messages
    WHERE epoch_id = p_epoch_id
    AND normalized_text = p_normalized_text;
    
    RETURN duplicate_count;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- INITIAL DATA: Create first epoch
-- ================================================

INSERT INTO epochs (name, is_active)
VALUES ('Age 1', true)
ON CONFLICT DO NOTHING;

-- ================================================
-- INITIAL DATA: Create layer definitions for first epoch
-- ================================================

INSERT INTO layers (epoch_id, layer_index, min_messages, max_messages, theme_name, css_class)
SELECT 
    1 as epoch_id,
    layer_index,
    min_messages,
    max_messages,
    theme_name,
    css_class
FROM (VALUES
    (1, 0, 100, 'Void', 'layer-1'),
    (2, 100, 500, 'Whisper', 'layer-2'),
    (3, 500, 1000, 'Glitch', 'layer-3'),
    (4, 1000, 2000, 'Wave', 'layer-4'),
    (5, 2000, 4000, 'Neon', 'layer-5'),
    (6, 4000, 8000, 'Ambient', 'layer-6'),
    (7, 8000, 50000, 'Chaos', 'layer-7'),
    (8, 50000, 100000, 'Burst', 'layer-8'),
    (9, 100000, 999999999, 'Babel', 'layer-9')
) AS layer_data(layer_index, min_messages, max_messages, theme_name, css_class)
ON CONFLICT DO NOTHING;

-- ================================================
-- INITIAL DATA: Create rooms for layer 1
-- ================================================

INSERT INTO rooms (epoch_id, layer_index, room_index)
SELECT 1, 1, generate_series(0, 9)
ON CONFLICT DO NOTHING;

-- ================================================
-- END OF SCHEMA
-- ================================================
