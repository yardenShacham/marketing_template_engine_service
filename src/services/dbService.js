import {isArray, isEmpty} from 'lodash';

const MongoClient = require('mongodb').MongoClient;
const dbName = 'mte_db';
const url = 'mongodb://localhost:27017';

export class dbService {

    constructor() {
        this.init();
    }

    init() {
        this.client = null;
        this.db = null;
        this.insertResult = null;
        this.updateResult = null;
    }

    async connect() {
        try {
            this.client = await MongoClient.connect(url);
            this.db = this.client.db(dbName);
            return this;
        } catch (err) {
            console.log(err.stack);
        }
    }

    close() {
        const result = {
            insertResult: this.insertResult,
            updateResult: this.updateResult
        };
        this.client.close();
        this.init();
        return result;
    }

    async getCollection(collectionName, query, options) {
        return await this.db.collection(collectionName)
            .find(query || {}, options || {}).toArray();
    }

    async getSingle(collectionName, query, options) {
        return await this.db.collection(collectionName)
            .findOne(query || {}, options || {});
    }

    async removeById(collectionName, docId) {
        return await this.db.collection(collectionName)
            .deleteOne({_id: docId});
    }

    async isCollectionExist(collectionName) {
        return this.db.getCollectionNames().findIndex(cn => cn === collectionName) !== -1;
    }

    async remove(collectionName, query) {
        if (query && !isEmpty(query))
            return await this.db.collection(collectionName)
                .deleteOne(query);
    }

    async insert(collectionName, docs) {
        if (isArray(docs) && docs.length > 1) {
            this.insertResult = await db.collection(collectionName).insertMany(docs);
        }
        else if (docs.length === 1) {
            this.insertResult = await this.db.collection(collectionName).insertOne(docs[0]);
        }
        else {
            this.insertResult = await this.db.collection(collectionName).insertOne(docs);
        }
        return this;
    }

    async update(collectionName, filter, update, options, isMany) {
        const collection = this.db.collection(collectionName);
        return isMany ? await collection.updateMany(filter, update, options)
            : await collection.updateOne(filter, update, options);
        return this;
    }
}