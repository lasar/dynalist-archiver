const should = require('should');

const Archiver = require('../');

const env = require('./env');

describe('setup.setApiToken', function () {
    it('should set the token', async function () {
        const archiver = new Archiver()
            .setup.setApiToken(env.apiToken);

        archiver.setup.getApiToken().should.be.exactly(env.apiToken);
    });
});
