export function startVisitTimers() {
  if (typeof ym === 'undefined') return;

  if (window._visitTimersStarted) return;
  window._visitTimersStarted = true;

  setTimeout(() => {
    ym(101458573, 'reachGoal', 'visit_3_min');
  }, 180000);

  setTimeout(() => {
    ym(101458573, 'reachGoal', 'visit_6_min');
  }, 360000);

  setTimeout(() => {
    ym(101458573, 'reachGoal', 'visit_9_min');
  }, 540000);
}
