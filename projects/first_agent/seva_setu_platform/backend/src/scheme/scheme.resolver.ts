import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Scheme } from './scheme.types';
import { SchemeService } from './scheme.service';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => Scheme)
export class SchemeResolver {
  constructor(private readonly schemeService: SchemeService) {}

  @Query(() => [Scheme], { name: 'searchSchemes' })
  async searchSchemes(
    @Args('query', { type: () => String, nullable: true }) query?: string,
    @Args('state', { type: () => String, nullable: true }) state?: string,
    @Args('tags', { type: () => [String], nullable: true }) tags?: string[],
  ): Promise<Scheme[]> {
    // We use the first tag as 'category' for the backend mapping
    const category = tags && tags.length > 0 ? tags[0] : undefined;
    const backendSchemes = await this.schemeService.findAll(category, state, query);

    return backendSchemes.map((s) => ({
      id: s.id,
      title: s.name,
      description: s.description,
      ministry: s.ministry,
      tags: s.category ? [s.category] : [],
      officialLink: s.officialUrl,
      eligibilityCriteria: JSON.stringify(s.eligibilityRules),
      benefits: s.dbtAmount ? `Financial assistance up to Rs ${s.dbtAmount}` : 'Non-monetary benefits',
      documentsRequired: s.documentChecklist || [],
    }));
  }

  @Query(() => Scheme, { name: 'getSchemeById', nullable: true })
  async getSchemeById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Scheme> {
    try {
      const s = await this.schemeService.findOne(id);
      if (!s) {
        return null;
      }
      return {
        id: s.id,
        title: s.name,
        description: s.description,
        ministry: s.ministry,
        tags: s.category ? [s.category] : [],
        officialLink: s.officialUrl,
        eligibilityCriteria: JSON.stringify(s.eligibilityRules),
        benefits: s.dbtAmount ? `Financial assistance up to Rs ${s.dbtAmount}` : 'Non-monetary benefits',
        documentsRequired: s.documentChecklist || [],
      };
    } catch (error) {
      throw new NotFoundException(`Scheme with id ${id} not found.`);
    }
  }
}
