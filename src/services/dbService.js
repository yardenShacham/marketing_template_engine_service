import {isArray, isEmpty} from 'lodash';
import generateId from 'uuid/v1';

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
        this.client.close();
        this.init();
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
        let idsOrId = [];
        const addId = (doc) => {
            doc._id = generateId();
            return doc._id;
        };
        if (isArray(docs) && docs.length > 1) {
            const docsWithIds = docs.map((doc) => {
                const _id = generateId();
                idsOrId.push(_id);
                return Object.assign(doc, {_id})
            });
            await db.collection(collectionName).insertMany(docsWithIds);
        }
        else if (docs.length === 1) {
            idsOrId = addId(docs[0]);
            await this.db.collection(collectionName).insertOne(docs[0]);
        }
        else {
            idsOrId = addId(docs);
            await this.db.collection(collectionName).insertOne(docs);
        }
        this.close();
        return idsOrId;
    }

    async update(collectionName, filter, update, options, isMany) {
        const collection = this.db.collection(collectionName);
        return isMany ? await collection.updateMany(filter, update, options)
            : await collection.updateOne(filter, update, options);
        return this;
    }
}