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
            .find(query || {}, options || {});
    }

    getDbCollection(collectionName) {
        return this.db.collection(collectionName);
    }


    async getAndMap(collectionName, mapFunc, query) {
        return await this.db.collection(collectionName)
            .find(query || {}).map(mapFunc).toArray();
    }


    async getSingle(collectionName, query, options) {
        return await this.db.collection(collectionName)
            .findOne(query || {}, options || {});
    }

    async removeById(collectionName, docId) {
        return await this.db.collection(collectionName)
            .findOneAndDelete({_id: docId});
    }

    async isCollectionExist(collectionName) {
        return this.db.getCollectionNames().findIndex(cn => cn === collectionName) !== -1;
    }

    async remove(collectionName, query) {
        if (query && !isEmpty(query))
            return await this.db.collection(collectionName)
                .findOneAndDelete(query);
    }

    async insert(collectionName, docs, isAutoGenerate = true, options = {}) {
        let idsOrId = isAutoGenerate ? [] : null;
        const addId = (doc) => {
            doc._id = generateId();
            return doc._id;
        };
        if (isArray(docs) && docs.length > 1) {
            let docsWithIds = docs;
            if (isAutoGenerate) {
                docsWithIds = docs.map((doc) => {
                    const _id = generateId();
                    idsOrId.push(_id);
                    return Object.assign(doc, {_id})
                });
            }
            await db.collection(collectionName).insertMany(docsWithIds, options);
        }
        else if (docs.length === 1) {
            if (isAutoGenerate)
                idsOrId = addId(docs[0]);

            await this.db.collection(collectionName).insertOne(docs[0], options);
        }
        else {
            if (isAutoGenerate)
                idsOrId = addId(docs);

            const result = await this.db.collection(collectionName).insertOne(docs, options);
        }
        return idsOrId;
    }

    async update(collectionName, query, update, options, isMany) {
        const collection = this.db.collection(collectionName);
        return isMany ? await collection.updateMany(query, update, options)
            : await collection.findOneAndUpdate(query, update, options);
    }

    async aggregate(collectionName, pipeline, options) {
        const collection = this.db.collection(collectionName);
        return await collection.aggregate(pipeline, options);
    }

}