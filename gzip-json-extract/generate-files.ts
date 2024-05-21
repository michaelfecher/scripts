import { promises as fs } from 'fs';
import * as path from 'path';
import { Command } from 'commander';

const program = new Command();

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
const createFileWithRandomJsonObjects = async (filePath: string, targetSize: number): Promise<void> => {
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
        console.log(`File created at ${filePath} with approximately ${targetSize} bytes.`);
    } finally {
        await fileHandle.close();
    }
};

// CLI setup
program
    .requiredOption('-s, --size <number>', 'target file size')
    .requiredOption('-u, --unit <string>', 'unit of size (kB, MB, GB)', /^(kB|MB|GB)$/i)
    .option('-o, --output <string>', 'output file path', 'random_objects.json');

program.parse(process.argv);

const options = program.opts();

// Convert target size to bytes
let targetSizeInBytes: number;
switch (options.unit.toLowerCase()) {
    case 'kb':
        targetSizeInBytes = Number(options.size) * 1024;
        break;
    case 'mb':
        targetSizeInBytes = Number(options.size) * 1024 * 1024;
        break;
    case 'gb':
        targetSizeInBytes = Number(options.size) * 1024 * 1024 * 1024;
        break;
    default:
        throw new Error('Invalid unit');
}

const outputFilePath = path.isAbsolute(options.output) ? options.output : path.join(__dirname, options.output);

// Create the file
createFileWithRandomJsonObjects(outputFilePath, targetSizeInBytes).catch(console.error);
