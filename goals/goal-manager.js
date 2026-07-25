(() => {
  'use strict';

  const STORAGE_KEY = 'budgetquest.goals.v1';
  const GOAL_TYPES = Object.freeze({
    home: { label: 'Eigenheim', icon: '🏡' },
    savings: { label: 'Sparziel', icon: '💰' },
    future: { label: 'Zukunftsziel', icon: '🌅' },
    other: { label: 'Anderes Ziel', icon: '🎯' }
  });

  const readGoals = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeGoals = goals => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    window.dispatchEvent(new CustomEvent('budgetquest:goals-changed', { detail: goals }));
    return goals;
  };

  const normalizeMoney = value => Math.max(0, Number(value) || 0);

  const createGoal = input => {
    const type = GOAL_TYPES[input.type] ? input.type : 'other';
    const title = String(input.title || GOAL_TYPES[type].label).trim();
    if (!title) throw new Error('Bitte einen Namen für das Ziel eingeben.');

    const goal = {
      id: globalThis.crypto?.randomUUID?.() || `goal-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      title,
      targetAmount: normalizeMoney(input.targetAmount),
      currentAmount: normalizeMoney(input.currentAmount),
      monthlyContribution: normalizeMoney(input.monthlyContribution),
      targetDate: input.targetDate || '',
      note: String(input.note || '').trim(),
      createdAt: new Date().toISOString(),
      completed: false
    };

    if (goal.targetAmount <= 0) throw new Error('Der Zielbetrag muss grösser als CHF 0 sein.');
    goal.currentAmount = Math.min(goal.currentAmount, goal.targetAmount);

    return writeGoals([...readGoals(), goal]);
  };

  const updateGoal = (id, changes) => {
    const goals = readGoals();
    const index = goals.findIndex(goal => goal.id === id);
    if (index < 0) throw new Error('Ziel nicht gefunden.');

    const next = { ...goals[index], ...changes };
    next.targetAmount = normalizeMoney(next.targetAmount);
    next.currentAmount = Math.min(normalizeMoney(next.currentAmount), next.targetAmount);
    next.monthlyContribution = normalizeMoney(next.monthlyContribution);
    next.completed = next.targetAmount > 0 && next.currentAmount >= next.targetAmount;
    goals[index] = next;
    return writeGoals(goals);
  };

  const addContribution = (id, amount) => {
    const goal = readGoals().find(item => item.id === id);
    if (!goal) throw new Error('Ziel nicht gefunden.');
    return updateGoal(id, { currentAmount: goal.currentAmount + normalizeMoney(amount) });
  };

  const deleteGoal = id => writeGoals(readGoals().filter(goal => goal.id !== id));

  const calculateGoal = goal => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const progress = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
    const monthsRemaining = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;
    return { remaining, progress, monthsRemaining };
  };

  window.BudgetQuestGoals = {
    types: GOAL_TYPES,
    list: readGoals,
    create: createGoal,
    update: updateGoal,
    contribute: addContribution,
    remove: deleteGoal,
    calculate: calculateGoal
  };
})();