const Archiver = require('./');
const {DateTime} = require("luxon");

const env = require('./test/env');

let archiver = new Archiver();

archiver.set({
    apiToken: env.apiToken,
    // sourceDocument: 'jnu3ZaHjhM2wU04Q9k3MbgGO', // The Work
    sourceDocument: 'Ac5JjZ2-O-uPPfUTvBmVHK07', // 9Folders
    itemFilter: function (item) {
        return item.checked;
    },
    itemTransform: function (item) {
        item.checked = false;
        return item;
    },
    targetDocument: 'Hv-6K5u0Ou3argC0xvDyff7P',
    targetNode: 'root',
    targetGroup: function(item) {
        const dt = DateTime.fromMillis(item.modified);
        return dt.toISODate() + ' ' + dt.toFormat('cccc');
    }
});

archiver.run(true, true).then(function (result) {

    result.sourceDocument = 'omitted';

    console.log(result);
});
