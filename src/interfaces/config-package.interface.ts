import { ConfigApi } from "./config-api.interface";

export interface PackageConfig {
    nodeModuleApiDir: string;
    apis: ConfigApi[];
}