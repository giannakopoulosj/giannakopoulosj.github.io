import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupFullDOM } from '../helpers.js';

// This variable will hold the value that our mocked `errorContainer` will export.
// Declared at the module level (top-level) so it's always in scope for vi.mock.
let currentMockErrorContainer = null;

// The vi.mock call needs to be at the top level of the module or within the describe block
// but its factory function will be evaluated at the top of the file due to hoisting.
// Using a getter here ensures that whenever `errorHandler.js` asks for `errorContainer`,
// it gets the *current* value of `currentMockErrorContainer`.
vi.mock('../../src/ui/domElements.js', () => ({
    get errorContainer() {
        return currentMockErrorContainer;
    },
    // Mock initializeDOMElements as well, though it's not directly controlling
    // errorContainer in this mocked setup, it might be called elsewhere.
    initializeDOMElements: vi.fn(),
}));

describe('Error Handler', () => {
    beforeEach(() => {
        setupFullDOM(); // Ensures a clean DOM for each test
        vi.restoreAllMocks(); // Restores any mocked functions/spies
        vi.resetModules();    // Crucial: Clears the module cache, so each 'import' gets a fresh copy.

        // Create a real DOM element for tests that need a functional errorContainer.
        // Assign this to our module-level variable.
        document.body.innerHTML = '<div id="error-container" style="display: none;"></div>';
        currentMockErrorContainer = document.getElementById('error-container');

        // Note: The vi.mock call is now outside this beforeEach and relies on `currentMockErrorContainer`
        // being updated here.
    });

    it('displays multiple errors', async () => {
        // At this point, currentMockErrorContainer has been set to the live DOM element by beforeEach.
        // When errorHandler.js is imported, its errorContainer will bind to this live element
        // because of the getter in the vi.mock factory.
        const { displayErrors } = await import('../../src/utils/errorHandler.js');

        const errors = ['Error 1', 'Error 2'];
        displayErrors(errors);

        expect(currentMockErrorContainer.style.display).toBe('block');
        expect(currentMockErrorContainer.innerHTML).toContain('Error 1');
        expect(currentMockErrorContainer.innerHTML).toContain('Error 2');
    });

    it('hides container when no errors', async () => {
        // currentMockErrorContainer is still the live DOM element.
        const { displayErrors } = await import('../../src/utils/errorHandler.js');

        displayErrors([]);

        expect(currentMockErrorContainer.style.display).toBe('none');
    });

    it('displays application error', async () => {
        // currentMockErrorContainer is still the live DOM element.
        const { displayAppError } = await import('../../src/utils/errorHandler.js');

        displayAppError('Critical failure');

        expect(currentMockErrorContainer.innerHTML).toContain('Critical failure');
    });

    it('handles application error when errorContainer is not available (defensive check)', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // FOR THIS SPECIFIC TEST, we set currentMockErrorContainer to null.
        // Because vi.mock uses a getter, the subsequent import of errorHandler.js
        // will now see errorContainer as null.
        currentMockErrorContainer = null;

        const { displayAppError } = await import('../../src/utils/errorHandler.js');

        const errorMessage = 'Test critical failure without DOM';
        displayAppError(errorMessage);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Application Error:', errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error container not available - DOM may not be initialized');

        consoleErrorSpy.mockRestore(); // Clean up the spy
    });
});