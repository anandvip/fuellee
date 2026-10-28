import "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
var KEY = "fuellee.garage.v1";
/** Last garage this browser successfully loaded. Reads work offline; writes still need the account. */
function rememberGarage(userId, garage) {
	try {
		localStorage.setItem(KEY, JSON.stringify({
			userId,
			garage
		}));
	} catch {}
}
function recallGarage(userId) {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed.userId !== userId || !parsed.garage?.vehicles) return null;
		return parsed.garage;
	} catch {
		return null;
	}
}
function forgetGarage() {
	try {
		localStorage.removeItem(KEY);
	} catch {}
}
//#endregion
export { rememberGarage as i, forgetGarage as n, recallGarage as r, RedirectToSignIn as t };
