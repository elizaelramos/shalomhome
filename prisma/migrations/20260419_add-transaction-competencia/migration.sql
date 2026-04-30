-- Migration: add-transaction-competencia
-- Adds `competencia` column to `transactions` for regime de competência.
-- Existing rows are backfilled to the first day of the month of `data`.

ALTER TABLE `transactions` ADD COLUMN `competencia` DATE NULL AFTER `data`;

UPDATE `transactions`
SET `competencia` = DATE_FORMAT(`data`, '%Y-%m-01')
WHERE `competencia` IS NULL;

ALTER TABLE `transactions` MODIFY `competencia` DATE NOT NULL;

CREATE INDEX `transactions_competencia_idx` ON `transactions` (`competencia`);
