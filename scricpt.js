// Site database management
let currentSiteDatabase = [];
let uploadedSiteData = null;
let isUsingUploadedData = false;

// Default site database with comprehensive site information
const defaultSiteDatabase = [
    {
        siteId: 'DL001',
        siteName: 'CP Tower Alpha',
        circle: 'Delhi',
        siteType: 'Macro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'Connaught Place, Block A, New Delhi - 110001, Near Metro Station, Opposite PVR Cinema',
        coordinates: { lat: '28.6304', lng: '77.2177' },
        ipId: 'IP-DL-001',
        bands: 'Band 1, Band 3, Band 40, Band 78',
        sectors: '3 Sectors',
        installDate: '2022-03-15',
        lastMaintenance: '2024-08-20',
        operator: 'Airtel',
        height: '45m',
        power: 'Grid + DG'
    },
    {
        siteId: 'DL002',
        siteName: 'Rohini Hub Beta',
        circle: 'Delhi',
        siteType: 'Macro',
        status: 'active',
        technologies: ['3G', '4G', '5G'],
        address: 'Sector 7, Rohini, New Delhi - 110085, Near Unity Mall, Behind Bus Stand',
        coordinates: { lat: '28.7041', lng: '77.1025' },
        ipId: 'IP-DL-002',
        bands: 'Band 1, Band 3, Band 8, Band 40',
        sectors: '3 Sectors',
        installDate: '2021-11-28',
        lastMaintenance: '2024-09-05',
        operator: 'Jio',
        height: '40m',
        power: 'Grid + Solar'
    },
    {
        siteId: 'MH001',
        siteName: 'Bandra West Central',
        circle: 'Mumbai',
        siteType: 'Macro',
        status: 'maintenance',
        technologies: ['4G'],
        address: 'Hill Road, Bandra West, Mumbai - 400050, Near Bandra Station, Opposite Shoppers Stop',
        coordinates: { lat: '19.0596', lng: '72.8295' },
        ipId: 'IP-MH-001',
        bands: 'Band 1, Band 3, Band 40',
        sectors: '3 Sectors',
        installDate: '2020-07-12',
        lastMaintenance: '2024-09-10',
        operator: 'Vodafone',
        height: '35m',
        power: 'Grid'
    },
    {
        siteId: 'MH002',
        siteName: 'Andheri East Plaza',
        circle: 'Mumbai',
        siteType: 'Small Cell',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'SEEPZ, Andheri East, Mumbai - 400093, Near Metro Station, IT Park Complex',
        coordinates: { lat: '19.1136', lng: '72.8697' },
        ipId: 'IP-MH-002',
        bands: 'Band 40, Band 78',
        sectors: '1 Sector',
        installDate: '2023-01-20',
        lastMaintenance: '2024-07-15',
        operator: 'Airtel',
        height: '20m',
        power: 'Grid'
    },
    {
        siteId: 'BG001',
        siteName: 'Electronic City Hub',
        circle: 'Bangalore',
        siteType: 'Macro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'Phase 1, Electronic City, Bangalore - 560100, Near Infosys Campus, Tech Park Area',
        coordinates: { lat: '12.8456', lng: '77.6603' },
        ipId: 'IP-BG-001',
        bands: 'Band 1, Band 3, Band 40, Band 78',
        sectors: '3 Sectors',
        installDate: '2022-09-10',
        lastMaintenance: '2024-08-25',
        operator: 'Jio',
        height: '50m',
        power: 'Grid + DG'
    },
    {
        siteId: 'BG002',
        siteName: 'Whitefield Junction',
        circle: 'Bangalore',
        siteType: 'Macro',
        status: 'active',
        technologies: ['3G', '4G'],
        address: 'ITPL Main Road, Whitefield, Bangalore - 560066, Near Forum Mall, IT Corridor',
        coordinates: { lat: '12.9698', lng: '77.7500' },
        ipId: 'IP-BG-002',
        bands: 'Band 1, Band 3, Band 40',
        sectors: '3 Sectors',
        installDate: '2021-05-18',
        lastMaintenance: '2024-06-30',
        operator: 'Vodafone',
        height: '42m',
        power: 'Grid'
    },
    {
        siteId: 'CH001',
        siteName: 'OMR Tech Tower',
        circle: 'Chennai',
        siteType: 'Macro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'Old Mahabalipuram Road, Thoraipakkam, Chennai - 600097, Near Sholinganallur, IT Highway',
        coordinates: { lat: '12.9010', lng: '80.2279' },
        ipId: 'IP-CH-001',
        bands: 'Band 1, Band 3, Band 40, Band 78',
        sectors: '3 Sectors',
        installDate: '2022-12-05',
        lastMaintenance: '2024-09-01',
        operator: 'Airtel',
        height: '48m',
        power: 'Grid + Solar'
    },
    {
        siteId: 'KL001',
        siteName: 'Salt Lake Central',
        circle: 'Kolkata',
        siteType: 'Macro',
        status: 'inactive',
        technologies: ['3G', '4G'],
        address: 'Sector V, Salt Lake, Kolkata - 700091, Near City Centre Mall, IT Hub Area',
        coordinates: { lat: '22.5726', lng: '88.3639' },
        ipId: 'IP-KL-001',
        bands: 'Band 1, Band 3',
        sectors: '3 Sectors',
        installDate: '2020-03-22',
        lastMaintenance: '2024-05-10',
        operator: 'Jio',
        height: '38m',
        power: 'Grid'
    },
    {
        siteId: 'HY001',
        siteName: 'HITEC City Node',
        circle: 'Hyderabad',
        siteType: 'Macro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'HITEC City, Madhapur, Hyderabad - 500081, Near Cyber Towers, Financial District',
        coordinates: { lat: '17.4435', lng: '78.3772' },
        ipId: 'IP-HY-001',
        bands: 'Band 1, Band 3, Band 40, Band 78',
        sectors: '3 Sectors',
        installDate: '2023-02-14',
        lastMaintenance: '2024-08-18',
        operator: 'Airtel',
        height: '46m',
        power: 'Grid + DG'
    },
    {
        siteId: 'PN001',
        siteName: 'Hinjewadi IT Park',
        circle: 'Pune',
        siteType: 'Micro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'Phase 1, Hinjewadi IT Park, Pune - 411057, Near Wipro Campus, Rajiv Gandhi Infotech Park',
        coordinates: { lat: '18.5904', lng: '73.7394' },
        ipId: 'IP-PN-001',
        bands: 'Band 40, Band 78',
        sectors: '2 Sectors',
        installDate: '2022-06-30',
        lastMaintenance: '2024-07-20',
        operator: 'Jio',
        height: '25m',
        power: 'Grid'
    }
];

