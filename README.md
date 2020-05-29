# dynalist-archiver

## Methods

### Setup

`setup.setApiToken(API_TOKEN)`

`setup.getApiToken()`

### Source

`source.add(DOCUMENT_ID)`

`source.get(DOCUMENT_ID)`

### Filter

`filter.add(SEARCH_STRING)`

`filter.get(SEARCH_STRING)`

### Transform

`transform.modifyAtTag(REPLACEMENT_SYMBOL)`

`transform.modifyHashTag(REPLACEMENT_SYMBOL)`

`transform.uncheck()`

`transform.custom(TRANSFORMATION_FUNCTION)`

`transform.getTransformations()`

### Target

`target.setDocument(DOCUMENT_ID)`

`target.getDocument()`

`target.setNode(NODE_ID)`

`target.getNode()`

`target.addParentItem(ITEM_CONTENT)`

`target.getParentItem()`

### Actions

`run.process()`

`run.dry()`

`run.retrieve()`

`run.archive()`

`run.delete()`

`run.getResults()`
