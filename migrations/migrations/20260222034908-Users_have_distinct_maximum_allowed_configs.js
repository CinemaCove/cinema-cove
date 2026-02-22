module.exports = {
    /**
     * @param db {import('mongodb').Db}
     * @param client {import('mongodb').MongoClient}
     * @returns {Promise<void>}
     */
    async up(db, client) {
        await db.collection('users')
            .updateMany(
                {maxAllowedConfigs: {$exists: false}},
                {$set: {maxAllowedConfigs: 20}});
    },

    /**
     * @param db {import('mongodb').Db}
     * @param client {import('mongodb').MongoClient}
     * @returns {Promise<void>}
     */
    async down(db, client) {
        await db.collection('users')
            .updateMany(
                {},
                {$unset: {maxAllowedConfigs: ''}});
    }
};
