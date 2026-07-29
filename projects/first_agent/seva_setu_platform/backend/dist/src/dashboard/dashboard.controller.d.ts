import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    private readonly logger;
    constructor(dashboardService: DashboardService);
    getDashboardSummary(userId: string): Promise<any>;
    deleteUserData(userId: string): Promise<any>;
}
