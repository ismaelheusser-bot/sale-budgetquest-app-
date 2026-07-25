(() => {
  'use strict';

  const money = value => new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

  const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function goalCard(goal) {
    const type = window.BudgetQuestGoals.types[goal.type] || window.BudgetQuestGoals.types.other;
    const stats = window.BudgetQuestGoals.calculate(goal);
    const eta = stats.monthsRemaining === null
      ? 'Monatlichen Beitrag festlegen'
      : stats.monthsRemaining === 0
        ? 'Ziel erreicht'
        : `Noch ca. ${stats.monthsRemaining} Monate`;

    return `<article class="goal-card" data-goal-id="${escapeHtml(goal.id)}">
      <div class="goal-card-head">
        <div class="goal-icon">${type.icon}</div>
        <div>
          <small>${escapeHtml(type.label)}</small>
          <h3>${escapeHtml(goal.title)}</h3>
        </div>
        <button type="button" class="goal-delete" data-action="delete" aria-label="Ziel löschen">×</button>
      </div>
      <div class="goal-progress"><span style="width:${stats.progress.toFixed(1)}%"></span></div>
      <div class="goal-values"><strong>${money(goal.currentAmount)}</strong><span>von ${money(goal.targetAmount)}</span></div>
      <div class="goal-meta"><span>Noch ${money(stats.remaining)}</span><span>${escapeHtml(eta)}</span></div>
      <form class="goal-contribution-form">
        <input type="number" min="1" step="1" placeholder="Betrag einzahlen" required>
        <button class="btn" type="submit">Einzahlen</button>
      </form>
    </article>`;
  }

  function renderGoals() {
    const list = document.getElementById('customGoalsList');
    if (!list || !window.BudgetQuestGoals) return;
    const goals = window.BudgetQuestGoals.list();
    list.innerHTML = goals.length
      ? goals.map(goalCard).join('')
      : '<div class="empty">Noch kein Ziel erstellt. Starte mit einem Eigenheim-, Spar- oder Zukunftsziel.</div>';
  }

  function createGoalFromForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      window.BudgetQuestGoals.create({
        type: values.get('type'),
        title: values.get('title'),
        targetAmount: values.get('targetAmount'),
        currentAmount: values.get('currentAmount'),
        monthlyContribution: values.get('monthlyContribution'),
        targetDate: values.get('targetDate'),
        note: values.get('note')
      });
      form.reset();
      renderGoals();
    } catch (error) {
      alert(error.message);
    }
  }

  function handleGoalListClick(event) {
    const action = event.target.closest('[data-action]');
    const card = event.target.closest('[data-goal-id]');
    if (!action || !card) return;
    if (action.dataset.action === 'delete' && confirm('Dieses Ziel wirklich löschen?')) {
      window.BudgetQuestGoals.remove(card.dataset.goalId);
      renderGoals();
    }
  }

  function handleContribution(event) {
    if (!event.target.matches('.goal-contribution-form')) return;
    event.preventDefault();
    const card = event.target.closest('[data-goal-id]');
    const input = event.target.querySelector('input');
    window.BudgetQuestGoals.contribute(card.dataset.goalId, input.value);
    input.value = '';
    renderGoals();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('goalCreateForm')?.addEventListener('submit', createGoalFromForm);
    document.getElementById('customGoalsList')?.addEventListener('click', handleGoalListClick);
    document.getElementById('customGoalsList')?.addEventListener('submit', handleContribution);
    renderGoals();
  });

  window.addEventListener('budgetquest:goals-changed', renderGoals);
  window.BudgetQuestGoalsUI = { render: renderGoals };
})();