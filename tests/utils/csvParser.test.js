import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseCSV, fetchAndParseCSV } from '../../src/utils/csvParser.js';

// Mock the errorHandler.js module to capture displayAppError calls
// This mock needs to be at the top level so it's active when csvParser.js imports it.
vi.mock('../../src/utils/errorHandler.js', () => ({
    displayAppError: vi.fn(),
}));

// Import the mocked displayAppError for assertions
import { displayAppError } from '../../src/utils/errorHandler.js';

describe('CSV Parser - parseCSV', () => {
    beforeEach(() => {
        // Reset the mock before each test to clear previous call counts
        displayAppError.mockClear();
    });

    it('parses valid CSV data', () => {
        const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,Test Coin,2000,10,900,https://example.com`;

        const { data, errors } = parseCSV(csv);

        expect(errors).toHaveLength(0);
        expect(data).toHaveLength(1);
        expect(data[0].country).toBe('USA');
        expect(data[0].grossWeight).toBe(10);
        expect(data[0].purity).toBe(900);
        expect(data[0].numistaUrl).toBe('https://example.com');
    });

    it('handles quoted fields with commas', () => {
        const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,"Test, Comma",2000,10,900,https://example.com`;

        const { data } = parseCSV(csv);
        expect(data[0].name).toBe('Test, Comma');
    });

    it('handles quoted fields with escaped quotes', () => {
        const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,"Test ""Quote""",2000,10,900,https://example.com`;

        const { data } = parseCSV(csv);
        expect(data[0].name).toBe('Test "Quote"');
    });

    it('handles empty CSV or headers only', () => {
        const emptyCsv = '';
        const { data: data1, errors: errors1 } = parseCSV(emptyCsv);
        expect(data1).toHaveLength(0);
        expect(errors1).toContain("CSV file is empty or only contains headers.");

        const headersOnlyCsv = 'country,name,date,grossWeight,purity,numistaUrl';
        const { data: data2, errors: errors2 } = parseCSV(headersOnlyCsv);
        expect(data2).toHaveLength(0);
        expect(errors2).toContain("CSV file is empty or only contains headers.");
    });

    it('detects missing required headers', () => {
        const csv = `country,name,date,grossWeight,numistaUrl
USA,Test Coin,2000,10,https://example.com`; // 'purity' is missing

        const { data, errors } = parseCSV(csv);
        expect(data).toHaveLength(0);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('Missing required headers in CSV: purity');
    });

    // CORRECTED: Test for skipping empty lines - removed malformed URLs
    it('skips empty lines', () => {
        const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,Coin1,2000,10,900,
            
USA,Coin2,2000,10,900,`; // numistaUrl is now empty string

        const { data, errors } = parseCSV(csv);

        // console.log('--- DEBUG: skips empty lines test ---');
        // console.log('Errors array contents:', errors);
        // console.log('Data array contents:', data);
        // console.log('Errors length:', errors.length);
        // console.log('Data length:', data.length);
        // console.log('--- END DEBUG ---');

        expect(errors).toHaveLength(0); // Now this should pass
        expect(data).toHaveLength(2);
        expect(data[0].name).toBe('Coin1');
        expect(data[1].name).toBe('Coin2');
    });

    it('detects and skips excessively long lines', () => {
        const veryLongLine = 'a'.repeat(10001); // MAX_LINE_LENGTH is 10000
        const csv = `country,name,date,grossWeight,purity,numistaUrl
${veryLongLine}`;

        const { data, errors } = parseCSV(csv);
        expect(data).toHaveLength(0);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('Line 2: Line too long');
    });

    it('detects column count mismatch', () => {
        const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,Test Coin,2000,10,900,extra,column`; // Too many columns

        const { data, errors } = parseCSV(csv);
        expect(data).toHaveLength(0);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('Line 2: Column count mismatch');
    });


    it('validates grossWeight for negative input', () => {
        const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,Test Coin,2000,-5,900,https://example.com`;

        const { data, errors } = parseCSV(csv);
        expect(data).toHaveLength(0);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid gross weight "-5"');
    });

    it('validates grossWeight for non-numeric input', () => {
        const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,Test Coin,2000,abc,900,https://example.com`;

        const { data, errors } = parseCSV(csv);
        expect(data).toHaveLength(0);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid gross weight "abc"');
    });

    it('validates purity range for too high input', () => {
        const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,Test Coin,2000,10,1500,https://example.com`;

        const { data, errors } = parseCSV(csv);
        expect(data).toHaveLength(0);
        expect(errors[0]).toContain('Invalid purity "1500"');
    });

    it('validates purity for zero, negative, and non-numeric input', () => {
        let csv = `country,name,date,grossWeight,purity,numistaUrl\nUSA,Coin1,2000,10,0,url1`;
        let { data, errors } = parseCSV(csv);
        expect(data).toHaveLength(0);
        expect(errors[0]).toContain('Invalid purity "0"');

        csv = `country,name,date,grossWeight,purity,numistaUrl\nUSA,Coin2,2000,10,-10,url2`;
        ({ data, errors } = parseCSV(csv));
        expect(data).toHaveLength(0);
        expect(errors[0]).toContain('Invalid purity "-10"');

        csv = `country,name,date,grossWeight,purity,numistaUrl\nUSA,Coin3,2000,10,xyz,url3`;
        ({ data, errors } = parseCSV(csv));
        expect(data).toHaveLength(0);
        expect(errors[0]).toContain('Invalid purity "xyz"');
    });

    it('enforces max field length', () => {
        const longString = 'a'.repeat(2001); // MAX_FIELD_LENGTH is 2000
        const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,${longString},2000,10,900,https://example.com`;

        const { errors, data } = parseCSV(csv);
        expect(errors.some(e => e.includes('Field exceeded max length'))).toBe(true);
        expect(data).toHaveLength(1);
        expect(data[0].name.length).toBe(2000);
        expect(data[0].name).toBe('a'.repeat(2000));
    });

    it('validates numistaUrl protocol (only http/https)', () => {
        const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,Test Coin,2000,10,900,ftp://example.com`;

        const { data, errors } = parseCSV(csv);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('Invalid URL protocol');
        expect(data).toHaveLength(1);
        expect(data[0].numistaUrl).toBe('');
    });

    it('handles malformed numistaUrl', () => {
        const csv = `country,name,date,grossWeight,purity,numistaUrl
USA,Test Coin,2000,10,900,not a valid url`;

        const { data, errors } = parseCSV(csv);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('Malformed URL');
        expect(data).toHaveLength(1);
        expect(data[0].numistaUrl).toBe('');
    });

    it('stops parsing after max errors', () => {
        let csv = 'country,name,date,grossWeight,purity,numistaUrl\n';
        for (let i = 0; i < 150; i++) {
            csv += `USA,Coin${i},2000,-1,900,url\n`;
        }

        const { errors } = parseCSV(csv);
        expect(errors.length).toBe(101);
        expect(errors[errors.length - 1]).toContain('Too many errors');
    });
});

