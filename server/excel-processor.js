import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to process the Excel file
async function processExcelData() {
  try {
    console.log('Processing Excel file...');
    
    // Read the Excel file
    const excelPath = path.join(__dirname, '..', 'attached_assets', 'Whatarethemostrecentposts_471dfc0d-ef0b-43c0-ac7a-87d343f92df4_1_1758652745078.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.error('Excel file not found at:', excelPath);
      return;
    }
    
    const workbook = XLSX.readFile(excelPath);
    const sheetNames = workbook.SheetNames;
    
    console.log('Available sheets:', sheetNames);
    
    // Process each sheet
    const allData = {};
    sheetNames.forEach(sheetName => {
      console.log(`\nProcessing sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log(`Rows in ${sheetName}:`, jsonData.length);
      
      if (jsonData.length > 0) {
        console.log('First few rows:');
        jsonData.slice(0, 5).forEach((row, index) => {
          console.log(`Row ${index}:`, row);
        });
        
        // Check for header row
        if (jsonData.length > 1) {
          const headers = jsonData[0];
          console.log('Headers:', headers);
          
          // Convert to objects with headers
          const objectData = XLSX.utils.sheet_to_json(worksheet);
          console.log('Sample data objects:', objectData.slice(0, 3));
        }
      }
      
      allData[sheetName] = jsonData;
    });
    
    // Save processed data to JSON for analysis
    const outputPath = path.join(__dirname, 'processed-excel-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
    console.log('\nData saved to:', outputPath);
    
    return allData;
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
  }
}

// Run the processor
if (import.meta.url === `file://${process.argv[1]}`) {
  processExcelData();
}

export { processExcelData };