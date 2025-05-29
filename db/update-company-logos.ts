import { db } from './index.js';
import { companies } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Company logo mapping based on the provided list
const companyLogos: Record<string, string> = {
  // Banks and Financial Services
  'Banco de Fomento Angola (BFA)': '/api/logo/bfa',
  'Banco BIC': '/api/logo/banco-bic',
  'Banco Angolano de Investimentos (BAI)': '/api/logo/bai',
  'Banco de Poupança e Crédito (BPC)': '/api/logo/bpc',
  'Global Seguros': '/api/logo/global-seguros',
  
  // Telecommunications
  'Angola Cables': '/api/logo/angola-cables',
  'Movicel': '/api/logo/movicel',
  'Africell Angola': '/api/logo/africell',
  
  // Retail and Commerce
  'Kero Supermercados': '/api/logo/kero',
  'Shoprite Angola': '/api/logo/shoprite',
  'Jumia Angola': '/api/logo/jumia',
  'Nosso Super': '/api/logo/nosso-super',
  'ZAP': '/api/logo/zap',
  
  // Aviation and Transport
  'TAAG Angola Airlines': '/api/logo/taag',
  'Terminal de Contentores de Luanda (TCUL)': '/api/logo/tcul',
  'Macon': '/api/logo/macon',
  
  // Food and Beverages
  'Refriango': '/api/logo/refriango',
  'Fazenda Girassol': '/api/logo/fazenda-girassol',
  'Coca-Cola Angola': '/api/logo/coca-cola',
  
  // Media and Entertainment
  'TV Zimbo': '/api/logo/tv-zimbo',
  'Rádio Nacional de Angola': '/api/logo/rna',
  
  // Energy and Utilities
  'ENSUL': '/api/logo/ensul',
  'Empresa Nacional de Distribuição de Electricidade': '/api/logo/ende',
  'Empresa Pública de Águas de Luanda': '/api/logo/epal',
  'Refina do Lobito': '/api/logo/refina',
  
  // Oil and Gas
  'Eni Angola': '/api/logo/eni',
  'Chevron Angola': '/api/logo/chevron',
  'TotalEnergies Angola': '/api/logo/totalenergies',
  'BP Angola': '/api/logo/bp',
  
  // Mining
  'Endiama': '/api/logo/endiama',
  'Catoca': '/api/logo/catoca',
  
  // Construction and Infrastructure
  'Terminal de Contentores de Luanda': '/api/logo/tcul',
  'Novonor Angola': '/api/logo/novonor',
  'ENSA': '/api/logo/ensa',
  
  // Banks
  'Banco Angolano de Investimentos': '/api/logo/bai',
  'Banco de Poupança e Crédito': '/api/logo/bpc',
  
  // Government and Public Services
  'INAPEN': '/api/logo/inapen',
};

async function updateCompanyLogos() {
  console.log('🔄 Updating company logos...');
  
  try {
    // Get all companies
    const allCompanies = await db.select().from(companies);
    console.log(`Found ${allCompanies.length} companies to update`);
    
    let updatedCount = 0;
    
    for (const company of allCompanies) {
      const logoUrl = companyLogos[company.name];
      
      if (logoUrl && company.logoUrl !== logoUrl) {
        await db
          .update(companies)
          .set({ 
            logoUrl: logoUrl,
            updatedAt: new Date()
          })
          .where(eq(companies.id, company.id));
        
        console.log(`✅ Updated logo for: ${company.name}`);
        updatedCount++;
      } else if (!logoUrl) {
        console.log(`⚠️  No logo mapping found for: ${company.name}`);
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} company logos`);
    
  } catch (error) {
    console.error('❌ Error updating company logos:', error);
    throw error;
  }
}

// Run the update if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateCompanyLogos()
    .then(() => {
      console.log('✅ Company logos update completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Company logos update failed:', error);
      process.exit(1);
    });
}

export { updateCompanyLogos };