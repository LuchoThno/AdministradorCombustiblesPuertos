import { disconnectDatabase, pingDatabase } from '../db.js';

async function run() {
  try {
    await pingDatabase();
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    await disconnectDatabase();
  }
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
