import { Controller, Get, Delete, Param, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/v1/dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /api/v1/dashboard/:userId
   * Returns active application tracks, booked experts, consent state, and profile overview.
   */
  @Get(':userId')
  async getDashboardSummary(@Param('userId') userId: string): Promise<any> {
    this.logger.log(`Executing GET /api/v1/dashboard/${userId}...`);
    return this.dashboardService.getCitizenProfileSummary(userId);
  }

  /**
   * DELETE /api/v1/dashboard/:userId/purge
   * Enforces strict compliance with the DPDP Act (2023) Right to Erasure, cascading data deletions.
   */
  @Delete(':userId/purge')
  @HttpCode(HttpStatus.OK)
  async deleteUserData(@Param('userId') userId: string): Promise<any> {
    this.logger.warn(`Executing DELETE /api/v1/dashboard/${userId}/purge...`);
    const success = await this.dashboardService.purgeCitizenPersonalData(userId);
    return {
      status: 'SUCCESS',
      userId,
      purged: success,
      message: 'Citizen profile and PII have been permanently erased from active PostgreSQL and semantic RAG storage blocks.'
    };
  }
}
