import ts from 'typescript';
import { getTsConfigPathAliases } from './getTsConfigPathAliases';
import { parseAliases } from './parseAliases';
import { resolveAlias } from './resolveAlias';

export const unaliasTransformerFactory = (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
    const tsAliases = getTsConfigPathAliases();

    const aliases = parseAliases(tsAliases);

    return (context: ts.TransformationContext) => {

        return (file: ts.SourceFile): ts.SourceFile => {

            const visit: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {

                if (ts.isImportDeclaration(node)
                    && node.moduleSpecifier
                    && ts.isStringLiteral(node.moduleSpecifier)
                ) {
                    const newPath = resolveAlias(node.moduleSpecifier.text, file.fileName, aliases);

                    if (newPath !== node.moduleSpecifier.text) {
                        const newModuleSpecifier = ts.factory.createStringLiteral(newPath);

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
                    const newPath = resolveAlias(node.moduleSpecifier.text, file.fileName, aliases);

                    if (newPath !== node.moduleSpecifier.text) {
                        const newModuleSpecifier = ts.factory.createStringLiteral(newPath);

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