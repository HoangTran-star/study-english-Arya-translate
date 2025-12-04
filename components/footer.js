// footer.js - đơn giản, render custom element <custom-footer>
class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="bg-white mt-12 py-6 text-center text-gray-600">
        © ${new Date().getFullYear()} Tran Minh Hoang LK23
      </footer>
    `;
  }
}
customElements.define('custom-footer', CustomFooter);
