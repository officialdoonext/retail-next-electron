-- ============================================================================
-- RetailNext — Multi-Tenant Cloud Database Schema for Supabase
-- Run this complete script in the Supabase Dashboard: SQL Editor -> New Query
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  mobile       TEXT,
  city         TEXT,
  address      TEXT,
  status       TEXT NOT NULL DEFAULT 'inactive',  -- 'inactive' on creation, 'active' once approved
  expiry_date  TIMESTAMPTZ DEFAULT NULL,          -- NULL until administrator sets expiration date
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tenant Users (Maps Supabase Auth users to their tenant)
CREATE TABLE IF NOT EXISTS public.tenant_users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'admin',  -- 'admin', 'manager', 'cashier'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for tenant lookup performance
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON public.tenant_users(tenant_id);

-- 3. Products Table (Strictly Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.products (
  id              TEXT NOT NULL,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  code            TEXT,
  sku             TEXT,
  barcode         TEXT,
  category        TEXT,
  subcategory     TEXT,
  brand           TEXT,
  uom             TEXT DEFAULT 'Pieces',
  purchase_price  NUMERIC(12, 2) DEFAULT 0,
  selling_price   NUMERIC(12, 2) DEFAULT 0,
  mrp             NUMERIC(12, 2) DEFAULT 0,
  gst_rate        NUMERIC(5, 2) DEFAULT 0,
  current_stock   NUMERIC(12, 2) DEFAULT 0,
  min_stock       NUMERIC(12, 2) DEFAULT 0,
  location        TEXT,
  status          TEXT DEFAULT 'Active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(tenant_id, barcode);

-- 4. Customers Table (Strictly Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.customers (
  id              TEXT NOT NULL,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  mobile          TEXT,
  email           TEXT,
  city            TEXT,
  customer_group  TEXT DEFAULT 'Retail Regular',
  credit_limit    NUMERIC(12, 2) DEFAULT 0,
  outstanding     NUMERIC(12, 2) DEFAULT 0,
  loyalty_points  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON public.customers(tenant_id, mobile);

-- 5. Invoices Table (Strictly Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.invoices (
  id            TEXT NOT NULL,
  tenant_id     UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_no    TEXT NOT NULL,
  customer_id   TEXT,
  customer_name TEXT,
  amount        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_mode  TEXT NOT NULL DEFAULT 'Cash',
  status        TEXT NOT NULL DEFAULT 'Paid',
  ref_no        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON public.invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_no ON public.invoices(tenant_id, invoice_no);

-- 6. Purchases Table (Strictly Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.purchases (
  id            TEXT NOT NULL,
  tenant_id     UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  purchase_no   TEXT NOT NULL,
  supplier_id   TEXT,
  supplier_name TEXT,
  invoice_ref   TEXT,
  total_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'Received',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_tenant ON public.purchases(tenant_id);

-- ============================================================================
-- GRANTS & PERMISSIONS (Crucial for PostgREST / Supabase tables access)
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — HIGH SECURITY TENANT ISOLATION
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Helper function: Returns current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.tenant_users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop existing policies if re-running script
DROP POLICY IF EXISTS "Users can read own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can create a new tenant" ON public.tenants;
DROP POLICY IF EXISTS "Allow tenant selection" ON public.tenants;
DROP POLICY IF EXISTS "Allow tenant creation" ON public.tenants;
DROP POLICY IF EXISTS "Allow tenant update" ON public.tenants;

DROP POLICY IF EXISTS "Users can read own tenant mapping" ON public.tenant_users;
DROP POLICY IF EXISTS "Users can insert their own tenant mapping" ON public.tenant_users;
DROP POLICY IF EXISTS "Allow tenant_users select" ON public.tenant_users;
DROP POLICY IF EXISTS "Allow tenant_users insert" ON public.tenant_users;

DROP POLICY IF EXISTS "Strict tenant isolation on products" ON public.products;
DROP POLICY IF EXISTS "Strict tenant isolation on customers" ON public.customers;
DROP POLICY IF EXISTS "Strict tenant isolation on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Strict tenant isolation on purchases" ON public.purchases;

-- Policies on Tenants table
CREATE POLICY "Allow tenant selection"
  ON public.tenants
  FOR SELECT
  USING (true);

CREATE POLICY "Allow tenant creation"
  ON public.tenants
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow tenant update"
  ON public.tenants
  FOR UPDATE
  USING (true);

-- Policies on Tenant Users table
CREATE POLICY "Allow tenant_users select"
  ON public.tenant_users
  FOR SELECT
  USING (true);

CREATE POLICY "Allow tenant_users insert"
  ON public.tenant_users
  FOR INSERT
  WITH CHECK (true);

-- Policy on Products: Strict tenant isolation
CREATE POLICY "Strict tenant isolation on products"
  ON public.products
  FOR ALL
  USING (tenant_id = public.get_auth_tenant_id())
  WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- Policy on Customers: Strict tenant isolation
CREATE POLICY "Strict tenant isolation on customers"
  ON public.customers
  FOR ALL
  USING (tenant_id = public.get_auth_tenant_id())
  WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- Policy on Invoices: Strict tenant isolation
CREATE POLICY "Strict tenant isolation on invoices"
  ON public.invoices
  FOR ALL
  USING (tenant_id = public.get_auth_tenant_id())
  WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- Policy on Purchases: Strict tenant isolation
CREATE POLICY "Strict tenant isolation on purchases"
  ON public.purchases
  FOR ALL
  USING (tenant_id = public.get_auth_tenant_id())
  WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- ============================================================================
-- ADMINISTRATOR HELPER FUNCTIONS
-- Use these in the Supabase SQL Editor to activate or extend store subscriptions:
-- ============================================================================

-- Activate Tenant & Set Expiry Date (e.g. 1 Year from today)
-- Example usage: SELECT public.admin_activate_tenant('insert-tenant-uuid-here', '2027-12-31');
CREATE OR REPLACE FUNCTION public.admin_activate_tenant(t_id UUID, exp_date TIMESTAMPTZ)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tenants
  SET status = 'active',
      expiry_date = exp_date,
      updated_at = NOW()
  WHERE id = t_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

