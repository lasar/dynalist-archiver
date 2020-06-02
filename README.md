# dynalist-archiver

This Node.JS module lets you set up a customizable archiving tool for your [Dynalist](https://dynalist.io) documents.

It is based on the [dynalist-js](https://github.com/lasar/dynalist-js) module.

To use it, you must write some Javascript to load and configure the archiver.

A reusable example implementation is in the works. 

## What it does

The module is pretty configurable, but the basic operation when running it is always the same:

- Fetch items from a source document that match the desired criteria (for example "all checked items")
- Optionally transform the items for archiving purposes (uncheck item, add metadata, remove color labels, ...)
- Group items (by date, tag, anything)
- Write groups to target document (unless they already exist)
- Write matched items to these groups
- Delete items from source document

## Installation

```bash
npm install --save dynalist-archiver
```

Or you can clone the repository.

## General Usage

```js
const Archiver = require('dynalist-archiver');

archiver.set({
    apiToken: process.env.DYNALIST_API_TOKEN,
    modifyTarget: true,
    modifySource: true,
    sourceDocument: 'Bc5KjZ1wOhnPofUtvBnVwKat',
    targetDocument: 'Hvz6q5ueOu3qrgw0xdDyfeef',
});

archiver.run().then(function (result) {
    if(result.error) {
        console.log('Error:', result.error);
    } else {
        console.log('Archived', result.itemsArchived.length, 'items');
        console.log('Deleted', result.itemsDeleted.length, 'items');
    }
});
```

Running this will take all "checked" items in the source document, write them to the archive document and then delete them from the source document.  

## Example implementation

I am currently preparing a separate repository which contains a working implementation of the above code.

## Methods

Create instance:  
`let archiver = new Archiver();`

Set options:  
`archiver.set({ /* options go here */ })`
This method can be called multiple times with any subset of options.
Returns the object itself, so calls can be chained.

Do the work:
`archiver.run()`
Returns a promise with resolves to the `result` object which contains a lot of data used during the process.

## Options

These options can be passed to the `set()` method:

`apiToken`: **REQUIRED** Dynalist API token which can be generated/fetched at https://dynalist.io/developer when you are logged into your Dynalist account.

`sourceDocument`: **REQUIRED** ID of the document from which you want to archive items.

At this time only a simple document can be used as the source. If you want to archive items from multiple documents you must run the archiver multiple times.

`modifySource`: Boolean, defaults to false. MUST BE SET TO TRUE to allow dynalist-archiver to delete archived items.

`itemFilter`: Function, defaults to simple case `item => item.checked`. Meaning that all items with the "checked" status (with or without checkbox) will be archived

`itemTransform`: Function, defaults to "no changes". This function will be called for every item (node) that is to be archived. The item can be modified here to your heart's content. More on that below.

`itemSort`: Function, defaults to sorting based on modified date. This will sort all items to be archived during the current run.

`targetDocument`: **REQUIRED**. ID of the document where items should be written to.

`targetNode`: Target node ID. Defaults to `root`. Only needs to be set when archived items should be placed under a sub-item.

`modifyTarget`: Boolean, defaults to false. MUST BE SET TO TRUE to allow dynalist-archiver to write archived items to the target document.

`targetGroup`: Function, defaults to a function that generates a `YYYY-MM-DD` formatted date based on the item's modified date. 

`targetGroupOrder`: Integer. -1 to add new groups at the bottom of the document; 0 to add new groups at the top. Defaults to -1.

`targetItemOrder`: Integer. -1 to add new items at the bottom; 0 to add new items at the top. Defaults to -1.

`maximumItemsPerRun`: Integer, defaults to 50. This is the maximum number of items to be considered for archiving. This limit is here to protect us from hitting the API
s rate limits explained here: <https://apidocs.dynalist.io/#rate-limit-policy-5>. Theoretically for a one-time execution a value up to 500 should be OK. If you have more than 50 archivable items only very occasionally, then you might just go and run the archiver twice. 

## Examples & Notes

### Why `modifySource` and `modifyTarget`

These options are a safety net to prevent accidental modifications to your documents. When both are set to false (as is the default) then a "dry run" is performed. The `result` object will contain information about what items would have been archived. 

When only `modifyTarget` is true, then all found items will be written to the archive document, but they will not be deleted from the source document. This is good for testing, but it also means that all archivable items will be written to the archive every single time, resulting in multiple copies. This is by design since there is no surefire way to prevent duplicates.

My advice is to leave out both options until your basic code runs without errors and you are confident that it should do something useful.  
Then set `modifyTarget` to true and see what ends up in the archive document. It's best to use an empty document for the archive so you can empty it between test runs.  
When the results in the archive file are satisfactory, set `modifySource` to true.

Of course you should also create backups before running this code to prevent data loss due to misconfiguration or bugs in the dynalist-archiver module.

### Filtering items with `itemFilter`

Every(!) node in the source document will be passed to this function. When it returns true the items is to be archived; if it returns false, the item is to be left alone.

The API docs document what details there are for every "node": <https://apidocs.dynalist.io/#get-content-of-a-document>.

Archive all items that are "checked" (this is the default):
```js
function(item) {
    return item.checked
}

// or shorter:
item => item.checked
```

Archive all items with a `@done` tag (or any other string in the content):

```js
function(item) {
    return item.content.match(/@done/);
}
```

The function is actually called with two parameters: The item and also the source document data returned from the API. This is useful if you need to take other data into account to determine "archivability"; for instance you might only want to archive items if they do not contain unchecked sub-items.

### Modifying archived items with `itemTransform`

Once archivable items are found, they can be transformed so the archives are nicer to read.

Mark all archived items as "unchecked" (otherwise all items will be striketrough-styled, which is not easy to read):

```js
function(item) {
    item.checked = false;

    return item;
}
```

Other useful things here might be to modify tags and due dates so items do not show up in search results for these things.

### Grouping items with `targetGroup`

The archiver will always create "groups" to categorize archived items. This can currently not be disabled entirely.

The most obvious use case is to group all items based on the date of their completion. This is the default function that is used when you don't override it:

```js
function (item) {
    // Returns a date formatted as YYYY-MM-DD:
    return new Date(item.modified).toISOString().replace(/T.*/, '');
}
```

This function is executed for every single archived item. All items where the function's output is identical will be grouped together. This also works when the archiver is run multiple times.

You can modify the output to create monthly groupings or by hour; or you could inspect the item's content and add specific tags to the group.

I am currently assuming that the item dates are in the UTC timezone. If you live in a far-away timezone your date-based groups may not align correctly with the "wall-clock" time/date at which you archived it. I have not worked this out yet.

## Automation

On a *nix based server (or desktop) you can simply set up a cronjob to automatically archive items at desired intervals. 

You can also use "GitHub Actions" to run arbitrary code at defined intervals. I am working on an example for that.

## Custom handling

If you want to do something entirely different than what this module is designed for, there are some approaches:

Set `modifySource` and `modifyTarget` to `false`, then use data in the result object to do whatever you want to do. Or set `modifySource` to true so archived items will be deleted without actually using an archive document (you still have to supply a valid document ID, but it will not be modified.)

Look at the `run` method and Pick out the things you need, overwrite/remove/add everything else.

Or just use dynalist-js and write your own code. Fetching the right items is not that complicated.

## Future Features

Use a search string as `itemFilter` instead of a function. `has:checkbox AND is:completed` is more concise easier to write than the corresponding function code. 

Multiple group levels to allow for archiving items in a `YEAR -> MONTH -> DAY` structure, or perhaps by date and then context, and so on. 

Skip grouping entirely by setting `targetGroup` to false. This should be easy to implement if anybody needs this.

Originally I wanted to write this as a shell script, but configuration would be a lot harder. But I might still write a CLI wrapper.
