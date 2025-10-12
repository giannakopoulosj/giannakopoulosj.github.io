import { describe, it, expect, beforeEach } from 'vitest';
import { displayErrors, displayAppError } from '../../src/utils/errorHandler.js';
import { setupFullDOM } from '../helpers.js';

describe('Error Handler', () => {
    beforeEach(() => {
        setupFullDOM();
    });

    it('displays multiple errors', async () => {
        const { initializeDOMElements } = await import('../../src/ui/domElements.js');
        initializeDOMElements();

        const errors = ['Error 1', 'Error 2'];
        displayErrors(errors);

        const container = document.getElementById('error-container');
        expect(container.style.display).toBe('block');
        expect(container.innerHTML).toContain('Error 1');
        expect(container.innerHTML).toContain('Error 2');
    });

    it('hides container when no errors', async () => {
        const { initializeDOMElements } = await import('../../src/ui/domElements.js');
        initializeDOMElements();

        displayErrors([]);

        const container = document.getElementById('error-container');
        expect(container.style.display).toBe('none');
    });

    it('displays application error', async () => {
        const { initializeDOMElements } = await import('../../src/ui/domElements.js');
        initializeDOMElements();

        displayAppError('Critical failure');

        const container = document.getElementById('error-container');
        expect(container.innerHTML).toContain('Critical failure');
    });
});