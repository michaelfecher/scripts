to create a file with JSON objects per line, run the following:

```
npx ts-node generate-files.ts -s 1 -u GB -g

```

to run the unGZIP process, start one of the scripts via

```
npx ts-node stream-unzip-async.ts -i random_objects_1GB.gz
```