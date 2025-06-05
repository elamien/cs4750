-- This File is for only core intialization and no select like commands

-- COMPLETED DB STUCT BASED ON

/*
Only Anon ROLE (not signed in) can:
-- ONLY Browse/filter bands/events by genre/slot
Only All users ROLE (except anon) can:
-- Edit account info (everything from sql table)
-- Browse/filter bands/events by genre/slot
-- Save bands/events in favorites
-- Create events, request bands to play
-- Accept any pending fill in requests
Only Band leader ROLE can:
-- Create/Delete 1 band or Transfer lead
-- View and Accept/deny event requests
-- View and Accept/deny band member requests
-- Create fill-in requests (leader only)
-- Ability to remove existing members
Only Band member ROLE can:
-- Leave band
-- View band approved event(s) and select (available vs not)
Only General ROLE can:
-- Create 1 band OR Request to join 1 band
Only WXTJ Exec ROLE can:
-- Manage all/any users (delete/change role)
-- Manage all/any bands/events (all already possible actions, all CRUD operations, etc)
-- Create 1 band OR Request to join 1 band
*/

-- Music Band Database Schema
-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS band_leader;
DROP TABLE IF EXISTS wxtj_exec;
DROP TABLE IF EXISTS general_user;
DROP TABLE IF EXISTS band_member;
DROP TABLE IF EXISTS fill_in_request;
DROP TABLE IF EXISTS event_request;
DROP TABLE IF EXISTS membership_request;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS band;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS reference_instruments;

-- Create user table
CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    bio TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    genre ENUM('Classic rock', 'Country', 'Pop', 'R n B', 'Metal', 'Classical', 'Folk', 'Hip hop', 'Electronic', 'Jazz', 'Indie', 'Alternative'),
    instrument VARCHAR(100),
    password VARCHAR(255) NOT NULL DEFAULT 'test123'
);

-- Create reference_instruments table for common instruments
CREATE TABLE reference_instruments (
    instrument_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    value VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(100) UNIQUE NOT NULL
);

-- Create user_roles junction table
CREATE TABLE user_roles (
    user_role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    UNIQUE(role_id, user_id)
);

-- Create band table
CREATE TABLE band (
    band_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    genre ENUM('Classic rock', 'Country', 'Pop', 'R n B', 'Metal', 'Classical', 'Folk', 'Hip hop', 'Electronic', 'Jazz', 'Indie', 'Alternative'),
    total_events_played INT DEFAULT 0,
    events_played_ytd INT DEFAULT 0,
    description TEXT
);

