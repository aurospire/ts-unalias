import ts from 'typescript';
import { resolveExternalPath } from './resolveExternalPath';
import { ExternalPath } from './ExternalPath';
import { PathAlias, fetchAliasPaths } from '../aliases';

export type UnaliasTransformAliasesOptions = {
    from?: PathAlias[];

};

export type UnaliasTransformOptions = {
    aliases?: PathAlias[] | { searchPath?: string, configPath?: string; };
    onPath?: (item: PathAlias) => void;
    onResolve?: (item: ExternalPath) => void;
};

export const unaliasTransformerFactory = (
    program: ts.Program,
    options?: Partial<UnaliasTransformOptions>
): ts.TransformerFactory<ts.SourceFile> => {
    return (context: ts.TransformationContext) => {

        return (file: ts.SourceFile): ts.SourceFile => {

            const visit: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {

                if (ts.isImportDeclaration(node)
                    && node.moduleSpecifier
                    && ts.isStringLiteral(node.moduleSpecifier)
                ) {
                    const resolved = resolveExternalPath(file.fileName, node.moduleSpecifier.text, aliases);

                    onResolve({ type: 'import', ...resolved });

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
                    const resolved = resolveExternalPath(file.fileName, node.moduleSpecifier.text, aliases);

                    onResolve({ type: 'export', ...resolved });

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