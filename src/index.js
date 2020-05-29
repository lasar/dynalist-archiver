const Setup = require('./setup');
const Source = require('./source');
const Filter = require('./filter');
const Transform = require('./transform');
const Target = require('./target');
const Run = require('./run');

let Archiver = function () {
    this.setup = new Setup(this);
    this.source = new Source(this);
    this.filter = new Filter(this);
    this.target = new Target(this);
    this.transform = new Transform(this);
    this.run = new Run(this);
};

module.exports = Archiver;
