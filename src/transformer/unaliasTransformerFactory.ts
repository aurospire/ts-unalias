import ts from 'typescript';
import { resolveExternalPath } from './resolveExternalPath';
import { ExternalPath } from './ExternalPath';
import { PathAlias, fetchAliasPaths } from '../aliases';
import { Logger, consoleLogger, silentLogger } from '../util';


export type UnaliasTransformOptions = {
    aliases: PathAlias[] | boolean | Logger<PathAlias[]>;
    onResolve: boolean | Logger<ExternalPath>;
};

export const unaliasTransformerFactory = (
    program: ts.Program,
    options?: Partial<UnaliasTransformOptions>
): ts.TransformerFactory<ts.SourceFile> => {

    const opts: UnaliasTransformOptions = { aliases: false, onResolve: false, ...(options ?? {}) };

    const aliases = (!Array.isArray(opts.aliases) ? fetchAliasPaths(opts.aliases) : opts.aliases) as PathAlias[];

    const onResolve = opts.onResolve === true ? consoleLogger('ts-unalias:resolve') : typeof opts.onResolve === 'function' ? opts.onResolve : silentLogger();

    return (context: ts.TransformationContext) => {

        return (file: ts.SourceFile): ts.SourceFile => {

            const visit: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {

                if (ts.isImportDeclaration(node)
                    && node.moduleSpecifier
                    && ts.isStringLiteral(node.moduleSpecifier)
                ) {
                    const resolved = resolveExternalPath(node.moduleSpecifier.text, file.fileName, aliases);

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
                    const resolved = resolveExternalPath(node.moduleSpecifier.text, file.fileName, aliases);

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