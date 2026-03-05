// Run from repo root: node scripts/seed-fun-facts.js
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: './migrations/.env' });

const MONGO_URI = process.env.DATABASE_URL;
const DB_NAME = process.env.DATABASE_NAME || 'cinemacove';

const funFacts = [
  {
    title: 'The Wilhelm Scream',
    content: "The same scream sound effect has appeared in over 400 films — including Star Wars, Indiana Jones, Lord of the Rings, Batman Returns, and even Toy Story. Originally recorded in 1951 for \"Distant Drums,\" it became an inside joke among sound designers. Listen for it and you'll never un-hear it.",
  },
  {
    title: 'Why Theaters Smell Like Popcorn',
    content: "Many theaters without on-site poppers pump synthetic popcorn scent through their ventilation systems. The smell is engineered to trigger hunger and impulse buying before you even reach the concession stand. You've been chemically manipulated every single time.",
  },
  {
    title: 'Cinema Was Born from a Bet',
    content: "The first slow-motion footage was captured in 1878 by photographer Eadweard Muybridge — hired to settle a bet about whether a galloping horse ever has all four hooves off the ground simultaneously. (It does.) His sequential camera setup to prove it became the direct ancestor of motion pictures.",
  },
  {
    title: 'Opening Weekend Used to Be Friday',
    content: "Studios shifted film premieres from Friday to Thursday night in 2012, gaining an extra revenue night while still calling it \"opening weekend.\" Some blockbusters now open Wednesday night. At this rate, opening weekend will start on Monday by 2040.",
  },
  {
    title: 'The Hays Code Banned Flushing',
    content: "Before the modern rating system (introduced 1968), Hollywood films were governed by the Hays Code (1934–1968). Among its rules: no married couples in the same bed, no drug references, no nudity, and — famously — no toilet flushing on screen. Psycho (1960) caused a scandal simply by showing a flushing toilet.",
  },
  {
    title: 'Every Crunch, Snap and Squelch Is Fake',
    content: "Foley artists recreate every sound effect you hear in a film that wasn't captured on set. Named after Jack Foley, who pioneered the technique in the 1920s. Standard tricks of the trade: snapping celery for breaking bones, punching a watermelon for face impacts, and a plunger in wet mud for quicksand. Delightful people.",
  },
  {
    title: "Silent Films Weren't Black and White by Accident",
    content: "Many silent films were deliberately tinted — blue for night scenes, red for fire, green for fantasy. Some were hand-colored frame by frame. The Wizard of Oz switching from sepia to full Technicolor in 1939 wasn't a technical gimmick — it was a conscious artistic statement. Dorothy's world was always in color. Ours just wasn't ready.",
  },
  {
    title: '1946 Was Peak Cinema',
    content: "US movie theater attendance peaked in 1946: ~90 million tickets sold per week, in a country of 141 million people. Today, with 330 million people, weekly attendance barely hits 25 million. Television, then home video, then streaming each took a bite. The industry has been fighting for relevance for 80 years.",
  },
  {
    title: "End Credits Didn't Always Exist",
    content: "The very first films had no credits at all — studios assumed audiences didn't care who made them. Directors only started getting prominent credits in the 1920s as they became stars in their own right. Today, Avengers: Endgame's credits run over 10 minutes and list thousands of names. Full circle from nobody to everybody.",
  },
  {
    title: 'Bond Is Eternal',
    content: "The James Bond franchise is the longest continually running film series in history — over 60 years from Dr. No (1962) to today, 6 actors, 25+ official films, $7+ billion at the box office. It has outlasted the Cold War it was born in, the Soviet Union it fought against, and every studio trend that tried to replace it. Bond always comes back.",
  },
];

// Fridays starting March 13, 2026 — expiring the following Monday
const fridays = [
  { publish: '2026-03-13', expires: '2026-03-16' },
  { publish: '2026-03-20', expires: '2026-03-23' },
  { publish: '2026-03-27', expires: '2026-03-30' },
  { publish: '2026-04-03', expires: '2026-04-06' },
  { publish: '2026-04-10', expires: '2026-04-13' },
  { publish: '2026-04-17', expires: '2026-04-20' },
  { publish: '2026-04-24', expires: '2026-04-27' },
  { publish: '2026-05-01', expires: '2026-05-04' },
  { publish: '2026-05-08', expires: '2026-05-11' },
  { publish: '2026-05-15', expires: '2026-05-18' },
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const col = db.collection('dailycontents');

  const docs = funFacts.map((f, i) => ({
    _id: new ObjectId(),
    type: 'fun-fact',
    title: f.title,
    content: f.content,
    publishAt: new Date(`${fridays[i].publish}T00:00:00.000Z`),
    expiresAt: new Date(`${fridays[i].expires}T00:00:00.000Z`),
    createdBy: 'seed',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const result = await col.insertMany(docs);
  console.log(`Inserted ${result.insertedCount} fun facts.`);
  docs.forEach(d => console.log(`  ${d.publishAt.toISOString().slice(0, 10)} → ${d.expiresAt.toISOString().slice(0, 10)}: ${d.title}`));
  await client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
