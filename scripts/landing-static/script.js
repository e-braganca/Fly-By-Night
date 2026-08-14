/*
  Fly by Night Fuel — landing page behaviour.

  The page is deliberately almost all HTML and CSS: the nav links are anchors,
  the FAQ uses native <details> elements, and the smooth scrolling is CSS. This
  file handles the one thing that genuinely needs scripting — deciding where the
  "Order Fuel" buttons send the visitor.

  Everything here is progressive enhancement. With JavaScript disabled the page
  still renders and every link still works.
*/

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIGURATION — the only line most deployments need to change.

     Where the web app is hosted. The landing itself is static; signing in and
     placing an order happen in the app, so every account link points here.
     No trailing slash.
     ------------------------------------------------------------------ */
  var APP_ORIGIN = "__APP_ORIGIN__";

  /* ------------------------------------------------------------------
     Two request flows, chosen by the landing's own query string.

       /            → visitors sign in first, then reach the order wizard
       /?v=2        → visitors go straight to the wizard and give their name
                      and email there instead of creating an account first

     This exists so both flows can be demonstrated from a single deploy: send
     one link or the other. Drop the `?v=2` support once a flow is settled on.
     ------------------------------------------------------------------ */
  var SIGN_IN_PATH = "/login";
  var REQUEST_PATH = "/login?next=schedule";
  var REQUEST_PATH_GUEST = "/customer-schedule?v=2";

  function requestPathFor(variant) {
    return variant === "2" ? REQUEST_PATH_GUEST : REQUEST_PATH;
  }

  /*
    Each app-bound link carries `data-app-path` with the route it wants, and an
    absolute href already baked into the HTML as the no-JavaScript fallback.
    Here we rebuild those hrefs from APP_ORIGIN and the chosen flow.
  */
  function resolveAppLinks() {
    var variant = null;
    try {
      variant = new URLSearchParams(window.location.search).get("v");
    } catch (err) {
      /* Very old browser: fall through with the default flow. */
    }

    var links = document.querySelectorAll("a[data-app-path]");

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var path = link.getAttribute("data-app-path");

      /* Only the order buttons switch flow. Plain sign-in stays sign-in. */
      if (path !== SIGN_IN_PATH) path = requestPathFor(variant);

      link.setAttribute("href", APP_ORIGIN + path);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", resolveAppLinks);
  } else {
    resolveAppLinks();
  }
})();
