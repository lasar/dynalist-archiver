let Filter = function (archiver) {
    this.archiver = archiver;

    let filters = [];

    this.add = function (id) {
        filters.push(id);

        return this.archiver;
    };

    this.get = function () {
        return filters;
    };
};

module.exports = Filter;
