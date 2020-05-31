const Client = require('dynalist-js');
const {DateTime} = require("luxon");

let Archiver = function () {
};

Archiver.prototype.options = {
    apiToken: null,
    sourceDocument: null,
    itemFilter: item => item.checked,
    itemTransform: item => item,
    itemSort: (a, b) => a.modified > b.modified ? 1 : -1,
    targetDocument: null,
    targetNode: 'root',
    targetGroup: function (item) {
        return DateTime.fromMillis(item.modified).toISODate();
    },
};

Archiver.prototype.set = function (options) {
    for (let o in options) {
        if (options.hasOwnProperty(o) && this.options.hasOwnProperty(o)) {
            this.options[o] = options[o];
        }
    }
};

Archiver.prototype.run = async function (modifyTarget, modifySource) {
    let result = {
        sourceDocument: null,
        itemsFound: null,
        itemsTransformed: null,
        targetDocument: null,
        targetNodeMap: null,
        existingGroupItems: {},
        groupedItems: {},
        groupItems: null,
        groupItemsResult: null,
        itemsArchived: [],
        itemsArchivedResult: null,
        itemsDeleted: null,
        itemsDeletedResult: null,
    };

    const dyn = new Client(this.options.apiToken);

    result.sourceDocument = await dyn.readDocument(this.options.sourceDocument);

    result.itemsFound = result.sourceDocument.nodes.filter(this.options.itemFilter);

    result.itemsTransformed = result.itemsFound.map(this.options.itemTransform);

    result.targetDocument = await dyn.readDocument(this.options.targetDocument);
    result.targetNodeMap = dyn.util.buildNodeMap(result.targetDocument.nodes);

    // result.groupedItems
    result.itemsTransformed.map(item => {
        const group = this.options.targetGroup(item);

        if (typeof result.groupedItems[group] === 'undefined') {
            result.groupedItems[group] = [];
        }

        result.groupedItems[group].push(item);
    });

    if (typeof result.targetNodeMap.root.children !== 'undefined') {
        result.targetNodeMap.root.children.map(id => {
            result.existingGroupItems[result.targetNodeMap[id].content] = id;
        });
    }

    result.groupItems = Object.keys(result.groupedItems).filter(key => {
        return typeof result.existingGroupItems[key] === 'undefined';
    }).map(key => {
        return {
            action: 'insert',
            parent_id: this.options.targetNode,
            content: key,
        };
    });

    result.groupItemsResult = await dyn.editDocument(this.options.targetDocument, result.groupItems);

    result.groupItemsResult.new_node_ids.map((id, index) => {
        result.existingGroupItems[result.groupItems[index].content] = id;
    });

    Object.keys(result.groupedItems).map(groupKey => {
        result.groupedItems[groupKey].map(item => {
            result.itemsArchived.push({
                action: 'insert',
                parent_id: result.existingGroupItems[groupKey],
                content: item.content,
                note: item.note,
                checked: item.checked,
                checkbox: item.checkbox,
                heading: item.heading,
                color: item.color,
            });
        });
    });

    result.itemsArchivedResult = await dyn.editDocument(this.options.targetDocument, result.itemsArchived);

    // TODO: Add id to result.itemsArchived for logging

    if (modifySource) {
        // TODO delete items from source document
    }

    return result;
};

module.exports = Archiver;
