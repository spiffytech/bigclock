function resizeClock() {
  console.log("Resizing clock");
  const clock = document.getElementById("clock");
  const wrapper = document.getElementById("clock-sizing-wrapper");
  if (!clock || !wrapper) return;

  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  wrapper.style.fontSize = "100px";
  const testHeight = clock.scrollHeight;
  const testWidth = clock.scrollWidth;

  const heightRatio = viewportHeight / testHeight;
  const widthRatio = viewportWidth / testWidth;
  const ratio = Math.min(heightRatio, widthRatio) * 0.95;

  wrapper.style.fontSize = 100 * ratio + "px";
}

window.resizeClock = resizeClock;
window.addEventListener("resize", resizeClock);
