(() => {
  const canvas = document.getElementById("webgl");
  if (canvas) canvas.style.display = "none";
  window.__portfolioWebglReady = true;
  window.dispatchEvent(new Event("webgl-ready"));
})();
