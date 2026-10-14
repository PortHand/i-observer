-- UPI account the checkout QR code pays. Safe on databases that already have it (e.g. added by hand):
-- it's only inserted if missing, and only made active when no other account is active, since at
-- most one can be. Change accounts in the upi_accounts table from now on.
INSERT INTO "upi_accounts" ("upi_id", "payee_name", "active")
SELECT 'princerajgrke1901@okhdfcbank', 'iOverlay', NOT EXISTS (SELECT 1 FROM "upi_accounts" WHERE "active")
WHERE NOT EXISTS (SELECT 1 FROM "upi_accounts" WHERE "upi_id" = 'princerajgrke1901@okhdfcbank');
