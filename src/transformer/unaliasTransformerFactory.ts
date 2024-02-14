import ts from 'typescript';
import { resolveExternalPath } from './resolveExternalPath';
import { ExternalPath } from './ExternalPath';
import { PathAlias, fetchAliasPaths } from '../aliases';
import { Logger, consoleLogger, silentLogger } from '../util';


export type UnaliasTransformAliasesOptions = {
    from?: PathAlias[] | { searchPath?: string, configPath?: string; };
    log?: boolean | string | Logger<PathAlias[]>;
};

export type UnaliasTransformOptions = {
    aliases: PathAlias[] | boolean | UnaliasTransformAliasesOptions;
    onResolve: boolean | string | Logger<ExternalPath>;
};

const resolveAliases = (options: UnaliasTransformOptions['aliases']): PathAlias[] => {
    let opts: UnaliasTransformAliasesOptions;

    if (Array.isArray(options))
        opts = { from: options };
    else if (typeof options === 'boolean')
        opts = { from: {}, log: options };
    else
        opts = options;

    if (Array.isArray(opts.from))
        return opts.from;
    else if (typeof opts.from === 'boolean')
        return fetchAliasPaths({ log: true });
    else
        return fetchAliasPaths({
            searchPath: opts.from?.searchPath,
            configPath: opts.from?.configPath,
            log: opts.log
        });

};

const resolveOnResolve = (options: UnaliasTransformOptions['onResolve']): Logger<ExternalPath> => {
    return options === true
        ? consoleLogger('unalias.transform:resolve')
        : typeof options === 'string'
            ? consoleLogger(options)
            : typeof options === 'function' ? options : silentLogger();
};

export const unaliasTransformerFactory = (
    program: ts.Program,
    options?: Partial<UnaliasTransformOptions>
): ts.TransformerFactory<ts.SourceFile> => {

    const opts: UnaliasTransformOptions = {
        aliases: false,
        onResolve: false, ...(options ?? {})
    };

    const aliases = resolveAliases(opts.aliases);

    const onResolve = resolveOnResolve(opts.onResolve);

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