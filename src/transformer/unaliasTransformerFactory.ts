import ts from 'typescript';
import { ExternalPath, resolveExternalPath } from './resolveExternalPath';
import { PathAlias, TsConfigPath, extractPathAliases, extractTsConfigPaths } from '../aliases';

/**
 * Options for the unalias transformer.
 */
export type UnaliasTransformOptions = {
    /** Optional callback function called for each TsConfigPath extracted. */
    onTsPath?: (item: TsConfigPath) => void;
    /** Optional callback function called for each PathAlias extracted. */
    onPathAlias?: (item: PathAlias) => void;
    /** Optional callback function called for each resolved path. */
    onResolve?: (item: ExternalPath) => void;
};

/**
 * Creates a TypeScript transformer that resolves aliased import/export paths.
 * @param program - The TypeScript program.
 * @param options - Optional configuration options.
 * @returns A TypeScript transformer factory for unaliasing import/export paths.
 */
export const unaliasTransformerFactory = (
    program: ts.Program,
    options?: UnaliasTransformOptions
): ts.TransformerFactory<ts.SourceFile> => {

    // Extract TypeScript compiler options from the program
    const compilerOptions = program.getCompilerOptions();

    // Extract TypeScript path mappings from compiler options
    const tsConfigPaths = extractTsConfigPaths(compilerOptions, options?.onTsPath);

    // Extract path aliases from TypeScript path mappings
    const aliases = extractPathAliases(tsConfigPaths, options?.onPathAlias);

    // Return the transformer factory function
    return (context: ts.TransformationContext) => {
        return (file: ts.SourceFile): ts.SourceFile => {

            // Visitor function to traverse and transform AST nodes
            const visit: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
                // Handle import declarations
                if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                    const resolved = resolveExternalPath(file.fileName, node.moduleSpecifier.text, aliases!);
                    options?.onResolve?.({ type: 'import', ...resolved });

                    if (resolved.relativeToPath !== node.moduleSpecifier.text) {
                        const newModuleSpecifier = ts.factory.createStringLiteral(resolved.relativeToPath);
                        return ts.factory.updateImportDeclaration(
                            node,
                            node.modifiers,
                            node.importClause,
                            newModuleSpecifier,
                            undefined
                        );
                    }
                }
                // Handle export declarations
                else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                    const resolved = resolveExternalPath(file.fileName, node.moduleSpecifier.text, aliases!);
                    options?.onResolve?.({ type: 'export', ...resolved });

                    if (resolved.relativeToPath !== node.moduleSpecifier.text) {
                        const newModuleSpecifier = ts.factory.createStringLiteral(resolved.relativeToPath);
                        return ts.factory.updateExportDeclaration(
                            node,
                            node.modifiers,
                            node.isTypeOnly,
                            node.exportClause,
                            newModuleSpecifier,
                            undefined
                        );
                    }
                }

                // Visit child nodes
                return ts.visitEachChild(node, visit, context);
            };

            // Visit the source file's root node
            return ts.visitNode(file, visit) as ts.SourceFile;
        };
    };
};
