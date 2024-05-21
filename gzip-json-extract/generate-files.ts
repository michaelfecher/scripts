import { promises as fs } from 'fs';
import * as zlib from 'zlib';
import * as path from 'path';
import { Command } from 'commander';
import { promisify } from 'util';

const program = new Command();
const access = promisify(fs.access);
const gzip = promisify(zlib.gzip);

// Helper function to generate a random JSON object
const generateRandomObject = (): Record<string, any> => ({
    id: Math.floor(Math.random() * 100000),
    name: `Name${Math.floor(Math.random() * 1000)}`,
    value: Math.random().toFixed(2),
    timestamp: new Date().toISOString(),
});

// Calculate approximate size of a JSON object
const getObjectSize = (jsonObject: Record<string, any>): number =>
    Buffer.byteLength(JSON.stringify(jsonObject) + '\n', 'utf8');

// Main function to create the file with random JSON objects
const createFileWithRandomJsonObjects = async (filePath: string, targetSize: number, sizeUnit: string, gzipOutput: boolean): Promise<void> => {
    const fileHandle = await fs.open(filePath, 'w');
    let currentSize = 0;
    const sampleObject = generateRandomObject();
    const objectSize = getObjectSize(sampleObject);

    try {
        while (currentSize < targetSize) {
            const jsonObject = generateRandomObject();
            await fileHandle.writeFile(JSON.stringify(jsonObject) + '\n');
            currentSize += objectSize;
        }
        const finalSize = currentSize > targetSize ? currentSize - objectSize : currentSize;
        const finalSizeString = `File size: ${finalSize} ${sizeUnit}\n`;
        await fileHandle.writeFile(finalSizeString);
        console.log(`File created at ${filePath} with approximately ${targetSize} bytes.`);
    } finally {
        await fileHandle.close();
    }

    if (gzipOutput) {
        const fileContent = await fs.readFile(filePath);
        const gzippedContent = await gzip(fileContent);
        const gzippedFilePath = `${filePath}.gz`;
        await fs.writeFile(gzippedFilePath, gzippedContent);
        console.log(`GZipped file created at ${gzippedFilePath}`);
    }
};

// CLI setup
program
    .option('-s, --size <number>', 'target file size')
    .option('-u, --unit <string>', 'unit of size (kB, MB, GB)', /^(kB|MB|GB)$/i)
    .option('-o, --output <string>', 'output file path', 'random_objects')
    .option('-g, --gzip', 'GZIP the output file');

program.parse(process.argv);

const options = program.opts();

// Validate required options
if (!options.size || !options.unit) {
    console.error('Error: --size and --unit options are required');
    process.exit(1);
}

// Convert target size to bytes
let targetSizeInBytes: number;
let sizeUnit: string;
switch (options.unit.toLowerCase()) {
    case 'kb':
        targetSizeInBytes = Number(options.size) * 1024;
        sizeUnit = 'kB';
        break;
    case 'mb':
        targetSizeInBytes = Number(options.size) * 1024 * 1024;
        sizeUnit = 'MB';
        break;
    case 'gb':
        targetSizeInBytes = Number(options.size) * 1024 * 1024 * 1024;
        sizeUnit = 'GB';
        break;
    default:
        console.error('Invalid unit');
        process.exit(1);
}

// Construct the output file path with size and unit in the filename
const baseFileName = path.basename(options.output, path.extname(options.output));
const outputFilePath = path.isAbsolute(options.output) 
    ? path.join(path.dirname(options.output), `${baseFileName}_${options.size}${sizeUnit}${path.extname(options.output)}`)
    : path.join(__dirname, `${baseFileName}_${options.size}${sizeUnit}${path.extname(options.output)}`);

const gzipOutput = options.gzip || false;

// Create the file
createFileWithRandomJsonObjects(outputFilePath, targetSizeInBytes, sizeUnit, gzipOutput).catch(console.error);
