export function setupFullDOM() {
  document.body.innerHTML = `
    <div id="error-container"></div>
    <input id="silver-price-toz" value="30" />
    <input id="silver-price-gram" value="0.9646" />
    <button id="clear-all-btn"></button>
    <input id="search-input" />
    <button id="clear-search-btn"></button>
    <input type="checkbox" id="theme-toggle" />
    <div id="totals-section"></div>
    <span id="filtered-indicator"></span>
    <div id="coin-list"></div>
    <span class="total-silver-weight">0.000</span>
    <span class="total-melt-value">0.00</span>
  `;
}