import { test, expect } from '@playwright/test';

test.describe('Voting Flow', () => {
  test('SÍNDICO deve conseguir criar uma nova votação e MORADOR deve conseguir votar', async ({ page }) => {
    // 1. SÍNDICO faz login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'sindico@aurora.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    // Aguarda ir ao dashboard depois do login
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Navega para criar votação
    await page.goto('/dashboard/votings/new');
    await page.waitForLoadState('networkidle');

    const votingTitle = `Eleição Teste ${Date.now()}`;
    await page.fill('input[name="title"]', votingTitle);
    await page.fill('textarea[name="description"]', 'Descrição do teste E2E');

    // Configura datas (agora e amanhã) para a votação estar ABERTA imediatamente
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - 5); // Começou 5 min atrás
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);

    // Formata para datetime-local: YYYY-MM-DDTHH:mm
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    await page.fill('input[name="startDate"]', fmt(agora));
    await page.fill('input[name="endDate"]', fmt(amanha));

    await page.selectOption('select[name="quorumType"]', 'SIMPLES');

    // Preenche as opções de voto
    const optionsInputs = page.locator('input[name="options"]');
    await optionsInputs.nth(0).fill('Sim');
    await optionsInputs.nth(1).fill('Não');

    // Clica no botão correto (texto real do componente VotingForm)
    await page.click('button:has-text("Lançar Votação no Sistema")');

    // Espera redirecionar de volta para a lista
    await expect(page).toHaveURL(/.*\/dashboard\/votings/, { timeout: 15000 });
    await expect(page.locator('body')).toContainText(votingTitle);

    // 2. Logout do Síndico via cookie clear
    await page.context().clearCookies();

    // 3. MORADOR faz login e vota
    await page.goto('/login');
    await page.fill('input[name="email"]', 'morador@aurora.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    await page.goto('/dashboard/votings');
    await expect(page.locator('body')).toContainText(votingTitle);

    // Clica no card da votação
    await page.click(`text=${votingTitle}`);
    await page.waitForLoadState('networkidle');

    // Vota na primeira opção disponível
    const firstOption = page.locator('input[type="radio"]').first();
    await firstOption.check();
    await page.click('button:has-text("Confirmar Voto")');

    // Deve mostrar a tela de resultados após votar
    await expect(page.locator('body')).toContainText(/Resultados Parciais|Votos: 1/i, { timeout: 10000 });
  });
});