// Initialize current database with default data
currentSiteDatabase = [...defaultSiteDatabase];

// File upload and processing functions
function handleSiteFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showProcessingIndicator();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            if (file.name.endsWith('.csv')) {
                processCsvFile(e.target.result, file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                processExcelFile(e.target.result, file);
            } else {
                showAlert('Please upload a valid Excel (.xlsx, .xls) or CSV file.', 'error');
                hideProcessingIndicator();
                return;
            }
        } catch (error) {
            console.error('File processing error:', error);
            showAlert('Error processing file. Please check the file format.', 'error');
            hideProcessingIndicator();
        }
    };

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function processCsvFile(csvText, file) {
    // Using Papa Parse (loaded via CDN)
    Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function(results) {
            processUploadedData(results.data, file);
        },
        error: function(error) {
            showAlert('Error parsing CSV file: ' + error.message, 'error');
            hideProcessingIndicator();
        }
    });
}

function processExcelFile(arrayBuffer, file) {
    // Using SheetJS (loaded via CDN)
    try {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false
        });

        // Convert to object format
        if (jsonData.length > 1) {
            const headers = jsonData[0].map(h => String(h).trim());
            const dataRows = jsonData.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });
                return obj;
            });
            
            processUploadedData(dataRows, file);
        } else {
            showAlert('Excel file appears to be empty or invalid.', 'error');
            hideProcessingIndicator();
        }
    } catch (error) {
        console.error('Excel processing error:', error);
        showAlert('Error processing Excel file. Please check the file format.', 'error');
        hideProcessingIndicator();
    }
}

function processUploadedData(data, file) {
    try {
        // Map uploaded data to our site database format
        const mappedData = data.map((row, index) => {
            // Clean headers by removing whitespace and converting to lowercase for matching
            const cleanRow = {};
            Object.keys(row).forEach(key => {
                const cleanKey = key.toString().trim().toLowerCase();
                cleanRow[cleanKey] = String(row[key] || '').trim();
            });

            // Map common field variations to our standard format
            const siteData = {
                siteId: cleanRow['site id'] || cleanRow['siteid'] || cleanRow['site_id'] || cleanRow['id'] || `SITE_${index + 1}`,
                siteName: cleanRow['site name'] || cleanRow['sitename'] || cleanRow['site_name'] || cleanRow['name'] || 'Unknown Site',
                circle: cleanRow['circle'] || cleanRow['location'] || cleanRow['city'] || cleanRow['region'] || 'Unknown',
                siteType: cleanRow['site type'] || cleanRow['sitetype'] || cleanRow['type'] || 'Macro',
                status: (cleanRow['status'] || cleanRow['site status'] || 'active').toLowerCase(),
                technologies: parseTechnologies(cleanRow['technology'] || cleanRow['technologies'] || cleanRow['tech'] || '4G'),
                address: cleanRow['address'] || cleanRow['location address'] || cleanRow['site address'] || 'Address not provided',
                coordinates: {
                    lat: cleanRow['latitude'] || cleanRow['lat'] || '0.0000',
                    lng: cleanRow['longitude'] || cleanRow['lng'] || cleanRow['lon'] || '0.0000'
                },
                ipId: cleanRow['ip id'] || cleanRow['ipid'] || cleanRow['ip_id'] || 'N/A',
                bands: cleanRow['bands'] || cleanRow['frequency'] || cleanRow['band'] || 'N/A',
                sectors: cleanRow['sectors'] || cleanRow['sector'] || cleanRow['sector count'] || 'N/A',
                installDate: cleanRow['install date'] || cleanRow['installation date'] || cleanRow['date installed'] || '2022-01-01',
                lastMaintenance: cleanRow['last maintenance'] || cleanRow['maintenance date'] || cleanRow['last maintained'] || '2024-01-01',
                operator: cleanRow['operator'] || cleanRow['carrier'] || cleanRow['network'] || 'Unknown',
                height: cleanRow['height'] || cleanRow['tower height'] || cleanRow['antenna height'] || 'N/A',
                power: cleanRow['power'] || cleanRow['power source'] || cleanRow['power supply'] || 'Grid'
            };

            return siteData;
        });

        // Filter out invalid entries
        const validData = mappedData.filter(site => 
            site.siteId && 
            site.siteName && 
            site.siteId !== 'Unknown' && 
            site.siteName !== 'Unknown Site'
        );

        if (validData.length === 0) {
            showAlert('No valid site data found in the uploaded file. Please check the file format and column headers.', 'error');
            hideProcessingIndicator();
            return;
        }

        // Update the current database
        uploadedSiteData = validData