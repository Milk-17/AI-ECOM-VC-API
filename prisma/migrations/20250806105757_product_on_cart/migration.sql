-- DropForeignKey
ALTER TABLE `prouctoncart` DROP FOREIGN KEY `ProuctOnCart_cartId_fkey`;

-- DropForeignKey
ALTER TABLE `prouctoncart` DROP FOREIGN KEY `ProuctOnCart_productId_fkey`;

-- DropIndex
DROP INDEX `ProuctOnCart_cartId_fkey` ON `prouctoncart`;

-- DropIndex
DROP INDEX `ProuctOnCart_productId_fkey` ON `prouctoncart`;

-- AddForeignKey
ALTER TABLE `ProuctOnCart` ADD CONSTRAINT `ProuctOnCart_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProuctOnCart` ADD CONSTRAINT `ProuctOnCart_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
