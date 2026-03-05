module.exports = {
  async up(db) {
    await db.collection('users').updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user', triviaOptOut: false, seenDailyContentIds: [] } },
    );
  },

  async down(db) {
    await db.collection('users').updateMany(
      {},
      { $unset: { role: '', triviaOptOut: '', seenDailyContentIds: '' } },
    );
  },
};
