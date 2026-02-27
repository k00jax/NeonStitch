-- Etsy inventory sync schema additions

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS etsy_shop_id TEXT,
  ADD COLUMN IF NOT EXISTS etsy_listing_id TEXT,
  ADD COLUMN IF NOT EXISTS etsy_variant_id TEXT,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0;

ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS etsy_shop_id TEXT,
  ADD COLUMN IF NOT EXISTS etsy_listing_id TEXT,
  ADD COLUMN IF NOT EXISTS etsy_variant_id TEXT,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  delivery_key TEXT NOT NULL UNIQUE,
  event_id TEXT,
  shop_id TEXT,
  listing_id TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_provider_received
  ON webhook_deliveries(provider, received_at DESC);

CREATE TABLE IF NOT EXISTS inventory_events (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  listing_id TEXT,
  variant_id TEXT,
  product_id BIGINT,
  product_variant_id BIGINT,
  prev_qty INTEGER NOT NULL,
  new_qty INTEGER NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  webhook_delivery_key TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_events_occurred_at
  ON inventory_events(occurred_at DESC);

CREATE TABLE IF NOT EXISTS inventory_unmapped (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  shop_id TEXT,
  listing_id TEXT,
  variant_id TEXT,
  sku TEXT,
  quantity INTEGER NOT NULL,
  webhook_delivery_key TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_sync_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  shop_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  webhook_delivery_key TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 8,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_sync_jobs_status_available
  ON inventory_sync_jobs(status, available_at ASC);

CREATE INDEX IF NOT EXISTS idx_products_etsy_mapping
  ON products(etsy_shop_id, etsy_listing_id, etsy_variant_id, sku);

CREATE INDEX IF NOT EXISTS idx_product_variants_etsy_mapping
  ON product_variants(etsy_shop_id, etsy_listing_id, etsy_variant_id, sku);
