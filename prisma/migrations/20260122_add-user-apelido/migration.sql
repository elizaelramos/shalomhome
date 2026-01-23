-- Migration: add-user-apelido
-- Adds `apelido` column to `users` table

ALTER TABLE `users` ADD COLUMN `apelido` VARCHAR(255) NULL;