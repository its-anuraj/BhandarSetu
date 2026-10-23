-- ==============================================================================
-- BhandarSetu (भंडारसेतु) — PostgreSQL Schema & Hardened Row Level Security (RLS)
-- Public Distribution System (PDS) Commodity Warehousing & Deterministic FIFO
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
CREATE TYPE departmental_role AS ENUM (
    'PLATFORM_SUPER_ADMIN',
    'STATE_ADMIN',
    'DISTRICT_SUPPLY_OFFICER',
    'GODOWN_MANAGER',
    'STOCK_INWARD_OPERATOR',
    'QUALITY_INSPECTOR',
    'DISPATCH_OPERATOR',
    'AUTHORIZED_APPROVER',
    'AUDITOR',
    'FPS_RECIPIENT'
);

CREATE TYPE quality_status_enum AS ENUM (
    'ELIGIBLE',
    'AWAITING_INSPECTION',
    'QUALITY_HOLD',
    'REJECTED',
    'DEPLETED'
);

CREATE TYPE inward_status_enum AS ENUM (
    'DRAFT',
    'DRAFT_AT_GATE',
    'AWAITING_QC',
    'INSPECTION_PENDING',
    'POSTED_TO_LEDGER',
    'REJECTED'
);

CREATE TYPE dispatch_status_enum AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'CHALLAN_GENERATED',
    'DISPATCHED',
    'CANCELLED',
    'REJECTED',
    'REVERSED'
);

-- ==============================================================================
-- 3. JURISDICTION & TENANCY MASTER TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state_code VARCHAR(8) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS godowns (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    district_id VARCHAR(32) NOT NULL,
    district_name VARCHAR(128) NOT NULL,
    state_code VARCHAR(8) NOT NULL,
    total_capacity_mt NUMERIC(12, 2) NOT NULL DEFAULT 5000.0,
    shed_count INT NOT NULL DEFAULT 4,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. USER PROFILES & SCOPE ASSIGNMENTS (RBAC)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    badge_no VARCHAR(64) NOT NULL UNIQUE,
    phone VARCHAR(32),
    role departmental_role NOT NULL DEFAULT 'GODOWN_MANAGER',
    organization_id VARCHAR(64) REFERENCES organizations(id),
    godown_id VARCHAR(64) REFERENCES godowns(id),
    godown_name VARCHAR(255),
    district_id VARCHAR(32),
    district_name VARCHAR(128),
    state_code VARCHAR(8) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_scope_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    godown_id VARCHAR(64) NOT NULL REFERENCES godowns(id),
    district_id VARCHAR(32) NOT NULL,
    state_code VARCHAR(8) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES user_profiles(id),
    UNIQUE(user_id, godown_id)
);

-- ==============================================================================
-- 5. OPERATIONAL INVENTORY & COMMODITY TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS stock_batches (
    id VARCHAR(64) PRIMARY KEY,
    batch_number VARCHAR(128) NOT NULL UNIQUE,
    commodity_id VARCHAR(32) NOT NULL,
    commodity_name VARCHAR(128) NOT NULL,
    crop_season VARCHAR(64) NOT NULL,
    godown_id VARCHAR(64) NOT NULL REFERENCES godowns(id),
    godown_name VARCHAR(255) NOT NULL,
    shed VARCHAR(64) NOT NULL,
    bay VARCHAR(64) NOT NULL,
    stack_id VARCHAR(64) NOT NULL,
    source_agency VARCHAR(128) NOT NULL,
    intake_challan VARCHAR(128) NOT NULL,
    intake_date DATE NOT NULL,
    intake_timestamp TIMESTAMPTZ NOT NULL,
    initial_quantity_qtl NUMERIC(12, 2) NOT NULL,
    on_hand_qtl NUMERIC(12, 2) NOT NULL,
    reserved_qtl NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    quality_status quality_status_enum NOT NULL DEFAULT 'ELIGIBLE',
    quality_hold_reason TEXT,
    moisture_pct NUMERIC(5, 2) NOT NULL,
    permissible_max_moisture NUMERIC(5, 2) NOT NULL DEFAULT 12.0,
    grain_density_kghl NUMERIC(6, 2) NOT NULL DEFAULT 78.0,
    foreign_matter_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.40,
    weevilled_grain_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    lab_slip_no VARCHAR(64),
    checksum VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_on_hand_non_negative CHECK (on_hand_qtl >= 0),
    CONSTRAINT chk_reserved_non_negative CHECK (reserved_qtl >= 0)
);

