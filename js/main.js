/* Boot: render → engine → navegação. */
(function () {
  "use strict";
  var PS = window.PS;
  var root = document.getElementById("apresentacao");
  PS.render(root);
  PS.startEngine();
  PS.startNav();
})();
