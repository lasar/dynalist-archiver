let Run = function (archiver) {
    this.archiver = archiver;

    this.retrieve = function() {
        return this.archiver;
    };

    this.archive = function() {
        return this.archiver;
    };

    this.delete = function() {
        return this.archiver;
    };

    this.process = function() {
        // Do it the roundabout way to exactly mimic how manual calls would happen.
        return this.archiver
            .run.retrieve()
            .run.archive()
            .run.delete();
    };
};

module.exports = Run;
