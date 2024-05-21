import { typescript } from 'projen';
const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'scripts',
  projenrcTs: true,
  docgen: true,
  prettier: true,
  devDeps: ['@types/jest', '@types/mocha', '@types/aws-lambda'],
  deps: [
    'commander',
    'fs',
    'path',
    'zlib',
    'readline',
    'stream',
    '@aws-sdk/client-s3',
    'aws-lambda',
  ],
  gitIgnoreOptions: {
    ignorePatterns: ['random_objects*.*', 'random_objects*']
  },
  tsconfig: {
    compilerOptions: {
      noUnusedLocals: false,
      noUnusedParameters: false,
    },
  },
  prettierOptions: {
    settings: {
      singleQuote: true,
      insertPragma: true,
    },
  },

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
