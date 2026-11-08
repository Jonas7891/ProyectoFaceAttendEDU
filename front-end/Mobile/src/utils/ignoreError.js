/**
 * Records an error that the caller deliberately tolerates (an optional profile
 * field that failed to load, a token cleanup on an already-closed session...).
 *
 * The app keeps working, but the failure is no longer swallowed silently: in
 * development builds it is printed with its context so it can be diagnosed.
 * Release builds print nothing, so no request data or personal data reaches
 * the device log.
 *
 * @param {string} context  where it happened, e.g. "useLoginViewModel.removeToken"
 * @param {unknown} error   the caught value
 * @returns {void}
 */
export function reportIgnoredError(context, error) {
    if (typeof __DEV__ === 'undefined' || !__DEV__) return;
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[ignored] ${context}: ${message}`);
}
