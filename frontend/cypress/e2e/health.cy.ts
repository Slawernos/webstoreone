describe('Egészség ellenőrzés', () => {
  it('a főoldal betöltődik', () => {
    cy.visit('/');
    cy.get('body').should('exist');
  });

  it('az API health endpoint válaszol', () => {
    cy.request('http://localhost:5000/api/health').then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
