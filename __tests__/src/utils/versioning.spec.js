import {assert} from 'chai';
import {getNextVersion, getPreviousVersion} from '../../../src/Utils/versioning';

describe('Application Service', () => {

    it('should get increase version by 0.01', () => {
        const startVersion = "0.0.5";
        const expectedNextVersion = "0.0.6";
        assert.equal(getNextVersion(startVersion), expectedNextVersion);
    });

    it('should get increase version by 0.001', () => {
        const startVersion = "0.0.0.5";
        const expectedNextVersion = "0.0.0.6";
        assert.equal(getNextVersion(startVersion), expectedNextVersion);
    });

    it('should get increase version by 0.1', () => {
        const startVersion = "0.5";
        const expectedNextVersion = "0.6";
        assert.equal(getNextVersion(startVersion), expectedNextVersion);
    });

    it('should get decrease version by 0.01', () => {
        const startVersion = "0.0.5";
        const expectedPreviousVersion = "0.0.4";
        assert.equal(getPreviousVersion(startVersion), expectedPreviousVersion);
    });

    it('should get decrease version by 0.001', () => {
        const startVersion = "0.0.0.5";
        const expectedNextVersion = "0.0.0.4";
        assert.equal(getPreviousVersion(startVersion), expectedNextVersion);
    });

    it('should get decrease version by 0.1', () => {
        const startVersion = "0.5";
        const expectedNextVersion = "0.4";
        assert.equal(getPreviousVersion(startVersion), expectedNextVersion);
    });
});