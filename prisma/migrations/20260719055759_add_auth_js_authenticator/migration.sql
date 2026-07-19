-- CreateTable
CREATE TABLE `Authenticator` (
    `_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `credentialPublicKey` VARCHAR(191) NOT NULL,
    `counter` INTEGER NOT NULL,
    `credentialDeviceType` VARCHAR(191) NOT NULL,
    `credentialBackedUp` BOOLEAN NOT NULL,
    `transports` VARCHAR(191) NULL,

    UNIQUE INDEX `Authenticator__id_key`(`_id`),
    UNIQUE INDEX `Authenticator_user_id__id_key`(`user_id`, `_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Authenticator` ADD CONSTRAINT `Authenticator_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
