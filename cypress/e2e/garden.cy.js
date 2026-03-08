describe('Zen Garden - �������� ���������� (E2E)', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8080');
  });

  it('Scenario 1: Tool Selection and Object Placement', () => {
    // 1. ����²��� ����������: �� ������ ������� ��� ������������
    cy.get('#sandCanvas').should('be.visible');
    
    // 2. Ĳ�: �������� �����
    cy.get('#stoneTool').click();
    
    // 3. ����²��� ����������: �� ������ �������� ��������� ������ "�������"
    cy.get('#stoneTool').should('have.class', 'active');
    
    // 4. Ĳ�: ������� �����
    cy.get('#sandCanvas').click(400, 300);
    
    // 5. ����²��� ��ò��: �� �'������ ��'��� � ���'��
    cy.window().then((win) => {
      expect(win.obstacles).to.have.lengthOf(1);
    });
  });

  it('Scenario 2: Clearing the Garden state and UI', () => {
    // 1. ϳ��������: ������� ��'���
    cy.get('#treeTool').click();
    cy.get('#sandCanvas').click(500, 500);

    // 2. Ĳ�: ��������� ��������
    cy.get('#clearBtn').click();

    // 3. ����²��� ��ò��: �� ����� ��������
    cy.window().then((win) => {
      expect(win.obstacles).to.have.lengthOf(0);
    });

    // 4. ����²��� ����������: �� �������� ������ ���������� �� ������� (���� �� �����������)
    // ��� ������ ��������, �� ������ ��������� (��������� �������)
    cy.get('#sandCanvas').should('be.visible');
  });
});