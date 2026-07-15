import app from './app';
import { config } from './config';
import { logger } from './config/logger';
import { prisma } from './shared/prisma';

async function main() {
  try {
    await prisma.$connect();
    logger.info('Connected to database');

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down');
  await prisma.$disconnect();
  process.exit(0);
});

main();
