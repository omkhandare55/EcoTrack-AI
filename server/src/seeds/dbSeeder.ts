import { Challenge } from '../models/Challenge';
import { SEED_CHALLENGES } from './challenges';

export async function seedDatabase(): Promise<void> {
  try {
    const count = await Challenge.countDocuments();
    if (count === 0) {
      console.error('🌱  Seeding database with default challenges...');
      await Challenge.insertMany(SEED_CHALLENGES);
      console.error('✅  Database seeded successfully!');
    }
  } catch (err) {
    console.error('❌  Error seeding database:', err);
  }
}
