let Setup = function (archiver) {
    this.archiver = archiver;

    let apiToken = null;

    this.setApiToken = function (_apiToken) {
        apiToken = _apiToken;

        return this.archiver;
    };

    this.getApiToken = function () {
        return apiToken;
    };
};

module.exports = Setup;
