-- Migración SQL para agregar campos de autorización y despacho a la tabla Quote
-- Ejecuta esto en Supabase -> SQL Editor

ALTER TABLE "Quote"
ADD COLUMN IF NOT EXISTS "authorizedBy" TEXT,
ADD COLUMN IF NOT EXISTS "authorizedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "documentType" TEXT, -- 'boleta' o 'factura'
ADD COLUMN IF NOT EXISTS "documentNumber" TEXT,
ADD COLUMN IF NOT EXISTS "dispatchedAt" TIMESTAMP;

-- Actualizar el status para incluir los nuevos estados
-- Estados: pending, approved, authorized, dispatched, completed, rejected
