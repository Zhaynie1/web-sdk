/**
 * Reactive state for the offline demo route. On `/play` the actor stays idle
 * (bets go through bridge.onBet → runDemoBook, not the state machine), so the UI
 * needs this flag to know a demo spin is in flight (spin button busy/disabled).
 */
export const demoState = $state({ busy: false });
