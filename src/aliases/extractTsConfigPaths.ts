import ts from 'typescript';

export type TsConfigPath = {
    name: string;
    baseUrl?: string;
    to: string[];
};

export const extractTsConfigPaths = (options: ts.CompilerOptions, onItem?: (item: TsConfigPath) => void): TsConfigPath[] => {
    const baseUrl = options.baseUrl;

    const paths = options.paths ?? {};

    return Object.entries(paths).map(([name, to]) => {
        const result = {
            name,
            baseUrl,
            to: to.length ? to : ['']
        };

        onItem?.(result);

        return result;
    });
};
