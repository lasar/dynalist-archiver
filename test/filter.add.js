const should = require('should');

const Archiver = require('../');

const env = require('./env');

describe('source.add', function () {
    it('should add seach string', async function () {
        const testFilter = 'is:checked';

        const archiver = new Archiver()
            .setup.setApiToken(env.apiToken)
            .filter.add(testFilter);

        archiver.filter.get().should.containEql(testFilter);
    });
});
