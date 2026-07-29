import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const schemes = [
  {
    title: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
    description: 'National mission for financial inclusion to ensure access to financial services like banking, savings/deposit accounts, remittance, credit, insurance, and pension in an affordable manner.',
    category: 'Financial Inclusion',
    state: null,
    officialLink: 'https://pmjdy.gov.in'
  },
  {
    title: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
    description: 'World\'s largest government-funded healthcare program targeting over 50 crore beneficiaries, providing a health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.',
    category: 'Healthcare',
    state: null,
    officialLink: 'https://pmjay.gov.in'
  },
  {
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    description: 'Income support scheme providing ₹6,000 per year in three equal installments to all landholding farmer families.',
    category: 'Agriculture',
    state: null,
    officialLink: 'https://pmkisan.gov.in'
  },
  {
    title: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
    description: 'Enhances livelihood security in rural areas by providing at least 100 days of guaranteed wage employment in a financial year to every household whose adult members volunteer to do unskilled manual work.',
    category: 'Employment & Labor',
    state: null,
    officialLink: 'https://nrega.nic.in'
  },
  {
    title: 'Pradhan Mantri Awas Yojana (PMAY - Urban/Gramin)',
    description: 'Initiative to provide affordable housing to the urban and rural poor with a target of building millions of affordable houses.',
    category: 'Housing',
    state: null,
    officialLink: 'https://pmaymis.gov.in'
  },
  {
    title: 'Sukanya Samriddhi Yojana (SSY)',
    description: 'A government-backed savings scheme targeted at the parents of girl children, encouraging them to build a fund for the future education and marriage expenses of their female child.',
    category: 'Women & Child Development',
    state: null,
    officialLink: 'https://www.nsiindia.gov.in'
  },
  {
    title: 'Atal Pension Yojana (APY)',
    description: 'Pension scheme focused on the unorganized sector workers, guaranteeing a minimum monthly pension between ₹1,000 and ₹5,000 after the age of 60.',
    category: 'Pension',
    state: null,
    officialLink: 'https://npscra.nsdl.co.in/scheme-details.php'
  },
  {
    title: 'Pradhan Mantri Mudra Yojana (PMMY)',
    description: 'Provides loans up to ₹10 lakhs to non-corporate, non-farm small/micro enterprises.',
    category: 'Business & MSME',
    state: null,
    officialLink: 'https://www.mudra.org.in'
  },
  {
    title: 'e-Shram Portal Registration',
    description: 'Creation of a National Database of Unorganized Workers (NDUW) for providing social security benefits to migrant workers, construction workers, and gig workers.',
    category: 'Social Security',
    state: null,
    officialLink: 'https://eshram.gov.in'
  },
  {
    title: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
    description: 'Aims to safeguard the health of women & children by providing free LPG connections to families living below the poverty line (BPL).',
    category: 'Energy & Welfare',
    state: null,
    officialLink: 'https://www.pmuy.gov.in'
  }
];

async function main() {
  console.log('Start seeding ...');
  
  for (const s of schemes) {
    // Check if scheme already exists to prevent duplication on re-runs
    const existingScheme = await prisma.scheme.findFirst({
      where: { title: s.title }
    });

    if (!existingScheme) {
      const createdScheme = await prisma.scheme.create({
        data: s
      });
      console.log(`✅ Created scheme: ${createdScheme.title}`);
    } else {
      console.log(`⏩ Scheme already exists, skipping: ${existingScheme.title}`);
    }
  }
  
  console.log('Seeding finished successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
