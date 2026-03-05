// Run from repo root: node scripts/shuffle-trivia-answers.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './migrations/.env' });

const MONGO_URI = process.env.DATABASE_URL;
const DB_NAME = process.env.DATABASE_NAME || 'cinemacove';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const col = db.collection('dailycontents');

  const docs = await col.find({ type: 'trivia', choices: { $exists: true } }).toArray();
  console.log(`Found ${docs.length} trivia documents`);

  let updated = 0;
  for (const doc of docs) {
    const correctAnswer = doc.choices[doc.correctChoiceIndex];
    const shuffled = shuffle(doc.choices);
    const newIndex = shuffled.indexOf(correctAnswer);

    await col.updateOne(
      { _id: doc._id },
      { $set: { choices: shuffled, correctChoiceIndex: newIndex } }
    );
    updated++;
    console.log(`[${doc.title}] correct: "${correctAnswer}" → was [${doc.correctChoiceIndex}], now [${newIndex}]`);
  }

  console.log(`\nDone. Updated ${updated} documents.`);
  await client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