describe('CSV Parser - fetchAndParseCSV', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        displayAppError.mockClear();

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve(`country,name,date,grossWeight,purity\nUSA,Coin,2000,10,900`),
            })
        );
    });

    it('successfully fetches and parses CSV', async () => {
        const filePath = 'path/to/coins.csv';
        const { data, errors } = await fetchAndParseCSV(filePath);

        expect(fetch).toHaveBeenCalledWith(filePath);
        expect(errors).toHaveLength(0);
        expect(data).toHaveLength(1);
        expect(data[0].name).toBe('Coin');
        expect(displayAppError).not.toHaveBeenCalled();
    });

    it('handles network errors during fetch', async () => {
        const filePath = 'path/to/nonexistent.csv';
        const errorMessage = 'Network error during fetch.';
        global.fetch.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

        const { data, errors } = await fetchAndParseCSV(filePath);

        expect(fetch).toHaveBeenCalledWith(filePath);
        expect(data).toHaveLength(0);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain(`Failed to load CSV: ${errorMessage}`);
        expect(displayAppError).toHaveBeenCalledTimes(1);
        expect(displayAppError).toHaveBeenCalledWith(`Failed to load CSV: ${errorMessage}`);
    });

    it('handles non-OK response from fetch', async () => {
        const filePath = 'path/to/bad-response.csv';
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                statusText: 'Not Found',
                text: () => Promise.resolve(''),
            })
        );

        const { data, errors } = await fetchAndParseCSV(filePath);

        expect(fetch).toHaveBeenCalledWith(filePath);
        expect(data).toHaveLength(0);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('Failed to load CSV: Could not find CSV file: Not Found');
        expect(displayAppError).toHaveBeenCalledTimes(1);
        expect(displayAppError).toHaveBeenCalledWith('Failed to load CSV: Could not find CSV file: Not Found');
    });
});