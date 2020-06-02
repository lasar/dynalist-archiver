const Client = require('dynalist-js');

let Archiver = function () {
};

Archiver.prototype.options = {
    apiToken: null,
    sourceDocument: null,
    modifySource: false,
    itemFilter: item => item.checked,
    itemTransform: item => item,
    itemSort: (a, b) => a.modified > b.modified ? 1 : -1,
    targetDocument: null,
    targetNode: 'root',
    modifyTarget: false,
    targetGroup: function (item) {
        // YYYY-MM-DD
        return new Date(item.modified).toISOString().replace(/T.*/, '');
    },
    targetGroupOrder: -1,
    targetItemOrder: -1,
    maximumItemsPerRun: 50,
};

Archiver.prototype.result = {
    sourceDocument: null,
    itemsTransformed: null,
    targetDocument: null,
    targetNodeMap: null,
    groupItems: {},
    itemsGrouped: null,
    itemsArchived: [],
    itemsDeleted: null,
    error: null,
    success: null,
};

Archiver.prototype.resultTemplate = {...Archiver.prototype.result};

Archiver.prototype.dyn = null;

Archiver.prototype.set = function (options) {
    for (let o in options) {
        if (options.hasOwnProperty(o) && this.options.hasOwnProperty(o)) {
            this.options[o] = options[o];
        }
    }

    return this;
};

Archiver.prototype.reset = function () {
    this.result = {...this.resultTemplate};

    return this;
};

Archiver.prototype.run = async function () {
    // Reset result
    this.reset();

    // (Re-)Set up client
    this.dyn = new Client(this.options.apiToken);

    if (!this.run_verifyOptions()) {
        return this.result;
    }

    if (!await this.run_getSource()) {
        return this.result;
    }

    if (!await this.run_getTarget()) {
        return this.result;
    }

    if (!await this.run_groupItems()) {
        return this.result;
    }

    if (!await this.run_archiveItems()) {
        return this.result;
    }

    if (!await this.run_deleteItems()) {
        return this.result;
    }

    this.result.success = true;

    // Done
    return this.result;
};

Archiver.prototype.run_verifyOptions = function () {
    if (!this.options.apiToken) {
        this.result.error = {_msg: 'apiToken is required'};
        this.result.success = false;

        return false;
    }

    if (!this.options.sourceDocument) {
        this.result.error = {msg: 'sourceDocument is required'};
        this.result.success = false;

        return false;
    }

    if (!this.options.targetDocument) {
        this.result.error = {msg: 'targetDocument is required'};
        this.result.success = false;

        return false;
    }

    // Everything seems all right
    return true;
};

Archiver.prototype.run_getSource = async function () {
    this.result.sourceDocument = await this.dyn.readDocument(this.options.sourceDocument);

    if (!this.result.sourceDocument._success) {
        this.result.error = this.result.sourceDocument;
        this.result.success = false;
        return false;
    }

    // Extract, sort and transform archivable items
    this.result.itemsTransformed = this.result.sourceDocument.nodes.filter(this.options.itemFilter).sort(this.options.itemSort).slice(0, this.options.maximumItemsPerRun).map(item => {
        return this.options.itemTransform(item, this.result);
    });

    return true;
};

Archiver.prototype.run_getTarget = async function () {
    this.result.targetDocument = await this.dyn.readDocument(this.options.targetDocument);

    if (!this.result.targetDocument._success) {
        this.result.error = this.result.targetDocument;
        this.result.success = false;
        return false;
    }

    this.result.targetNodeMap = this.dyn.util.buildNodeMap(this.result.targetDocument.nodes);

    return true;
};

Archiver.prototype.run_groupItems = async function () {
    let newGroups = [];

    // Step 1: First pass: generate group name and determine which nodes need to be created
    this.result.itemsGrouped = this.result.itemsTransformed.map(item => {
        // Add group name to item. Will be used in second loop to add parent_id
        item._groupName = this.options.targetGroup(item);

        // But first we collect all the group nodes from existing nodes and create new ones as needed

        // If group node is not in "cache" yet, …
        if (typeof this.result.groupItems[item._groupName] === 'undefined') {
            // …find it in target document…
            const existingGroupNode = this.run__findGroupNode(item._groupName);

            if (existingGroupNode) {
                this.result.groupItems[item._groupName] = existingGroupNode;
            } else {
                // Add to newGroups for creation
                newGroups[this.options.targetGroupOrder === -1 ? 'unshift' : 'push']({
                    action: 'insert',
                    parent_id: this.options.targetNode,
                    content: item._groupName,
                    index: this.options.targetGroupOrder,
                });

                this.result.groupItems[item._groupName] = null;
            }
        }

        return item;
    });

    // Step 2: Create group nodes and add to "cache"
    // if !modifyTarget, the group cache will contain "null" for all new items. So it goes.
    if (this.options.modifyTarget) {
        const groupResponse = await this.dyn.editDocument(this.options.targetDocument, newGroups);

        if (!groupResponse._success) {
            this.result.error = groupResponse;
            this.result.success = false;
            return false;
        }

        newGroups.map((newGroup, idx) => {
            this.result.groupItems[newGroup.content] = groupResponse.new_node_ids[idx];
        });
    }

    // Step 3: Second pass: Add parent_id to all items
    this.result.itemsGrouped = this.result.itemsGrouped.map(item => {
        item.parent_id = this.result.groupItems[item._groupName];

        delete item._groupName;

        return item;
    });

    return true;
};

Archiver.prototype.run__findGroupNode = function (groupName) {
    const targetNode = this.result.targetNodeMap[this.options.targetNode];

    if (!targetNode.children) {
        return false;
    }

    let foundNode = false;

    targetNode.children.map(id => {
        if (this.result.targetNodeMap[id].content === groupName) {
            foundNode = id;
        }
    });

    return foundNode;
};

Archiver.prototype.run_archiveItems = async function () {
    // Create new insertion things for all items
    this.result.itemsGrouped.map(item => {
        this.result.itemsArchived[this.options.targetItemOrder === -1 ? 'unshift' : 'push']({
            action: 'insert',
            index: this.options.targetItemOrder,
            // Group node ID was set in run_groupItems
            parent_id: item.parent_id,
            // Copy across all content attributes
            content: item.content,
            note: item.note,
            checked: item.checked,
            checkbox: item.checkbox,
            heading: item.heading,
            color: item.color,
        });
    });

    if (this.options.modifyTarget) {
        // Insert
        const archiveResponse = await this.dyn.editDocument(this.options.targetDocument, this.result.itemsArchived);

        if (!archiveResponse._success) {
            this.result.error = archiveResponse;
            this.result.success = false;
            return false;
        }

        // Add IDs back to itemsArchived
        this.result.itemsArchived.map((newItem, idx) => {
            this.result.itemsArchived[idx].id = archiveResponse.new_node_ids[idx];
        });
    } else {
        // Simply set id to null
        this.result.itemsArchived.map((newItem, idx) => {
            this.result.itemsArchived[idx].id = null;
        });
    }

    return true;
};

Archiver.prototype.run_deleteItems = async function () {
    if (this.options.modifySource) {
        this.result.itemsDeleted = this.result.itemsGrouped.map(item => {
            return {
                action: 'delete',
                node_id: item.id
            };
        });

        // Delete
        const deleteResponse = await this.dyn.editDocument(this.options.sourceDocument, this.result.itemsDeleted);

        if (!deleteResponse._success) {
            this.result.error = deleteResponse;
            this.result.success = false;
            return false;
        }
    }

    return true;
};

module.exports = Archiver;
