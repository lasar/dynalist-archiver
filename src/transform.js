let Transform = function (archiver) {
    this.archiver = archiver;

    let transformations = [];

    this.modifyAtTag = function(replacementSymbol) {
        transformations.push(function(item) {
            item.content.replace('@', replacementSymbol);

            return item;
        });

        return this.archiver;
    };

    this.modifyHashTag = function(replacementSymbol) {
        transformations.push(function(item) {
            item.content.replace('#', replacementSymbol);

            return item;
        });

        return this.archiver;
    };

    this.uncheck = function() {
        transformations.push(function(item) {
            item.checked = false;

            return item;
        });

        return this.archiver;
    };

    this.custom = function(fn) {
        transformations.push(fn);

        return this.archiver;
    };

    this.getTransformations = function() {
        return transformations;
    };
};

module.exports = Transform;
