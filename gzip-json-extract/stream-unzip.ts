import * as fs from 'fs';
import * as zlib from 'zlib';
import * as readline from 'readline';
import * as path from 'path';
import { Command } from 'commander';
import { promisify } from 'util';

const program = new Command();
const access = promisify(fs.access);

const checkFilePath = async (filePath: string): Promise<void> => {
  try {
    await access(filePath, fs.constants.R_OK);
  } catch (err) {
    throw new Error(`Cannot access file at ${filePath}: ${err}`);
  }
};

const readGzipFileLineByLine = async (filePath: string): Promise<void> => {
  console.time('Foo')

  await checkFilePath(filePath);

  const fileStream = fs.createReadStream(filePath);
  const gzipStream = zlib.createGunzip();
  const rl = readline.createInterface({
    input: fileStream.pipe(gzipStream),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    try {
      console.log(line);
    } catch (err) {
      console.error('Failed:', err);
    }
  }
  console.timeEnd('Foo')
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
