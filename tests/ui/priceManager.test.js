import { describe, it, expect, beforeEach, vi } from 'vitest';
// The helper.js is imported here, for use by the test file, not by priceManager.js
import { setupFullDOM } from '../helpers.js';

// Module-level mutable variables to hold the current mock DOM elements.
// These must be declared at the top level so they are in scope for the `vi.mock` factory.
let currentMockSilverPriceTozEl = null;
let currentMockSilverPriceGramEl = null;

// Define the mock for domElements.js at the top level.
// Vitest hoists `vi.mock` calls, so this mock is set up very early.
// The `get` syntax ensures that whenever priceManager.js accesses these exports,
// it receives the *current* value of `currentMockSilverPriceTozEl`
// and `currentMockSilverPriceGramEl`, which we update in `beforeEach`.
vi.mock('../../src/ui/domElements.js', () => ({
    get silverPriceTozEl() {
        return currentMockSilverPriceTozEl;
    },
    get silverPriceGramEl() {
        return currentMockSilverPriceGramEl;
    },
    // Mock initializeDOMElements as well, as it might be imported/called elsewhere.
    initializeDOMElements: vi.fn(),
}));

describe('Price Manager', () => {
    beforeEach(() => {
        // Step 1: Clear Vitest's module cache. This ensures that when `priceManager.js`
        // is imported later in an `it` block, it's a fresh import that picks up
        // the latest state of our `vi.mock` for `domElements.js`.
        vi.resetModules();
        vi.restoreAllMocks(); // Restore any spies/mocks on functions for a clean slate.

        // Step 2: Set up a clean DOM using your helper function.
        setupFullDOM();

        // Step 3: Get fresh references to the newly created DOM elements.
        const tozEl = document.getElementById('silver-price-toz');
        const gramEl = document.getElementById('silver-price-gram');

        // Step 4: Update the module-level mutable variables with these fresh DOM element references.
        // Because of the getters in our `vi.mock`, `priceManager.js` will now see these elements.
        currentMockSilverPriceTozEl = tozEl;
        currentMockSilverPriceGramEl = gramEl;

        // Ensure initial values for these elements if required by tests, preventing unexpected empty strings.
        if (currentMockSilverPriceTozEl) currentMockSilverPriceTozEl.value = '0';
        if (currentMockSilverPriceGramEl) currentMockSilverPriceGramEl.value = '0';
    });

    it('updates gram price from troy ounce', async () => {
        // Dynamically import priceManager.js *after* beforeEach has finished setting up
        // the DOM and updating the mock variables.
        const { updateGramFromToz } = await import('../../src/ui/priceManager.js');

        currentMockSilverPriceTozEl.value = '31.1034768';
        updateGramFromToz();
        expect(currentMockSilverPriceGramEl.value).toBe('1.0000');
    });

    it('handles negative prices in updateGramFromToz', async () => {
        const { updateGramFromToz } = await import('../../src/ui/priceManager.js');

        currentMockSilverPriceTozEl.value = '-10';
        updateGramFromToz();
        expect(currentMockSilverPriceTozEl.value).toBe('0');
        expect(currentMockSilverPriceGramEl.value).toBe('0.0000');
    });

    it('listens for input on silverPriceTozEl and calls callbacks', async () => {
        const { setupPriceListeners } = await import('../../src/ui/priceManager.js');
        const calculateTotalsCallback = vi.fn(); // Mock the callback function

        setupPriceListeners(calculateTotalsCallback);

        // Simulate user input
        currentMockSilverPriceTozEl.value = '31.1034768';
        currentMockSilverPriceTozEl.dispatchEvent(new Event('input'));

        // Assert updateGramFromToz effect and callback call
        expect(currentMockSilverPriceGramEl.value).toBe('1.0000');
        expect(calculateTotalsCallback).toHaveBeenCalledTimes(1);

        // Test with invalid input for tozPrice
        currentMockSilverPriceTozEl.value = '-5';
        currentMockSilverPriceTozEl.dispatchEvent(new Event('input'));
        expect(currentMockSilverPriceTozEl.value).toBe('0'); // Should be corrected
        expect(currentMockSilverPriceGramEl.value).toBe('0.0000');
        expect(calculateTotalsCallback).toHaveBeenCalledTimes(2); // Called again
    });

    it('listens for input on silverPriceGramEl and calls callbacks', async () => {
        const { setupPriceListeners } = await import('../../src/ui/priceManager.js');
        const calculateTotalsCallback = vi.fn(); // Mock the callback function

        setupPriceListeners(calculateTotalsCallback);

        // Simulate user input
        currentMockSilverPriceGramEl.value = '1.0000';
        currentMockSilverPriceGramEl.dispatchEvent(new Event('input'));

        // Assert update based on gram input and callback call
        expect(currentMockSilverPriceTozEl.value).toBe('31.10'); // toFixed(2)
        expect(calculateTotalsCallback).toHaveBeenCalledTimes(1);

        // Test with an empty string for gramPrice
        currentMockSilverPriceGramEl.value = '';
        currentMockSilverPriceGramEl.dispatchEvent(new Event('input'));
        expect(currentMockSilverPriceGramEl.value).toBe('0'); // Should be corrected
        expect(currentMockSilverPriceTozEl.value).toBe('0.00');
        expect(calculateTotalsCallback).toHaveBeenCalledTimes(2); // Called again

        // Test with a negative value for gramPrice
        currentMockSilverPriceGramEl.value = '-0.5';
        currentMockSilverPriceGramEl.dispatchEvent(new Event('input'));
        expect(currentMockSilverPriceGramEl.value).toBe('0'); // Should be corrected
        expect(currentMockSilverPriceTozEl.value).toBe('0.00');
        expect(calculateTotalsCallback).toHaveBeenCalledTimes(3); // Called again
    });
});