const statusEl   = document.getElementById('status');
const chanceEl   = document.getElementById('chance');
const detailsEl  = document.getElementById('details');
const loadingEl  = document.getElementById('loading');
const rainBg     = document.getElementById('rainBg');
const soundToggle = document.getElementById('soundToggle');
const rainAudio  = document.getElementById('rainSound');

let isAudioPlaying = false;

async function getCoords() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}

async function geocodeCity(city) {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`
    );
    const data = await res.json();
    if (!data.results?.length) throw new Error("City not found");
    return { lat: data.results[0].latitude, lon: data.results[0].longitude };
  } catch (err) {
    throw new Error("Geocoding failed: " + err.message);
  }
}

async function checkWeather() {
  loadingEl.textContent = "Fetching weather...";
  statusEl.textContent = "⋯";
  chanceEl.textContent = "";
  detailsEl.textContent = "";

  let lat, lon;

  try {
    const pos = await getCoords();
    lat = pos.lat;
    lon = pos.lon;
    detailsEl.textContent = "(Using your current location)";
  } catch {
    // fallback to city
    const city = document.getElementById('city').value.trim() || "Kathmandu";
    loadingEl.textContent = `Looking up ${city}...`;
    const coords = await geocodeCity(city);
    lat = coords.lat;
    lon = coords.lon;
    detailsEl.textContent = `(Using city: ${city})`;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
                `&hourly=precipitation_probability,temperature_2m` +
                `&daily=precipitation_probability_max` +
                `&timezone=auto&forecast_days=1`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather service error");
    const data = await res.json();

    const now = new Date();
    const hourly = data.hourly;
    let nextHourIndex = hourly.time.findIndex(t => new Date(t) > now);
    if (nextHourIndex === -1) nextHourIndex = hourly.time.length - 1;

    const rainProbNext = hourly.precipitation_probability[nextHourIndex] ?? 0;
    const tempApprox   = Math.round(hourly.temperature_2m[nextHourIndex]) ?? "?";
    const maxTodayProb = data.daily.precipitation_probability_max[0] ?? 0;

    let message = "☀️ Looks dry for now";
    let color = "#ffffff";
    rainBg.classList.remove("active");
    stopRainSound();

    if (rainProbNext > 70 || maxTodayProb > 70) {
      message = "🌧️ Rain very likely!";
      color = "#00d4ff";
      rainBg.classList.add("active");
      playRainSound();
    } else if (rainProbNext > 40 || maxTodayProb > 40) {
      message = "☂️ Rain quite possible";
      color = "#ffeb3b";
    }

    statusEl.textContent = message;
    statusEl.style.color = color;

    chanceEl.textContent = `Next hour: ${rainProbNext}% • Today max: ${maxTodayProb}%`;
    detailsEl.textContent += ` • ≈ ${tempApprox}°C`;

  } catch (err) {
    statusEl.textContent = "⚠️ " + err.message;
    statusEl.style.color = "#ff6b6b";
  } finally {
    loadingEl.textContent = "";
  }
}

function playRainSound() {
  if (soundToggle.checked && !isAudioPlaying) {
    rainAudio.volume = 0.35;
    rainAudio.play().catch(() => console.log("Autoplay blocked – user interaction needed"));
    isAudioPlaying = true;
  }
}

function stopRainSound() {
  rainAudio.pause();
  rainAudio.currentTime = 0;
  isAudioPlaying = false;
}

// Run once on load
checkWeather();

// Optional: refresh every 15 minutes
setInterval(checkWeather, 15 * 60 * 1000);