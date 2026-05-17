describe('Terméklista oldal', () => {
  beforeEach(() => {
    cy.visit('/termekek');
  });

  it('az oldal betöltődik', () => {
    cy.get('body').should('exist');
  });

  it('a keresőmező megjelenik a headerben', () => {
    cy.get('input[placeholder*="Keresés"], input[type="search"], input[placeholder*="keresés"]')
      .should('exist');
  });

  it('az API health endpoint elérhető', () => {
    cy.request('http://localhost:5000/api/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('ok');
    });
  });

  it('az API /api/products endpoint válaszol', () => {
    cy.request('http://localhost:5000/api/products').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('products');
      expect(response.body).to.have.property('total');
    });
  });

  it('az API /api/categories endpoint válaszol', () => {
    cy.request('http://localhost:5000/api/categories').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });
});

describe('Termék detail oldal', () => {
  it('nem létező termék 404 API választ ad', () => {
    cy.request({
      url: 'http://localhost:5000/api/products/99999',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});
