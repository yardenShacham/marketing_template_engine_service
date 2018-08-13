import {isArray, isEmpty} from 'lodash';
import {getQueryId} from '../Utils/db';
import {getError} from '../api/infra/errorHandler';
import {errorTypes} from '../consts/errors';

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

    async connect(options = {}) {
        try {
            this.client = await MongoClient.connect(url, Object.assign({useNewUrlParser: true}, options));
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

    getCollectionCursor(collectionName, query, options) {
        return this.db.collection(collectionName)
            .find(query || {}, options || {});
    }

    async getCollection(collectionName, query, options) {
        return await this.db.collection(collectionName)
            .find(query || {}, options || {}).toArray();
    }

    getDbCollection(collectionName) {
        return this.db.collection(collectionName);
    }


    async getAndMap(collectionName, mapFunc, query) {
        return await this.db.collection(collectionName)
            .find(query || {}).map(mapFunc).toArray();
    }


    async getSingle(collectionName, query, projectionFields = {}, projection = {}) {
        let fullProjection = {};
        if (!isEmpty(projectionFields)) {
            fullProjection = Object.assign(fullProjection, {fields: projectionFields});
        }
        if (!isEmpty(projection)) {
            fullProjection = Object.assign(fullProjection, projection);
        }
        if (isEmpty(fullProjection))
            fullProjection = null;

        return await this.db.collection(collectionName)
            .findOne(query || {}, fullProjection);
    }

    async removeById(collectionName, docId) {
        return await this.db.collection(collectionName)
            .findOneAndDelete(getQueryId(docId));
    }

    async isCollectionExist(collectionName) {
        return this.db.getCollectionNames().findIndex(cn => cn === collectionName) !== -1;
    }

    async remove(collectionName, query) {
        try {
            if (query && !isEmpty(query)) {
                const result = await this.db.collection(collectionName)
                    .findOneAndDelete(query);
                return result;
            }
            return getError(errorTypes.generalError, e);
        } catch (e) {
            console.log(e);
            return getError(errorTypes.generalError, e);
        }
    }

    async removeArrayItemById(collectionName, arrayName, query, id) {
        try {
            if (query && !isEmpty(query)) {
                await  this.update(collectionName, query, {$pull: {[arrayName]: getQueryId(id)}});
            }
            return getError(errorTypes.generalError, e);
        } catch (e) {
            console.log(e);
            return getError(errorTypes.generalError, e);
        }
    }

    async insert(collectionName, docs, options = {}) {
        let result = null;
        if (isArray(docs) && docs.length > 1) {
            result = await db.collection(collectionName).insertMany(docs, options);
        }
        else if (docs.length === 1) {
            result = await this.db.collection(collectionName)
                .insertOne(docs[0], options);
        }
        else {
            result = await this.db.collection(collectionName).insertOne(docs, options);
        }
        return result.insertedId;
    }

    async update(collectionName, query, update, options, isMany) {
        const collection = this.db.collection(collectionName);
        return isMany ? await collection.updateMany(query, update, options)
            : await collection.findOneAndUpdate(query, update, options);
    }

    async save(collectionName, doc) {
        const collection = this.db.collection(collectionName);
        return await collection.save(doc);
    }

    async getSingleFromCursor(cursor) {
        let result = null;
        if (await cursor.hasNext()) {
            result = await cursor.next();
        }

        return result;
    }

    async getAllCursor(cursor) {
        let result = await cursor.toArray();


        return result;
    }

    aggregate(collectionName, pipeline, options) {
        const collection = this.db.collection(collectionName);
        return collection.aggregate(pipeline, options);
    }

}