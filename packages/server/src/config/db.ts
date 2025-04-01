import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';

// Create a SQLite database file in the project directory
const dbPath = path.join(__dirname, '../../nextstep.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false // Set to console.log to see SQL queries
});

const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Development helper - if sync fails, automatically reset database
    try {
      // Try to sync with {alter: true} first (preserve data when possible)
      await sequelize.sync({ alter: true });
      console.log('Models synchronized with database');
    } catch (syncError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Sync failed, attempting to reset database...');
        try {
          // Force recreate all tables
          await sequelize.sync({ force: true });
          console.log('Database reset successful');
        } catch (resetError) {
          // If even force sync fails, the file might be corrupted
          console.error('Database reset failed, attempting to recreate file');
          if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath); // Delete the database file
          }
          await sequelize.sync({ force: true });
          console.log('Database file recreated successfully');
        }
      } else {
        // In production, don't auto-reset database
        throw syncError;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Database connection error: ${error.message}`);
    } else {
      console.error(`An unexpected database error occurred: ${error}`);
    }
    process.exit(1);
  }
};

export { sequelize, connectDB };