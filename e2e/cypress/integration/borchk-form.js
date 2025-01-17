context('Borchk form', () => {
  const serviceUrl = `${Cypress.config().baseUrl}/example`;
  const authorize = `/oauth/authorize?response_type=code&client_id=hejmdal&redirect_uri=${serviceUrl}`;

  beforeEach(() => {
    cy.visit(authorize);
  });

  it('test dropdown is available on focus', () => {
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').focus();
    cy.get('#borchk-dropdown [data-cy=dropdown-container]').should(
      'have.class',
      'visible'
    );
  });
  it('Toggle dropdown', () => {
    // Dropdown is hidden
    cy.get('#borchk-dropdown [data-cy=dropdown-container]').should(
      'not.have.class',
      'visible'
    );
    // Toggle on
    cy.get('#borchk-dropdown [data-cy=caret-libraries-btn]').click();
    cy.get('#borchk-dropdown [data-cy=dropdown-container]').should(
      'have.class',
      'visible'
    );
    // Toggle off
    cy.get('#login').click('topLeft');
    cy.get('#borchk-dropdown [data-cy=dropdown-container]').should(
      'not.have.class',
      'visible'
    );
  });
  it('Select library in dropdown', () => {
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type('sla');
    // Select first library in list with click
    cy.get('.agency:visible')
      .first()
      .click();
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').should(
      'have.value',
      'Slagelse'
    );
    cy.get('#borchk-dropdown [data-cy=clear-libraries-btn]').should(
      'be.visible'
    );
    // Clear selection
    cy.get('#borchk-dropdown [data-cy=clear-libraries-btn]').click();
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').should('be.empty');
    // Select using keys
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type('sl');
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type('{downarrow}');
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type('{enter}');
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').should(
      'have.value',
      'Slagelse'
    );
  });

  it('Toggle clear button', () => {
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type('sla');
    cy.get('#borchk-dropdown [data-cy=caret-libraries-btn]').should(
      'not.be.visible'
    );
    cy.get('#borchk-dropdown [data-cy=clear-libraries-btn]').should(
      'be.visible'
    );
    // Clear input and close dropdown
    cy.get('#borchk-dropdown [data-cy=clear-libraries-btn]').click();
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').should('be.empty');
  });
  it('toggle dropdown', () => {
    // Toggle dropdown with toggle button
    cy.get('#borchk-dropdown [data-cy=caret-libraries-btn]').click();
    cy.get('#borchk-dropdown [data-cy=dropdown-container]').should(
      'have.class',
      'visible'
    );
    cy.get('#borchk-dropdown [data-cy=caret-libraries-btn]').click();
    cy.get('#borchk-dropdown [data-cy=dropdown-container]').should(
      'not.have.class',
      'visible'
    );
  });
  it('clear library dropdown with escape', () => {
    // Open dropdown with focus in input field
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type('sla');
    cy.get('#borchk-dropdown [data-cy=dropdown-container]').should(
      'have.class',
      'visible'
    );
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type('{esc}');
    cy.get('#borchk-dropdown [data-cy=dropdown-container]').should(
      'not.have.class',
      'visible'
    );
    // Open dropdown with toggle button
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').clear();
    cy.get('#borchk-dropdown [data-cy=caret-libraries-btn]').click();
    cy.get('#borchk-dropdown [data-cy=dropdown-container]').should(
      'have.class',
      'visible'
    );
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type('{esc}');
    cy.get('#borchk-dropdown [data-cy=dropdown-container]').should(
      'not.have.class',
      'visible'
    );
  });

  it('Should switch type on userid input field', () => {
    cy.get('#userid-input').type('12345678');
    cy.get('#userid-input').should('have.attr', 'type', 'password');
    cy.get('#toggle-userid-input').click();
    cy.get('#userid-input').should('have.attr', 'type', 'tel');
    cy.get('#userid-input').should('have.value', '12345678');
  });
  it('Should switch type on password input field', () => {
    cy.get('#pin-input').type('1234');
    cy.get('#pin-input').should('have.attr', 'type', 'password');
    cy.get('#toggle-pin-input').click();
    cy.get('#pin-input').should('have.attr', 'type', 'tel');
    cy.get('#pin-input').should('have.value', '1234');
  });
  it('Should filter by agencyType', () => {
    // Show all
    cy.get('#borchk-dropdown [data-cy=caret-libraries-btn]').click();
    cy.get('#borchk-dropdown .subject').should('have.length', 2);
    cy.get('#borchk-dropdown .agency').should('have.length', 6);

    // Show folkebiblioteker
    cy.visit(`${authorize}&agencytype=folk`);
    cy.get('#borchk-dropdown [data-cy=caret-libraries-btn]').click();
    cy.get('#borchk-dropdown .subject').should('have.length', 0);
    cy.get('#borchk-dropdown .agency').should('have.length', 2);
    cy.get('#borchk-dropdown .agency').should(
      'contain.text',
      'BýarbókasavniðSlagelse'
    );
    // Show forskningsbiblioteker
    cy.visit(`${authorize}&agencytype=forsk`);
    cy.get('#borchk-dropdown [data-cy=caret-libraries-btn]').click();
    cy.get('#borchk-dropdown .agency').should('have.length', 4);
    cy.get('#borchk-dropdown .agency')
      .first()
      .should('have.text', 'Fagbiblioteket Psykiatrien Region Sjælland');
  });

  it('Should show test agency by agencyID', () => {
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type('900');
    cy.get('#borchk-dropdown .agency').should('have.length', 1);
    cy.get('#borchk-dropdown .agency')
      .first()
      .should('have.text', 'DBC Test library');
  });

  it('Should validate forms', () => {
    // Assert validation errors
    cy.get('#borchk-submit').click();
    cy.get('#borchk-dropdown [data-cy=libraryname-input-text]').should(
      'contain',
      'Du skal vælge et bibliotek'
    );
    cy.get('#userid-input-text').should('contain', 'Du skal angive');
    cy.get('#pin-input-text').should('contain', 'Du skal angive');

    // remove validation error from library name
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type(
      '733000{enter}'
    );
    cy.get('#borchk-submit').click();
    cy.get('#borchk-dropdown [data-cy=libraryname-input]-text').should(
      'not.contain',
      'Du skal vælge et bibliotek'
    );
    // remove validation error from username
    cy.get('#userid-input').type('12345678{enter}');
    cy.get('#userid-input-text').should(
      'not.contain',
      'Du skal vælge et bibliotek'
    );

    // show error when pin is less than 4 figures
    cy.get('#userid-input').clear();
    cy.get('#pin-input').type('123{enter}');
    cy.get('#pin-input-text').should(
      'contain',
      'Bibliotekskoden skal være på mindst 4 tegn.'
    );

    // remove validation error from user pin
    cy.get('#pin-input').clear();
    cy.get('#pin-input').type('123456abc{enter}');
    cy.get('#pin-input-text').should(
      'not.contain',
      'Bibliotekskoden skal være på mindst 4 tegn.'
    );
  });
  it('Should block user', () => {
    const uid = Math.random()
      .toString(10)
      .slice(-10);
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').focus();
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type(
      'sl{downarrow}{downarrow}{downarrow}{enter}'
    );
    for (var i = 5; i; i--) {
      cy.get('#userid-input').type(uid);
      cy.get('#pin-input').type('1234{enter}');
      cy.get('#error-body').should(
        'contain',
        'Du har ' + i + ' forsøg tilbage'
      );
    }
    cy.get('#userid-input').type(uid);
    cy.get('#pin-input').type('1234{enter}');
    cy.get('#error-header').should(
      'contain',
      'For mange fejlede forsøg på login'
    );
    cy.get('#error-body').should('contain', 'Login blokeret');

    cy.wait(1000);
    cy.reload();
    cy.get('#error-header').should(
      'contain',
      'For mange fejlede forsøg på login'
    );
    cy.get('#error-body').should('contain', 'Login blokeret');
    cy.wait(5000);
    cy.reload();
    cy.get('#error-header').should(
      'not.contain',
      'For mange fejlede forsøg på login'
    );

    cy.get('#userid-input').type(uid);
    cy.get('#pin-input').type('1234{enter}');
    cy.get('#error-header').should(
      'contain',
      'For mange fejlede forsøg på login'
    );
    cy.get('#error-body').should('contain', 'Login blokeret');
  });
  it('Should clear user when succesfull login', () => {
    const uid = Math.random()
      .toString(10)
      .slice(-10);
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').focus();
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type(
      'sl{downarrow}{downarrow}{downarrow}{enter}'
    );
    for (var i = 5; i > 1; i--) {
      cy.get('#userid-input').type(uid);
      cy.get('#pin-input').type('1234{enter}');
      cy.get('#error-body').should(
        'contain',
        'Du har ' + i + ' forsøg tilbage'
      );
    }
    cy.get('#borchk-dropdown [data-cy=clear-libraries-btn]').click();
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').focus();
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type(
      'sl{downarrow}{enter}'
    );
    cy.get('#userid-input').type(uid);
    cy.get('#pin-input').type('1234{enter}');
    cy.get('#logout button').click();
    cy.visit(authorize);
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').focus();
    cy.get('#borchk-dropdown [data-cy=libraryname-input]').type(
      'sl{downarrow}{downarrow}{downarrow}{enter}'
    );
    cy.get('#userid-input').type(uid);
    cy.get('#pin-input').type('1234{enter}');
    cy.get('#error-body').should('contain', 'Du har 5 forsøg tilbage');
  });
});
