import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('App Entry Point', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers DOMContentLoaded listener', async () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    
    await import('../src/app.js');
    
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'DOMContentLoaded',
      expect.any(Function)
    );
  });
});