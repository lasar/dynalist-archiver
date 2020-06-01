# dynalist-archiver

## Methods

`set(OPTIONS)`

`run()`

## Options

`apiToken`: REQUIRED. Dynalist API token

`modifySource`: Boolean, defaults to false.

`sourceDocument`: REQUIRED. Source document ID

`itemFilter`: Function. Defaults to simple case `item => item.checked`

`itemTransform`: Function. Defaults to noop function

`itemSort`: Function. Defaults to sorting based on modified date

`modifyTarget`: Boolean, defaults to false. 

`targetDocument`: REQUIRED. Target document ID.

`targetNode`: Target node ID. Defaults to `root`.

`targetGroup`: Function. Defaults to function that generates a `YYYY-MM-DD` formatted date

`targetGroupOrder`: Integer. -1 to add new groups at the bottom; 0 to add new groups at the top. Defaults to -1.

`targetItemOrder`: Integer. -1 to add new items at the bottom; 0 to add new items at the top. Defaults to -1.

## Examples
