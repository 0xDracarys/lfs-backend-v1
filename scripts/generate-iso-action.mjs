// scripts/generate-iso-action.mjs
import path from 'path';
// Assuming these files are compiled to .js in their respective locations if originally .ts
// and that the project's package.json allows for this type of resolution.
// If these are TypeScript files, the GitHub Action would need a TS execution step (e.g., ts-node)
// or they need to be pre-compiled to JS.
// For Node.js ESM, explicit file extensions are often required for relative imports.
import { IsoGenerator } from '../dist_lib/lib/testing/iso-generator.js';
import { DockerService } from '../dist_lib/lib/testing/docker-service.js';

async function main() {
  console.log('Starting ISO generation script (ESM)...');

  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    options[key] = value;
  }

  console.log('Parsed options:', options);

  if (!options.sourcePath || !options.outputPath || !options.label) {
    console.error('Error: Missing required arguments: --sourcePath, --outputPath, --label');
    process.exit(1);
  }

  const sourceDir = path.resolve(options.sourcePath);
  const outputPath = path.resolve(options.outputPath);

  console.log(`Resolved source directory: ${sourceDir}`);
  console.log(`Resolved output path: ${outputPath}`);

  const isoGenerator = new IsoGenerator();

  const dockerService = new DockerService();
  const dockerAvailable = await dockerService.checkDockerAvailability();
  if (!dockerAvailable) {
    console.warn('Warning: DockerService check reported Docker not available. IsoGenerator may fail or use simulation.');
  } else {
    console.log('DockerService reports Docker is available.');
  }

  try {
    console.log(`Attempting to generate ISO for buildId: ${options.buildId || 'N/A'}`);
    console.log(`Using source: ${sourceDir}`);
    console.log(`Outputting to: ${outputPath}`);
    console.log(`ISO Label: ${options.label}`);

    const isoOptions = {
      sourceDir: sourceDir,
      outputPath: outputPath,
      label: options.label,
      bootable: options.bootable !== undefined ? (options.bootable === 'true') : true,
      bootloader: options.bootloader || 'grub',
    };

    console.log('ISO Generation Options:', isoOptions);

    isoGenerator.setUseDocker(true);

    const result = await isoGenerator.generateIso(isoOptions);

    if (result.success) {
      console.log('ISO Generation Successful!');
      console.log('Output:', result.output);
      if (result.logs && result.logs.length > 0) {
        console.log('Last log line:', result.logs[result.logs.length -1]);
      }
    } else {
      console.error('ISO Generation Failed.');
      if (result.logs) {
        result.logs.forEach(log => console.error(log));
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('Unhandled error during ISO generation:', error);
    process.exit(1);
  }
}

main();
