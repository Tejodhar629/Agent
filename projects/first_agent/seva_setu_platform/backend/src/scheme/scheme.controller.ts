import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Query, 
  Param, 
  HttpCode, 
  HttpStatus, 
  Logger, 
  BadRequestException 
} from '@nestjs/common';
import { SchemeService, UserProfileDto, SchemeMatchResult } from './scheme.service';

@Controller('api/v1/schemes')
export class SchemeController {
  private readonly logger = new Logger(SchemeController.name);

  constructor(private readonly schemeService: SchemeService) {}

  /**
   * GET /api/v1/schemes
   * Lists all available government schemes with support for state scope, category, and keyword search filters.
   */
  @Get()
  async getSchemes(
    @Query('category') category?: string,
    @Query('stateScope') stateScope?: string,
    @Query('search') search?: string,
  ): Promise<any[]> {
    this.logger.log('Executing GET /api/v1/schemes endpoint...');
    return this.schemeService.findAll(category, stateScope, search);
  }

  /**
   * GET /api/v1/schemes/scholarships
   * Specialized endpoint for Scheme Finder targeting EDUCATION and Scholarship schemes.
   */
  @Get('scholarships')
  async getScholarships(
    @Query('stateScope') stateScope?: string,
    @Query('search') search?: string,
  ): Promise<any[]> {
    this.logger.log('Executing GET /api/v1/schemes/scholarships endpoint...');
    return this.schemeService.findAll('EDUCATION', stateScope, search);
  }

  /**
   * GET /api/v1/schemes/pensions
   * Specialized endpoint for Pension & Welfare Finder targeting PENSION_WELFARE and senior citizen schemes.
   */
  @Get('pensions')
  async getPensions(
    @Query('stateScope') stateScope?: string,
    @Query('search') search?: string,
  ): Promise<any[]> {
    this.logger.log('Executing GET /api/v1/schemes/pensions endpoint...');
    return this.schemeService.findAll('PENSION_WELFARE', stateScope, search);
  }

  /**
   * GET /api/v1/schemes/:id
   * Retrieves full details, checklists, and rules of a specific welfare scheme.
   */
  @Get(':id')
  async getSchemeById(@Param('id') id: string): Promise<any> {
    this.logger.log(`Executing GET /api/v1/schemes/${id} details endpoint...`);
    return this.schemeService.findOne(id);
  }

  /**
   * POST /api/v1/schemes/matching/:userId
   * Dynamically evaluates active schemes and matches them against user demographic properties.
   * Supports an optional Request Body to run instant calculations without persistent DB entries.
   */
  @Post('matching/:userId')
  @HttpCode(HttpStatus.OK)
  async matchSchemesForUser(
    @Param('userId') userId: string,
    @Body() profileOverride?: Partial<UserProfileDto>,
  ): Promise<SchemeMatchResult[]> {
    this.logger.log(`Executing POST /api/v1/schemes/matching/${userId} calculations...`);
    
    // Construct default standard profile based on overrides or standard defaults
    // In production, this pulls the profile from the UserProfile database table using userId
    const resolvedProfile: UserProfileDto = {
      age: profileOverride?.age ?? 35,
      state: profileOverride?.state ?? 'KARNATAKA',
      annualIncome: profileOverride?.annualIncome ?? 75000,
      gender: profileOverride?.gender ?? 'MALE',
      category: profileOverride?.category ?? 'OBC',
      occupation: profileOverride?.occupation ?? 'Farmer',
      isStudent: profileOverride?.isStudent ?? false,
      isDisable: profileOverride?.isDisable ?? false,
      hasBusiness: profileOverride?.hasBusiness ?? false,
    };

    if (resolvedProfile.age < 0 || resolvedProfile.annualIncome < 0) {
      throw new BadRequestException('Invalid demographic inputs. Age and Annual Income must be non-negative.');
    }

    return this.schemeService.findMatchingSchemes(resolvedProfile);
  }

  /**
   * POST /api/v1/schemes/:id/save
   * Bookmarks/Saves a government scheme to the citizen’s workspace vault.
   */
  @Post(':id/save')
  @HttpCode(HttpStatus.CREATED)
  async saveScheme(
    @Param('id') schemeId: string,
    @Body('userId') userId: string,
  ): Promise<any> {
    this.logger.log(`Executing POST /api/v1/schemes/${schemeId}/save request for user: ${userId}...`);
    if (!userId) {
      throw new BadRequestException('Required parameter "userId" is missing in the request payload.');
    }
    return this.schemeService.saveScheme(userId, schemeId);
  }

  /**
   * DELETE /api/v1/schemes/:id/unsave
   * Removes a government scheme from the citizen's workspace vault.
   */
  @Delete(':id/unsave')
  @HttpCode(HttpStatus.OK)
  async unsaveScheme(
    @Param('id') schemeId: string,
    @Query('userId') userId: string,
  ): Promise<any> {
    this.logger.log(`Executing DELETE /api/v1/schemes/${schemeId}/unsave request for user: ${userId}...`);
    if (!userId) {
      throw new BadRequestException('Required query parameter "userId" is missing.');
    }
    const success = await this.schemeService.unsaveScheme(userId, schemeId);
    return {
      status: 'SUCCESS',
      message: 'Scheme successfully removed from the saved catalog.',
      removed: success
    };
  }
}
