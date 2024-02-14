import ts from 'typescript';
import { resolveExternalPath } from './resolveExternalPath';
import { ExternalPath } from './ExternalPath';
import { PathAlias, fetchAliasPaths } from '../aliases';
import { Logger, defaultLogger } from '../util';


export type UnaliasTransformOptions = {
    level: 'silent' | 'alias' | 'all';
    log: Logger<ExternalPath>;
};

export const unaliasTransformerFactory = (
    program: ts.Program,
    aliases?: PathAlias[] | true | Logger<PathAlias[]>,
    options?: Partial<UnaliasTransformOptions>
): ts.TransformerFactory<ts.SourceFile> => {

    const pathAliases = (!Array.isArray(aliases) ? fetchAliasPaths(aliases) : aliases) as PathAlias[];

    const opts: UnaliasTransformOptions = { level: 'silent', log: defaultLogger, ...(options ?? {}) };


    return (context: ts.TransformationContext) => {

        return (file: ts.SourceFile): ts.SourceFile => {

            const visit: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {

                if (ts.isImportDeclaration(node)
                    && node.moduleSpecifier
                    && ts.isStringLiteral(node.moduleSpecifier)
                ) {
                    const resolved = resolveExternalPath(node.moduleSpecifier.text, file.fileName, pathAliases);

                    if (opts.level === 'all' || (opts.level === 'alias' && resolved.aliased))
                        opts.log({ type: 'import', ...resolved });


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
                    const resolved = resolveExternalPath(node.moduleSpecifier.text, file.fileName, pathAliases);

                    if (opts.level === 'all' || (opts.level === 'alias' && resolved.aliased))
                        opts.log({ type: 'export', ...resolved });

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