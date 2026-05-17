describe('Navigáció', () => {
  it('a főoldal betöltődik és tartalmazza a PetShop Pro feliratot', () => {
    cy.visit('/');
    cy.contains('PetShop Pro').should('be.visible');
  });

  it('a terméklista oldal elérhető', () => {
    cy.visit('/termekek');
    cy.get('body').should('exist');
  });

  it('a főoldalon lévő link a termékoldalra visz', () => {
    cy.visit('/');
    cy.get('a[href="/termekek"]').first().click();
    cy.url().should('include', '/termekek');
  });

  it('a headerben lévő Termékek link látható a terméklistán', () => {
    cy.visit('/termekek');
    cy.contains('a', 'Termékek').should('be.visible');
  });
});
