import {appServices} from '../../../src/consts/appServices';
import {collections} from '../../../src/consts/db';
import {assert} from 'chai';
import {getInjector} from '../../../src/app-injector';

describe('dbService Service', () => {
    let dbService = getInjector().get(appServices.dbService);


    it('dbService service should start', () => {
        assert(!!dbService, "service not started");
    });

    it('dbService service should connect to the db', () => {
        return dbService.connect();
    });

    it('dbService service should insert doc', () => {
        return dbService.insert(collections.views, {
            _id: 'test'
        }).then((result) => {
            let i = result;
        });
    });

    it('dbService service should get the doc that just inserted', () => {
        return dbService.getCollection(collections.views, {_id: "test"}).then((docs) => {
            const insertedDoc = docs[0];
            assert(insertedDoc && insertedDoc._id === "test", "get dont work");
        });
    });

    it('dbService service should get the doc that just inserted', () => {
        return dbService
            .removeById(collections.views, "test")
            .then(() => {
                return dbService.getCollection(collections.views, {_id: "test"}).then((docs) => {
                    const insertedDoc = docs[0];
                    assert(!insertedDoc, "doc dont removed");
                })
            });
    });

});