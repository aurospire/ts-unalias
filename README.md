# ts-unalias

A TypeScript transformer that rewrites module alias paths in emitted .d.ts files to their relative paths as per `tsconfig.json` `compilerOptions.paths`.

## Installation

You can install `ts-unalias` via npm:

```
npm install ts-unalias
```

## Usage

```typescript
import ts from 'typescript';
import { unaliasTransformerFactory } from 'ts-unalias';

// Create TypeScript program
const program = ts.createProgram([...], {
    /* Compiler options */
});

// Create transformer factory
const transformer = unaliasTransformerFactory(program, {
    /* Options */
});

// Apply transformer to emit process
const emitResult = program.emit(undefined, undefined, undefined, undefined, {
    afterDeclarations: [transformer],
});

// Handle emit result
// ...
```

## Features

- Rewrites module alias paths in emitted `.d.ts` files
- Supports `tsconfig.json` `compilerOptions.paths` configuration

## Types

### `Notifier`

Represents a Notify Function

```typescript
type Notifier<T> = (item: T) => void
```

### `NotifierType`

Represents a Notify Function Type to Generate a Notifier<T>
(string has ${item} placeholder)

```typescript
type NotifierType<T> = boolean | string | Notifier<T>;
```

### `TsConfigPath`

Represents a TypeScript configuration path.

```typescript
type TsConfigPath = {
    name: string;
    to: string[];
    baseUrl?: string;
};
```

### `PathAlias`

Represents a path alias.

```typescript
type PathAlias = {
    name: string;
    full: string;
    to: string;
    regex: RegExp;
};
```

### `ExternalPath`

Represents an external path resolution result.

```typescript
type ExternalPath = {
    type?: 'import' | 'export';
    aliased: boolean;
    fromPath: string;
    toPath: string;
    fullToPath: string;
    relativeToPath: string;
};
```

### `WebpackAlias`

Represents a Webpack alias configuration.

```typescript
type WebpackAlias = {
    name: string;
    to: string;
    resolved: string;
};
```

### `WebpackAliasesOptions`

Options for generating Webpack aliases.

```typescript
type WebpackAliasesOptions = {
    searchPath?: string;
    configName?: string;
    onTsPath?: NotifierType<TsConfigPath>;
    onPathAlias?: NotifierType<PathAlias>;
    onWebpackAlias?: NotifierType<WebpackAlias>;
};
```

### `UnaliasTransformOptions`

Options for the unalias transformer.

```typescript
type UnaliasTransformOptions = {
    onTsPath?: NotifierType<TsConfigPath>;
    onPathAlias?: NotifierType<PathAlias>;
    onExternalPath?: NotifierType<ExternalPath>;
};
```

## Functions

### extractTsConfigPaths

Extracts TypeScript configuration paths.

```typescript
extractTsConfigPaths(
    options: ts.CompilerOptions, 
    onItem?:  NotifierType<TsConfigPath>
): TsConfigPath[]
```

### extractPathAliases

Extracts path aliases from TypeScript configuration paths.
```typescript
extractPathAliases(
    paths: TsConfigPath[], 
    onItem?: NotifierType<PathAlias>
): PathAlias[]
```

### extractWebpackAliases

Extracts Webpack alias configurations from path aliases.

```typescript
extractWebpackAliases(
    aliases: PathAlias[], 
    basePath: string,
    onItem?: NotifierType<WebpackAlias>
): Record<string, string>
```

### getTsCompilerOptions

Gets TypeScript compiler options from a tsconfig file.

```typescript
getTsCompilerOptions(
    searchPath?: string,
    configName?: string
): ts.CompilerOptions
```

### resolveExternalPath

Resolves an external path using provided path aliases.

```typescript
resolveExternalPath(
    fromPath: string,
    toPath: string,
    aliases: PathAlias[]
): ExternalPath
```

### unaliasTransformerFactory

Creates a TypeScript transformer that resolves aliased import/export paths.
```typescript
unaliasTransformerFactory(
    program: ts.Program,
    options?: UnaliasTransformOptions
): ts.TransformerFactory<ts.SourceFile>
```
### webpackAliases

Generates Webpack alias configurations based on TypeScript path mappings.

```typescript
webpackAliases(
    basePath: string,
    options?: WebpackAliasesOptions
): Record<string, string>
```

## Example: Using with Webpack

```typescript
import path from 'path';
import { Configuration } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import { unaliasTransformerFactory, webpackAliases } from 'ts-unalias';

const config: Configuration = {
    entry: './src/index.ts',
    mode: 'production',
    devtool: 'inline-source-map',
    target: 'node',
    externals: [nodeExternals()],
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, '..', '..', 'dist'),
        library: {
            name: 'tester',
            type: 'this'
        },
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ['node_modules'],
        mainFiles: ['index'],
        // Use to auto populate aliases from tsconfig file
        alias: webpackAliases(path.resolve(__dirname, '..', '..'), {
            onTsPath: (item => console.log(item)),
            onPathAlias: (item => console.log(item)),
            onWebpackAlias: (item => console.log(item))
        })
    },
    module: {
        rules: [
            {
                test: /.ts$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        getCustomTransformers: (program: any) => ({
                            // Use to unalias all imports/exports in d.ts files
                            afterDeclarations: [unaliasTransformerFactory(program, {
                                onPathAlias: (item) => console.log(item),
                                onResolve: (item) => console.log(item)
                            })]
                        }),
                    },
                }]
            }
        ]
    }
};

export default config;
```