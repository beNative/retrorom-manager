export { };

declare global {
    interface Window {
        electron: {
            selectFolder: () => Promise<string | null>;
            scanRoms: (path: string) => Promise<any>;
            fixIssues: (args: any) => Promise<any>;
            minimize: () => Promise<void>;
            maximize: () => Promise<void>;
            close: () => Promise<void>;
            getSettings: () => Promise<any>;
            getDocContent: (filename: string) => Promise<string>;
            saveSetting: (key: string, value: any) => Promise<void>;
            findDuplicates: (systems: any[]) => Promise<Record<string, any[]>>;
            deleteFiles: (filePaths: string[]) => Promise<{ deleted: string[], failed: string[] }>;
            checkBios: (basePath: string) => Promise<any[]>;
        };
    }
}
