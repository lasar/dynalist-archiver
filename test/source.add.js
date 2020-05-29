const should = require('should');

const Archiver = require('../');

const env = require('./env');

describe('source.add', function () {
    it('should add document ID', async function () {
        const documentId = 'test123';
        const archiver = new Archiver()
            .setup.setApiToken(env.apiToken)
            .source.add(documentId);

        archiver.source.get().should.containEql(documentId);
    });
});
