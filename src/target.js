let Target = function (archiver) {
    this.archiver = archiver;

    let document = null;
    let node = null;
    let parentItem = false;

    this.setDocument = function (id) {
        document = id;

        return this.archiver;
    };

    this.getDocument = function () {
        return document;
    };

    this.setNode = function (id) {
        node = id;

        return this.archiver;
    };

    this.getNode = function () {
        return node;
    };

    this.addParentItem = function (item) {
        parentItem = item;

        return this.archiver;
    };

    this.getParentItem = function () {
        return parentItem;
    };
};

module.exports = Target;
