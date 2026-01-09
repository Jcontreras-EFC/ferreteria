-- Migración SQL para agregar campos de cotizador a la tabla Quote
-- Ejecuta esto en Supabase -> SQL Editor

ALTER TABLE "Quote"
ADD COLUMN IF NOT EXISTS "approvedBy" TEXT,
ADD COLUMN IF NOT EXISTS "rejectedBy" TEXT,
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "estimatedDelivery" INTEGER,
ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Actualizar el status para usar los nuevos valores
-- Los valores existentes se mantienen, solo agregamos los nuevos campos
