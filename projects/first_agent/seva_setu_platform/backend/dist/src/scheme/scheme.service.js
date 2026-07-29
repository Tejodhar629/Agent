"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SchemeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemeService = void 0;
const common_1 = require("@nestjs/common");
let SchemeService = SchemeService_1 = class SchemeService {
    constructor() {
        this.logger = new common_1.Logger(SchemeService_1.name);
        this.prisma = null;
        this.defaultSchemes = [
            {
                id: 'sch_pmkisan_001',
                name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
                description: 'Provides financial assistance of Rs 6,000 per year in three equal installments of Rs 2,000 directly into the bank accounts of small and marginal landholding farmer families across India.',
                category: 'AGRICULTURE',
                ministry: 'Ministry of Agriculture & Farmers Welfare',
                stateScope: 'CENTRAL',
                eligibilityRules: {
                    incomeMax: 300000,
                    isStudent: false,
                    isDisable: false,
                    occupations: ['Farmer', 'Agricultural Worker', 'Cultivator']
                },
                documentChecklist: ['Aadhaar Card', 'Land Holding Record (Khata/Khasra)', 'Active Bank Account', 'Mobile OTP Verification'],
                officialUrl: 'https://pmkisan.gov.in',
                dbtAmount: 6000.00,
                isActive: true
            },
            {
                id: 'sch_sc_scholarship_001',
                name: 'Post-Matric Scholarship Scheme for SC Students',
                description: 'Centrally sponsored scheme providing financial assistance to Scheduled Caste students pursuing post-matriculation or post-secondary courses to complete their higher education.',
                category: 'EDUCATION',
                ministry: 'Ministry of Social Justice and Empowerment',
                stateScope: 'CENTRAL',
                eligibilityRules: {
                    incomeMax: 250000,
                    isStudent: true,
                    category: ['SC', 'ST']
                },
                documentChecklist: ['Caste Certificate', 'Income Certificate', 'Marks Card of Previous Class', 'Fee Receipt of Current Year', 'Aadhaar Card'],
                officialUrl: 'https://scholarships.gov.in',
                dbtAmount: 12000.00,
                isActive: true
            },
            {
                id: 'sch_obc_karnataka_001',
                name: 'Post-Matric Scholarship Scheme for OBC (Karnataka)',
                description: 'State welfare scheme offering complete tuition fee coverage and monthly maintenance allowances to backward class (OBC) students studying inside the State of Karnataka.',
                category: 'EDUCATION',
                ministry: 'Backward Classes Welfare Department, Govt. of Karnataka',
                stateScope: 'KARNATAKA',
                eligibilityRules: {
                    incomeMax: 100000,
                    isStudent: true,
                    category: ['OBC']
                },
                documentChecklist: ['SSP Student ID', 'Income and Caste Certificate (RD Number)', 'Previous Year Marks Card', 'E-Attested College Admission Form'],
                officialUrl: 'https://ssp.postmatric.karnataka.gov.in',
                dbtAmount: 8500.00,
                isActive: true
            },
            {
                id: 'sch_sandhya_suraksha_001',
                name: 'Sandhya Suraksha Scheme (Old Age Pension)',
                description: 'Provides a monthly pension of Rs 1,200 to senior citizens residing in Karnataka who are below the poverty line to ensure social security in their twilight years.',
                category: 'PENSION_WELFARE',
                ministry: 'Social Welfare Department, Govt. of Karnataka',
                stateScope: 'KARNATAKA',
                eligibilityRules: {
                    ageMin: 60,
                    incomeMax: 20000,
                    isStudent: false
                },
                documentChecklist: ['Age Proof Certificate (Aadhaar/Voter ID)', 'BPL Ration Card', 'Income Certificate issued by Tahsildar', 'Bank Passbook Photo Copy'],
                officialUrl: 'https://sevasindhu.karnataka.gov.in',
                dbtAmount: 14400.00,
                isActive: true
            },
            {
                id: 'sch_ign_old_age_001',
                name: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
                description: 'Provides social security pension support to senior citizens belonging to Below Poverty Line (BPL) households across all states of India.',
                category: 'PENSION_WELFARE',
                ministry: 'Ministry of Rural Development',
                stateScope: 'CENTRAL',
                eligibilityRules: {
                    ageMin: 60,
                    incomeMax: 50000,
                    isStudent: false
                },
                documentChecklist: ['Age Proof (Aadhaar or Birth Certificate)', 'BPL Card Copy', 'Address Proof (Voter ID)', 'Bank Passbook Details'],
                officialUrl: 'https://india.gov.in/indira-gandhi-national-old-age-pension-scheme',
                dbtAmount: 4800.00,
                isActive: true
            },
            {
                id: 'sch_mudra_loan_001',
                name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
                description: 'Enables micro and small enterprises to access collateral-free business loans up to Rs 10 Lakhs. Categories include Shishu (up to Rs 50,000), Kishor (up to Rs 5 Lakhs), and Tarun (up to Rs 10 Lakhs).',
                category: 'BUSINESS_MSME',
                ministry: 'Ministry of Finance',
                stateScope: 'CENTRAL',
                eligibilityRules: {
                    ageMin: 18,
                    hasBusiness: true
                },
                documentChecklist: ['MUDRA Application Form', 'Business Registration / Proof of Identity', 'PAN Card', 'Quotations of Machinery/Equipment to be purchased'],
                officialUrl: 'https://www.mudra.org.in',
                dbtAmount: 100000.00,
                isActive: true
            }
        ];
        try {
            const { PrismaClient } = require('@prisma/client');
            this.prisma = new PrismaClient();
            this.logger.log('Prisma database client initialized successfully within SchemeService.');
        }
        catch {
            this.logger.warn('Prisma Client not found or failed to load. Operating in high-fidelity standalone database mock mode.');
        }
    }
    async findAll(category, stateScope, search) {
        this.logger.log(`Fetching schemes (Filters - Category: ${category || 'None'}, State: ${stateScope || 'None'}, Search: ${search || 'None'})...`);
        if (this.prisma) {
            try {
                const whereClause = { isActive: true };
                if (category) {
                    whereClause.category = category.toUpperCase();
                }
                if (stateScope) {
                    whereClause.stateScope = {
                        in: ['CENTRAL', stateScope.toUpperCase()]
                    };
                }
                if (search) {
                    whereClause.OR = [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                        { ministry: { contains: search, mode: 'insensitive' } }
                    ];
                }
                const schemes = await this.prisma.scheme.findMany({
                    where: whereClause,
                    orderBy: { name: 'asc' }
                });
                if (schemes.length > 0) {
                    return schemes;
                }
            }
            catch (error) {
                this.logger.error(`Database query failed in findAll: ${error.message}. Resorting to local dataset.`);
            }
        }
        return this.defaultSchemes.filter(scheme => {
            if (category && scheme.category !== category.toUpperCase())
                return false;
            if (stateScope && scheme.stateScope !== 'CENTRAL' && scheme.stateScope !== stateScope.toUpperCase())
                return false;
            if (search) {
                const lSearch = search.toLowerCase();
                return scheme.name.toLowerCase().includes(lSearch) ||
                    scheme.description.toLowerCase().includes(lSearch) ||
                    scheme.ministry.toLowerCase().includes(lSearch);
            }
            return true;
        });
    }
    async findOne(id) {
        this.logger.log(`Fetching scheme details for ID: ${id}`);
        if (this.prisma) {
            try {
                const scheme = await this.prisma.scheme.findUnique({
                    where: { id }
                });
                if (scheme)
                    return scheme;
            }
            catch (error) {
                this.logger.error(`Database query failed in findOne: ${error.message}`);
            }
        }
        const localScheme = this.defaultSchemes.find(s => s.id === id);
        if (!localScheme) {
            throw new common_1.NotFoundException(`Government scheme with ID "${id}" could not be located.`);
        }
        return localScheme;
    }
    async evaluateEligibility(schemeId, userProfile) {
        const scheme = await this.findOne(schemeId);
        const rules = scheme.eligibilityRules;
        const reasons = [];
        let isEligible = true;
        let satisfiedCount = 0;
        let totalCriteriaEvaluated = 0;
        this.logger.log(`Evaluating eligibility for Scheme: "${scheme.name}" against User Profile...`);
        if (rules.ageMin !== undefined && rules.ageMin !== null) {
            totalCriteriaEvaluated++;
            if (userProfile.age < rules.ageMin) {
                isEligible = false;
                reasons.push(`Minimum age required is ${rules.ageMin} years (user is ${userProfile.age} years old).`);
            }
            else {
                satisfiedCount++;
            }
        }
        if (rules.ageMax !== undefined && rules.ageMax !== null) {
            totalCriteriaEvaluated++;
            if (userProfile.age > rules.ageMax) {
                isEligible = false;
                reasons.push(`Maximum age limit is ${rules.ageMax} years (user is ${userProfile.age} years old).`);
            }
            else {
                satisfiedCount++;
            }
        }
        if (rules.incomeMax !== undefined && rules.incomeMax !== null) {
            totalCriteriaEvaluated++;
            if (userProfile.annualIncome > rules.incomeMax) {
                isEligible = false;
                reasons.push(`Annual income exceeds threshold limit of ₹${rules.incomeMax.toLocaleString('en-IN')} (user income is ₹${userProfile.annualIncome.toLocaleString('en-IN')}).`);
            }
            else {
                satisfiedCount++;
            }
        }
        if (rules.gender && rules.gender.length > 0) {
            totalCriteriaEvaluated++;
            const isGenderMatched = rules.gender.some(g => g.toUpperCase() === 'ALL' || g.toUpperCase() === userProfile.gender.toUpperCase());
            if (!isGenderMatched) {
                isEligible = false;
                reasons.push(`Scheme is restricted to genders: ${rules.gender.join(', ')} (user gender is ${userProfile.gender}).`);
            }
            else {
                satisfiedCount++;
            }
        }
        if (rules.category && rules.category.length > 0) {
            totalCriteriaEvaluated++;
            const isCasteMatched = rules.category.some(c => c.toUpperCase() === userProfile.category.toUpperCase());
            if (!isCasteMatched) {
                isEligible = false;
                reasons.push(`Scheme is targeted for communities: ${rules.category.join(', ')} (user caste is ${userProfile.category}).`);
            }
            else {
                satisfiedCount++;
            }
        }
        if (rules.isStudent !== undefined && rules.isStudent !== null) {
            totalCriteriaEvaluated++;
            if (userProfile.isStudent !== rules.isStudent) {
                isEligible = false;
                reasons.push(rules.isStudent ? 'User must be actively registered as a student.' : 'Active students are ineligible for this benefit.');
            }
            else {
                satisfiedCount++;
            }
        }
        if (rules.isDisable !== undefined && rules.isDisable !== null) {
            totalCriteriaEvaluated++;
            if (userProfile.isDisable !== rules.isDisable) {
                isEligible = false;
                reasons.push(rules.isDisable ? 'User must possess a physical disability certification (PwD).' : 'This scheme is not applicable for physical disability benefits.');
            }
            else {
                satisfiedCount++;
            }
        }
        if (rules.hasBusiness !== undefined && rules.hasBusiness !== null) {
            totalCriteriaEvaluated++;
            if (userProfile.hasBusiness !== rules.hasBusiness) {
                isEligible = false;
                reasons.push(rules.hasBusiness ? 'User must operate a registered MSME or startup business.' : 'Existing business owners are ineligible for this benefit.');
            }
            else {
                satisfiedCount++;
            }
        }
        if (rules.occupations && rules.occupations.length > 0) {
            totalCriteriaEvaluated++;
            const isOccupationMatched = rules.occupations.some(o => o.toLowerCase() === userProfile.occupation.toLowerCase());
            if (!isOccupationMatched) {
                isEligible = false;
                reasons.push(`Scheme requires occupations: ${rules.occupations.join(', ')} (user occupation is ${userProfile.occupation}).`);
            }
            else {
                satisfiedCount++;
            }
        }
        if (scheme.stateScope !== 'CENTRAL') {
            totalCriteriaEvaluated++;
            if (scheme.stateScope.toUpperCase() !== userProfile.state.toUpperCase()) {
                isEligible = false;
                reasons.push(`Scheme is geographically restricted to residents of ${scheme.stateScope} (user resides in ${userProfile.state}).`);
            }
            else {
                satisfiedCount++;
            }
        }
        const matchingScore = totalCriteriaEvaluated > 0
            ? Number((satisfiedCount / totalCriteriaEvaluated).toFixed(2))
            : 1.0;
        if (isEligible) {
            reasons.push('Congratulations! You fulfill all structural eligibility criteria for this government welfare program.');
        }
        return {
            schemeId: scheme.id,
            name: scheme.name,
            description: scheme.description,
            category: scheme.category,
            ministry: scheme.ministry,
            stateScope: scheme.stateScope,
            dbtAmount: scheme.dbtAmount,
            officialUrl: scheme.officialUrl,
            isEligible,
            matchingScore,
            reasons,
            documentChecklist: scheme.documentChecklist || []
        };
    }
    async findMatchingSchemes(userProfile, category) {
        this.logger.log(`Finding matching schemes for profile (Age: ${userProfile.age}, State: ${userProfile.state}, Income: ${userProfile.annualIncome})...`);
        const allActiveSchemes = await this.findAll(category, userProfile.state);
        const results = [];
        for (const scheme of allActiveSchemes) {
            const match = await this.evaluateEligibility(scheme.id, userProfile);
            results.push(match);
        }
        return results.sort((a, b) => {
            if (a.isEligible && !b.isEligible)
                return -1;
            if (!a.isEligible && b.isEligible)
                return 1;
            return b.matchingScore - a.matchingScore;
        });
    }
    async saveScheme(userId, schemeId) {
        this.logger.log(`User ${userId} saving scheme ${schemeId} to saved vaults.`);
        if (this.prisma) {
            try {
                return await this.prisma.userSavedScheme.create({
                    data: {
                        userId,
                        schemeId
                    }
                });
            }
            catch (error) {
                this.logger.error(`Failed to write UserSavedScheme entry: ${error.message}`);
            }
        }
        return {
            status: 'SUCCESS',
            userId,
            schemeId,
            savedAt: new Date().toISOString()
        };
    }
    async unsaveScheme(userId, schemeId) {
        this.logger.log(`User ${userId} removing scheme ${schemeId} from saved vaults.`);
        if (this.prisma) {
            try {
                await this.prisma.userSavedScheme.delete({
                    where: {
                        userId_schemeId: {
                            userId,
                            schemeId
                        }
                    }
                });
                return true;
            }
            catch (error) {
                this.logger.error(`Failed to delete UserSavedScheme entry: ${error.message}`);
            }
        }
        return true;
    }
};
exports.SchemeService = SchemeService;
exports.SchemeService = SchemeService = SchemeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SchemeService);
//# sourceMappingURL=scheme.service.js.map