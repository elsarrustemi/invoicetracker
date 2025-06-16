-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "description" TEXT;