-- Create event table
CREATE TABLE event (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    datetime DATETIME NOT NULL,
    location VARCHAR(255),
    genre ENUM('Classic rock', 'Country', 'Pop', 'R n B', 'Metal', 'Classical', 'Folk', 'Hip hop', 'Electronic', 'Jazz', 'Indie', 'Alternative'),
    status ENUM('open', 'filled', 'expired') DEFAULT 'open',
    description TEXT,
    slot_one VARCHAR(100),
    slot_two VARCHAR(100),
    slot_three VARCHAR(100),
    slot_four VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Create event_request table
CREATE TABLE event_request (
    event_request_id INT PRIMARY KEY AUTO_INCREMENT,
    band_id INT NOT NULL,
    event_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- NEW: Track who responded to the request (band leader who approved/denied)
    responded_by_user_id INT,
    time_responded TIMESTAMP NULL,
    message TEXT,
    FOREIGN KEY (band_id) REFERENCES band(band_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
    -- NEW: Band leaders can accept/deny event requests
    FOREIGN KEY (responded_by_user_id) REFERENCES user(user_id) ON DELETE SET NULL
);

-- Create membership_request table
CREATE TABLE membership_request (
    membership_request_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    band_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- NEW: Track who responded to the membership request (band leader who approved/denied)
    responded_by_user_id INT,
    time_responded TIMESTAMP NULL,
    message TEXT,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (band_id) REFERENCES band(band_id) ON DELETE CASCADE,
    -- NEW: Band leaders can accept/deny band member requests
    FOREIGN KEY (responded_by_user_id) REFERENCES user(user_id) ON DELETE SET NULL
);

-- Create fill_in_request table
CREATE TABLE fill_in_request (
    fill_in_request_id INT PRIMARY KEY AUTO_INCREMENT,
    band_id INT NOT NULL,
    event_id INT NOT NULL,
    -- NEW: Track which specific time slot needs coverage (1=8-9am, 2=9-10am, 3=10-11am, 4=11am-12pm)
    slot_number INT NOT NULL CHECK (slot_number IN (1, 2, 3, 4)),
    fill_in_description TEXT,
    fill_in_member_id INT,
    -- NEW: Track status and who accepted the fill-in request
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    accepted_by_user_id INT,
    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_responded TIMESTAMP NULL,
    FOREIGN KEY (band_id) REFERENCES band(band_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
    FOREIGN KEY (fill_in_member_id) REFERENCES user(user_id) ON DELETE SET NULL,
    -- NEW: Any logged-in user can accept fill-in requests per requirements
    FOREIGN KEY (accepted_by_user_id) REFERENCES user(user_id) ON DELETE SET NULL
);

-- Create band_leader table
CREATE TABLE band_leader (
    user_role_id INT PRIMARY KEY,
    band_id INT NOT NULL,
    FOREIGN KEY (user_role_id) REFERENCES user_roles(user_role_id) ON DELETE CASCADE,
    FOREIGN KEY (band_id) REFERENCES band(band_id) ON DELETE CASCADE
);

-- Create band_member table
CREATE TABLE band_member (
    user_role_id INT PRIMARY KEY,
    band_id INT NOT NULL,
    FOREIGN KEY (user_role_id) REFERENCES user_roles(user_role_id) ON DELETE CASCADE,
    FOREIGN KEY (band_id) REFERENCES band(band_id) ON DELETE CASCADE
);

-- Create general_user table
CREATE TABLE general_user (
    user_role_id INT PRIMARY KEY,
    looking_for_a_band BOOLEAN DEFAULT FALSE,
    -- NEW: Track if general user has created/joined a band (they can only do ONE of: create 1 band OR request to join 1 band)
    has_created_band BOOLEAN DEFAULT FALSE,
    has_pending_band_request BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_role_id) REFERENCES user_roles(user_role_id) ON DELETE CASCADE
);

-- Create wxtj_exec table
CREATE TABLE wxtj_exec (
    user_role_id INT PRIMARY KEY,
    exec_title VARCHAR(100),
    FOREIGN KEY (user_role_id) REFERENCES user_roles(user_role_id) ON DELETE CASCADE
);

-- NEW: Create user_favorites_bands table (All users except anon can save bands as favorites)
CREATE TABLE user_favorites_bands (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    band_id INT NOT NULL,
    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (band_id) REFERENCES band(band_id) ON DELETE CASCADE,
    UNIQUE(user_id, band_id)
);

-- NEW: Create user_favorites_events table (All users except anon can save events as favorites)
CREATE TABLE user_favorites_events (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
    UNIQUE(user_id, event_id)
);

-- NEW: Create band_member_event_availability table (Band members can mark availability for approved events)
CREATE TABLE band_member_event_availability (
    availability_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    band_id INT NOT NULL,
    event_id INT NOT NULL,
    is_available BOOLEAN NOT NULL,
    time_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (band_id) REFERENCES band(band_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
    UNIQUE(user_id, band_id, event_id)
);

-- NEW: Create band_membership_history table (Track when members leave/are removed - useful for band leaders removing members)
CREATE TABLE band_membership_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    band_id INT NOT NULL,
    action ENUM('joined', 'left', 'removed', 'promoted_to_leader', 'demoted_from_leader') NOT NULL,
    performed_by_user_id INT, -- Who performed the action (for removals/promotions)
    time_occurred TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (band_id) REFERENCES band(band_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by_user_id) REFERENCES user(user_id) ON DELETE SET NULL
);

-- Insert default roles
INSERT INTO roles (role_name) VALUES
    ('Band Leader'),
    ('Band Member'),
    ('General User'),
    ('WXTJ Executive');

-- Insert common instruments for reference data
INSERT INTO reference_instruments (name, value) VALUES
    ('Guitar', 'Guitar'),
    ('Bass', 'Bass'),
    ('Drums', 'Drums'),
    ('Piano', 'Piano'),
    ('Vocals', 'Vocals'),
    ('Saxophone', 'Saxophone'),
    ('Trumpet', 'Trumpet'),
    ('Violin', 'Violin'),
    ('Keyboard', 'Keyboard'),
    ('Flute', 'Flute'),
    ('Clarinet', 'Clarinet'),
    ('Other', 'Other');

-- Create indexes for better performance
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_event_datetime ON event(datetime);
CREATE INDEX idx_event_status ON event(status);
CREATE INDEX idx_event_user ON event(user_id);
CREATE INDEX idx_membership_request_status ON membership_request(status);
CREATE INDEX idx_event_request_status ON event_request(status);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
-- NEW: Indexes for new tables
CREATE INDEX idx_fill_in_request_status ON fill_in_request(status);
CREATE INDEX idx_fill_in_request_slot ON fill_in_request(slot_number);
CREATE INDEX idx_user_favorites_bands_user ON user_favorites_bands(user_id);
CREATE INDEX idx_user_favorites_events_user ON user_favorites_events(user_id);
CREATE INDEX idx_band_member_availability ON band_member_event_availability(user_id, band_id, event_id);
CREATE INDEX idx_band_membership_history_user ON band_membership_history(user_id);
CREATE INDEX idx_band_membership_history_band ON band_membership_history(band_id);
