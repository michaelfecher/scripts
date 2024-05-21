import * as fs from 'fs';
import * as zlib from 'zlib';
import * as readline from 'readline';
import * as path from 'path';
import { Command } from 'commander';
import { promisify } from 'util';
import { pipeline } from 'stream/promises';

const program = new Command();
const access = promisify(fs.access);

// Function to check if the file exists and is readable
const checkFilePath = async (filePath: string): Promise<void> => {
  try {
    await access(filePath, fs.constants.R_OK);
  } catch (err) {
    throw new Error(`Cannot access file at ${filePath}: ${err}`);
  }
};

// Main function to read a GZIP file line-by-line and print each JSON object
const readGzipFileLineByLine = async (filePath: string): Promise<void> => {
  console.time('Foo');

  await checkFilePath(filePath);

  const fileStream = fs.createReadStream(filePath);
  const gzipStream = zlib.createGunzip();
  const rl = readline.createInterface({
    input: gzipStream,
    crlfDelay: Infinity,
  });

  let errorCount = 0;

  rl.on('line', (line) => {
    try {
      JSON.parse(line);
      // console.log(jsonObject);
    } catch (err) {
      errorCount++;
    }
  });

  await pipeline(fileStream, gzipStream);
  rl.close();

  if (errorCount > 0) {
    console.error(`Failed to parse JSON for ${errorCount} lines`);
  }

  console.timeEnd('Foo');
};

// CLI setup
program.requiredOption('-i, --input <string>', 'input GZIP file path');

program.parse(process.argv);

const options = program.opts();
const inputFilePath = path.isAbsolute(options.input)
  ? options.input
  : path.join(__dirname, options.input);

// Read and process the GZIP file
readGzipFileLineByLine(inputFilePath).catch(console.error);