CREATE TABLE IF NOT EXISTS stock_inwards (
    id VARCHAR(64) PRIMARY KEY,
    gate_entry_no VARCHAR(64) NOT NULL UNIQUE,
    vehicle_truck_no VARCHAR(32) NOT NULL,
    transporter_name VARCHAR(128) NOT NULL,
    driver_name VARCHAR(128) NOT NULL,
    driver_mobile VARCHAR(32) NOT NULL,
    weighbridge_slip_ref VARCHAR(64) NOT NULL,
    weighbridge_gross_kg NUMERIC(10, 2) NOT NULL,
    weighbridge_tare_kg NUMERIC(10, 2) NOT NULL,
    net_received_kg NUMERIC(10, 2) NOT NULL,
    net_received_qtl NUMERIC(10, 2) NOT NULL,
    supplier_name VARCHAR(128) NOT NULL,
    supplier_code VARCHAR(32) NOT NULL,
    commodity_id VARCHAR(32) NOT NULL,
    commodity_name VARCHAR(128) NOT NULL,
    crop_year VARCHAR(64) NOT NULL,
    bag_count INT NOT NULL,
    godown_id VARCHAR(64) NOT NULL REFERENCES godowns(id),
    target_shed VARCHAR(64) NOT NULL,
    stack_allotment_id VARCHAR(64) NOT NULL,
    initial_moisture_pct NUMERIC(5, 2) NOT NULL,
    status inward_status_enum NOT NULL DEFAULT 'DRAFT_AT_GATE',
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fps_dispatches (
    id VARCHAR(64) PRIMARY KEY,
    fifo_run_id VARCHAR(64) NOT NULL,
    fps_id VARCHAR(64) NOT NULL,
    fps_name VARCHAR(128) NOT NULL,
    fps_code VARCHAR(32) NOT NULL,
    godown_id VARCHAR(64) NOT NULL REFERENCES godowns(id),
    commodity_id VARCHAR(32) NOT NULL,
    commodity_name VARCHAR(128) NOT NULL,
    required_quantity_qtl NUMERIC(10, 2) NOT NULL,
    allocated_quantity_qtl NUMERIC(10, 2) NOT NULL,
    allocated_carrier VARCHAR(32) NOT NULL,
    allocations_json JSONB NOT NULL,
    is_exception BOOLEAN NOT NULL DEFAULT false,
    exception_reason TEXT,
    exception_operator VARCHAR(128),
    status dispatch_status_enum NOT NULL DEFAULT 'DRAFT',
    created_by UUID REFERENCES user_profiles(id),
    approved_by VARCHAR(128),
    approved_at TIMESTAMPTZ,
    challan_no VARCHAR(64),
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_challans (
    challan_no VARCHAR(64) PRIMARY KEY,
    dispatch_id VARCHAR(64) NOT NULL REFERENCES fps_dispatches(id),
    godown_id VARCHAR(64) NOT NULL REFERENCES godowns(id),
    godown_name VARCHAR(255) NOT NULL,
    fps_name VARCHAR(128) NOT NULL,
    fps_code VARCHAR(32) NOT NULL,
    carrier_vehicle_no VARCHAR(32) NOT NULL,
    driver_name VARCHAR(128) NOT NULL,
    commodity_name VARCHAR(128) NOT NULL,
    total_quantity_qtl NUMERIC(10, 2) NOT NULL,
    total_bags INT NOT NULL,
    batches_breakdown JSONB NOT NULL,
    sha256_hash VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'APPROVED',
    issued_by VARCHAR(128) NOT NULL,
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fifo_exceptions (
    id VARCHAR(64) PRIMARY KEY,
    requisition_id VARCHAR(64) NOT NULL REFERENCES fps_dispatches(id),
    godown_id VARCHAR(64) NOT NULL REFERENCES godowns(id),
    requested_by VARCHAR(128) NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    commodity VARCHAR(128) NOT NULL,
    quantity_qtl NUMERIC(10, 2) NOT NULL,
    bypassed_batch_id VARCHAR(64) NOT NULL,
    selected_batch_id VARCHAR(64) NOT NULL,
    reason_code VARCHAR(64) NOT NULL,
    justification_text TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_SIGN_OFF',
    reviewed_by VARCHAR(128),
    reviewed_at TIMESTAMPTZ,
    audit_note TEXT
);

-- ==============================================================================
-- 6. IMMUTABLE FINANCIAL & INVENTORY MOVEMENTS LEDGER
-- ==============================================================================

CREATE TABLE IF NOT EXISTS stock_movements (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    time_label VARCHAR(32) NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    commodity_name VARCHAR(128) NOT NULL,
    batch_id VARCHAR(64) NOT NULL,
    godown_id VARCHAR(64) NOT NULL REFERENCES godowns(id),
    godown VARCHAR(255) NOT NULL,
    debit_qtl NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    credit_qtl NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    resulting_balance_qtl NUMERIC(12, 2) NOT NULL,
    reference_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(128) NOT NULL,
    notes TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor VARCHAR(128) NOT NULL,
    user_id UUID,
    role VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. SECURITY TRIGGERS: PREVENT SELF-ROLE ELEVATION & PRESERVE IMMUTABILITY
-- ==============================================================================

CREATE OR REPLACE FUNCTION prevent_user_role_escalation()
RETURNS TRIGGER AS $$
DECLARE
    caller_role departmental_role;
BEGIN
    -- Check caller's role in user_profiles
    SELECT role INTO caller_role FROM user_profiles WHERE id = auth.uid();

    -- If a user is updating their own record and attempting to alter role or scope
    IF auth.uid() = OLD.id THEN
        IF NEW.role <> OLD.role THEN
            RAISE EXCEPTION 'Access Denied: Users are strictly forbidden from modifying their own assigned role.';
        END IF;
        IF NEW.organization_id <> OLD.organization_id OR NEW.godown_id <> OLD.godown_id OR NEW.state_code <> OLD.state_code THEN
            RAISE EXCEPTION 'Access Denied: Users cannot alter their own jurisdiction or depot scoping.';
        END IF;
        IF NEW.is_active <> OLD.is_active THEN
            RAISE EXCEPTION 'Access Denied: Users cannot alter their own account activation status.';
        END IF;
    END IF;

    -- Only PLATFORM_SUPER_ADMIN or STATE_ADMIN can modify other accounts
    IF auth.uid() <> OLD.id THEN
        IF caller_role NOT IN ('PLATFORM_SUPER_ADMIN', 'STATE_ADMIN') THEN
            RAISE EXCEPTION 'Access Denied: Administrative authority required to modify staff profiles.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_user_role_escalation ON user_profiles;
CREATE TRIGGER trg_prevent_user_role_escalation
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_user_role_escalation();

-- Trigger to prevent any modification or deletion of stock movements ledger
CREATE OR REPLACE FUNCTION enforce_ledger_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Statutory Violation: Stock Movement Ledger rows are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stock_movements_immutable ON stock_movements;
CREATE TRIGGER trg_stock_movements_immutable
BEFORE UPDATE OR DELETE ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION enforce_ledger_immutability();

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION enforce_ledger_immutability();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES — DENY BY DEFAULT
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scope_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE godowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_inwards ENABLE ROW LEVEL SECURITY;
ALTER TABLE fps_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fifo_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Deny all access to anonymous users by default
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- USER PROFILES RLS
CREATE POLICY "user_profiles_read_own_or_admin"
ON user_profiles FOR SELECT TO authenticated
USING (
    id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid()
          AND up.role IN ('PLATFORM_SUPER_ADMIN', 'STATE_ADMIN')
    )
);

CREATE POLICY "user_profiles_update_policy"
ON user_profiles FOR UPDATE TO authenticated
USING (
    id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid()
          AND up.role IN ('PLATFORM_SUPER_ADMIN', 'STATE_ADMIN')
    )
);

-- STOCK BATCHES RLS (Depot Scoping & Role Access)
CREATE POLICY "stock_batches_scoped_select"
ON stock_batches FOR SELECT TO authenticated
USING (
    -- User assigned to this godown
    godown_id IN (
        SELECT usa.godown_id FROM user_scope_assignments usa
        WHERE usa.user_id = auth.uid() AND usa.is_active = true
    )
    OR
    -- State or District Administrative oversight
    EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN godowns g ON g.id = stock_batches.godown_id
        WHERE up.id = auth.uid()
          AND (
            up.role = 'PLATFORM_SUPER_ADMIN'
            OR (up.role = 'STATE_ADMIN' AND up.state_code = g.state_code)
            OR (up.role IN ('DISTRICT_SUPPLY_OFFICER', 'AUDITOR') AND up.district_id = g.district_id)
          )
    )
);

CREATE POLICY "stock_batches_scoped_update"
ON stock_batches FOR UPDATE TO authenticated
USING (
    godown_id IN (
        SELECT usa.godown_id FROM user_scope_assignments usa
        JOIN user_profiles up ON up.id = usa.user_id
        WHERE usa.user_id = auth.uid()
          AND usa.is_active = true
          AND up.role IN ('GODOWN_MANAGER', 'QUALITY_INSPECTOR')
    )
);

-- STOCK MOVEMENTS RLS (Append Only, Read Scoped)
CREATE POLICY "stock_movements_scoped_select"
ON stock_movements FOR SELECT TO authenticated
USING (
    godown_id IN (
        SELECT usa.godown_id FROM user_scope_assignments usa
        WHERE usa.user_id = auth.uid() AND usa.is_active = true
    )
    OR
    EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN godowns g ON g.id = stock_movements.godown_id
        WHERE up.id = auth.uid()
          AND (
            up.role = 'PLATFORM_SUPER_ADMIN'
            OR (up.role = 'STATE_ADMIN' AND up.state_code = g.state_code)
            OR (up.role IN ('DISTRICT_SUPPLY_OFFICER', 'AUDITOR') AND up.district_id = g.district_id)
          )
    )
);

CREATE POLICY "stock_movements_insert_policy"
ON stock_movements FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid()
          AND up.role NOT IN ('AUDITOR', 'FPS_RECIPIENT')
          AND up.is_active = true
    )
);

-- ==============================================================================
-- 9. INITIAL PLATFORM SUPER ADMIN PROVISIONING SEED
-- ==============================================================================
-- Note: Execute inside Supabase SQL editor or migration runner to initialize the
-- platform tenant and initial administrative authority.

INSERT INTO organizations (id, name, state_code, is_active)
VALUES ('ORG-CENTRAL-PDS', 'Central Public Distribution System — HQ', 'DL', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO godowns (id, organization_id, name, code, district_id, district_name, state_code)
VALUES ('WH-DEL-04', 'ORG-CENTRAL-PDS', 'Central Grain Store — Demo', 'WH-DEL-04', 'DL-NW', 'North West Division', 'DL')
ON CONFLICT (id) DO NOTHING;
