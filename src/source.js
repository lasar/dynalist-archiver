let Source = function (archiver) {
    this.archiver = archiver;

    let documents = [];

    this.add = function (id) {
        documents.push(id);

        return this.archiver;
    };

    this.get = function () {
        return documents;
    };
};

module.exports = Source;
