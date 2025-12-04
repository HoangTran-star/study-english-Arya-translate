// navbar.js - đơn giản, render custom element <custom-navbar>
class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="bg-white shadow p-4 mb-6">
        <div class="container mx-auto flex justify-between items-center">
          <div class="font-bold text-indigo-700">Study English</div>
          <div>
            <a href="#" class="mr-4 text-sm text-gray-600">Home</a>
            <a href="#dictionary" class="text-sm text-gray-600">Dictionary</a>
          </div>
        </div>
      </nav>
    `;
  }
}
customElements.define('custom-navbar', CustomNavbar);
