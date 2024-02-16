import ts from 'typescript';
import { ExternalPath, resolveExternalPath } from './resolveExternalPath';
import { PathAlias, TsConfigPath, extractPathAliases, extractTsConfigPaths } from '../aliases';


export type UnaliasTransformOptions = {
    onTsPath?: (item: TsConfigPath) => void;
    onPathAlias?: (item: PathAlias) => void;
    onResolve?: (item: ExternalPath) => void;
};

export const unaliasTransformerFactory = (
    program: ts.Program,
    options?: UnaliasTransformOptions
): ts.TransformerFactory<ts.SourceFile> => {

    let aliases: PathAlias[] | undefined;

    return (context: ts.TransformationContext) => {
        if (!aliases) {
            const compilerOptions = context.getCompilerOptions();

            const tsConfigPaths = extractTsConfigPaths(compilerOptions, options?.onTsPath);
    
            aliases = extractPathAliases(tsConfigPaths, options?.onPathAlias);
        }

        return (file: ts.SourceFile): ts.SourceFile => {

            const visit: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {

                if (ts.isImportDeclaration(node)
                    && node.moduleSpecifier
                    && ts.isStringLiteral(node.moduleSpecifier)
                ) {
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
                else if (ts.isExportDeclaration(node)
                    && node.moduleSpecifier
                    && ts.isStringLiteral(node.moduleSpecifier)
                ) {
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

                return ts.visitEachChild(node, visit, context);
            };

            return ts.visitNode(file, visit) as ts.SourceFile;
        };
    };
};