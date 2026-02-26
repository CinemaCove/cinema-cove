module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection('curatedlists')
      .updateMany(
        { changeVersion: { $exists: false } },
        { $set: { changeVersion: 1 } },
      );

    await db.collection('curatedgroups')
      .updateMany(
        { changeVersion: { $exists: false } },
        { $set: { changeVersion: 1 } },
      );

    await db.collection('addonconfigs')
      .updateMany(
        {
          source: { $in: ['curated-list', 'tmdb-list', 'franchise-group'] },
          installedVersion: { $exists: false },
        },
        { $set: { installedVersion: 1 } },
      );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection('curatedlists')
      .updateMany(
        {},
        { $unset: { changeVersion: '' } },
      );

    await db.collection('curatedgroups')
      .updateMany(
        {},
        { $unset: { changeVersion: '' } },
      );

    await db.collection('addonconfigs')
      .updateMany(
        { source: { $in: ['curated-list', 'tmdb-list', 'franchise-group'] } },
        { $unset: { installedVersion: '' } },
      );
  }
};
