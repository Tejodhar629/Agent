import { Scheme } from './scheme.types';
import { SchemeService } from './scheme.service';
export declare class SchemeResolver {
    private readonly schemeService;
    constructor(schemeService: SchemeService);
    searchSchemes(query?: string, state?: string, tags?: string[]): Promise<Scheme[]>;
    getSchemeById(id: string): Promise<Scheme>;
}
