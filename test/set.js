const should = require('should');

const Archiver = require('../');

const env = require('./env');

describe('set', function () {
    it('set should write options', async function () {
        let archiver = new Archiver();

        archiver.set({
            apiToken: env.apiToken
        });

        archiver.options.apiToken.should.equal(env.apiToken);
    });

    it('set should overwrite options', async function () {
        let archiver = new Archiver();

        archiver.set({
            apiToken: 'test-token'
        });

        archiver.set({
            apiToken: env.apiToken
        });

        archiver.options.apiToken.should.equal(env.apiToken);
    });
});
