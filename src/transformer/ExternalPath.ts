export type ExternalPath = {
    type?: 'import' | 'export';
    aliased: boolean;
    fromPath: string;
    toPath: string;
    fullToPath: string;
    relativeToPath: string;
};
