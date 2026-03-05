module.exports = {
  async up(db) {
    await db.collection('users').updateMany(
      { funFactOptOut: { $exists: false } },
      { $set: { funFactOptOut: false } },
    );
  },

  async down(db) {
    await db.collection('users').updateMany(
      {},
      { $unset: { funFactOptOut: '' } },
    );
  },
};
