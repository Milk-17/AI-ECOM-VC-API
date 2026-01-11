-- AddForeignKey
ALTER TABLE `AdminLog` ADD CONSTRAINT `AdminLog_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
