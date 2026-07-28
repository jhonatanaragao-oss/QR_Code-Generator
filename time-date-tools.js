(function registerTimeDateTools() {
  const displayNames = ["Cronômetro", "Timer", "Contador de dias"];

  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    ...displayNames
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Cronômetro": renderStopwatchPanel,
    "Timer": renderTimerPanel,
    "Contador de dias": renderDaysCounterPanel
  };

  let stopwatchInterval = null;
  let timerInterval = null;

  function clearRunningTimers() {
    if (stopwatchInterval) {
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
    }

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function renderStopwatchPanel(tool, { renderPanelShell, setToolMessage }) {
    clearRunningTimers();
    renderPanelShell(tool, `
      <p>Marque o tempo com pausa, reinício e registro de voltas.</p>

      <div class="time-display" id="stopwatch-display">00:00:00.00</div>

      <div class="time-actions">
        <button class="primary-action" id="stopwatch-start" type="button">Iniciar</button>
        <button class="secondary-action" id="stopwatch-lap" type="button" disabled>Volta</button>
        <button class="secondary-action" id="stopwatch-reset" type="button" disabled>Zerar</button>
      </div>

      <p class="tool-message" id="stopwatch-message" aria-live="polite"></p>

      <div class="time-list" id="stopwatch-laps" hidden>
        <span>Voltas registradas</span>
        <ol></ol>
      </div>
    `);

    setupStopwatch(setToolMessage);
  }

  function setupStopwatch(setToolMessage) {
    const display = document.querySelector("#stopwatch-display");
    const startButton = document.querySelector("#stopwatch-start");
    const lapButton = document.querySelector("#stopwatch-lap");
    const resetButton = document.querySelector("#stopwatch-reset");
    const message = document.querySelector("#stopwatch-message");
    const lapsBox = document.querySelector("#stopwatch-laps");
    const lapsList = lapsBox.querySelector("ol");
    let startedAt = 0;
    let elapsed = 0;
    let running = false;
    let laps = [];

    function update() {
      if (!document.body.contains(display)) {
        clearRunningTimers();
        return;
      }

      const value = running ? elapsed + Date.now() - startedAt : elapsed;
      display.textContent = formatDuration(value, true);
    }

    function renderState() {
      startButton.textContent = running ? "Pausar" : (elapsed > 0 ? "Continuar" : "Iniciar");
      lapButton.disabled = !running;
      resetButton.disabled = elapsed === 0 && !running && laps.length === 0;
      update();
    }

    startButton.addEventListener("click", () => {
      if (running) {
        elapsed += Date.now() - startedAt;
        running = false;
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        setToolMessage(message, "Cronômetro pausado.");
      } else {
        startedAt = Date.now();
        running = true;
        stopwatchInterval = setInterval(update, 40);
        setToolMessage(message, "Cronômetro em andamento.");
      }

      renderState();
    });

    lapButton.addEventListener("click", () => {
      const current = elapsed + Date.now() - startedAt;
      laps = [current, ...laps].slice(0, 12);
      lapsBox.hidden = false;
      lapsList.innerHTML = laps
        .map((lap, index) => `<li><strong>Volta ${laps.length - index}</strong> <span>${formatDuration(lap, true)}</span></li>`)
        .join("");
      setToolMessage(message, "Volta registrada.");
    });

    resetButton.addEventListener("click", () => {
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
      startedAt = 0;
      elapsed = 0;
      running = false;
      laps = [];
      lapsBox.hidden = true;
      lapsList.innerHTML = "";
      setToolMessage(message, "Cronômetro zerado.");
      renderState();
    });

    setToolMessage(message, "Pronto para iniciar.");
    renderState();
  }

  function renderTimerPanel(tool, { renderPanelShell, setToolMessage }) {
    clearRunningTimers();
    renderPanelShell(tool, `
      <p>Configure uma contagem regressiva rápida para tarefas, pausas e lembretes.</p>

      <form class="tool-form" id="timer-form" novalidate>
        <div class="time-input-grid">
          <label for="timer-hours">
            Horas
            <input class="tool-input" id="timer-hours" type="number" min="0" max="99" step="1" value="0">
          </label>

          <label for="timer-minutes">
            Minutos
            <input class="tool-input" id="timer-minutes" type="number" min="0" max="59" step="1" value="5">
          </label>

          <label for="timer-seconds">
            Segundos
            <input class="tool-input" id="timer-seconds" type="number" min="0" max="59" step="1" value="0">
          </label>
        </div>

        <div class="preset-row" aria-label="Tempos prontos">
          <button class="secondary-action" type="button" data-timer-preset="60">1 min</button>
          <button class="secondary-action" type="button" data-timer-preset="300">5 min</button>
          <button class="secondary-action" type="button" data-timer-preset="900">15 min</button>
          <button class="secondary-action" type="button" data-timer-preset="1500">25 min</button>
        </div>

        <div class="time-display" id="timer-display">00:05:00</div>

        <div class="time-actions">
          <button class="primary-action" id="timer-start" type="submit">Iniciar</button>
          <button class="secondary-action" id="timer-reset" type="button" disabled>Zerar</button>
        </div>

        <p class="tool-message" id="timer-message" aria-live="polite"></p>
      </form>
    `);

    setupTimer(setToolMessage);
  }

  function setupTimer(setToolMessage) {
    const form = document.querySelector("#timer-form");
    const hours = document.querySelector("#timer-hours");
    const minutes = document.querySelector("#timer-minutes");
    const seconds = document.querySelector("#timer-seconds");
    const display = document.querySelector("#timer-display");
    const startButton = document.querySelector("#timer-start");
    const resetButton = document.querySelector("#timer-reset");
    const message = document.querySelector("#timer-message");
    const fields = [hours, minutes, seconds];
    let remaining = getDurationFromFields();
    let endsAt = 0;
    let running = false;

    function setFieldsFromSeconds(totalSeconds) {
      const safeSeconds = Math.max(0, Math.floor(totalSeconds));
      hours.value = Math.floor(safeSeconds / 3600);
      minutes.value = Math.floor((safeSeconds % 3600) / 60);
      seconds.value = safeSeconds % 60;
      remaining = safeSeconds * 1000;
      renderState();
    }

    function update() {
      if (!document.body.contains(display)) {
        clearRunningTimers();
        return;
      }

      if (!running) return;
      remaining = Math.max(0, endsAt - Date.now());
      renderState();

      if (remaining === 0) {
        running = false;
        clearInterval(timerInterval);
        timerInterval = null;
        display.classList.add("complete");
        startButton.textContent = "Iniciar";
        resetButton.disabled = false;
        notifyTimerFinished();
        setToolMessage(message, "Tempo finalizado.");
      }
    }

    function renderState() {
      display.textContent = formatDuration(remaining, false);
      display.classList.toggle("complete", remaining === 0 && !running);
      startButton.textContent = running ? "Pausar" : (remaining > 0 && remaining < getDurationFromFields() ? "Continuar" : "Iniciar");
      resetButton.disabled = remaining === getDurationFromFields() && !running;
    }

    function stopRunning() {
      clearInterval(timerInterval);
      timerInterval = null;
      running = false;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (running) {
        remaining = Math.max(0, endsAt - Date.now());
        stopRunning();
        setToolMessage(message, "Timer pausado.");
        renderState();
        return;
      }

      if (remaining <= 0) {
        remaining = getDurationFromFields();
      }

      if (remaining <= 0) {
        setToolMessage(message, "Informe um tempo maior que zero.", true);
        minutes.focus();
        return;
      }

      display.classList.remove("complete");
      endsAt = Date.now() + remaining;
      running = true;
      timerInterval = setInterval(update, 200);
      setToolMessage(message, "Timer em andamento.");
      renderState();
    });

    resetButton.addEventListener("click", () => {
      stopRunning();
      remaining = getDurationFromFields();
      display.classList.remove("complete");
      setToolMessage(message, "Timer zerado.");
      renderState();
    });

    fields.forEach((field) => {
      field.addEventListener("input", () => {
        if (running) return;
        remaining = getDurationFromFields();
        display.classList.remove("complete");
        setToolMessage(message, "Tempo atualizado.");
        renderState();
      });
    });

    document.querySelectorAll("[data-timer-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        if (running) stopRunning();
        setFieldsFromSeconds(Number(button.dataset.timerPreset));
        setToolMessage(message, `Preset de ${button.textContent.trim()} aplicado.`);
      });
    });

    setToolMessage(message, "Defina o tempo e inicie.");
    renderState();

    function getDurationFromFields() {
      const totalSeconds =
        Math.max(0, Number(hours.value) || 0) * 3600 +
        Math.max(0, Number(minutes.value) || 0) * 60 +
        Math.max(0, Number(seconds.value) || 0);

      return Math.floor(totalSeconds) * 1000;
    }
  }

  function renderDaysCounterPanel(tool, { renderPanelShell, setToolMessage }) {
    clearRunningTimers();
    renderPanelShell(tool, `
      <p>Calcule a diferença de dias entre duas datas, com opção de incluir a data final.</p>

      <form class="tool-form" id="days-counter-form" novalidate>
        <div class="unit-row">
          <label for="days-start">
            Data inicial
            <input class="tool-input" id="days-start" type="date">
          </label>

          <span></span>

          <label for="days-end">
            Data final
            <input class="tool-input" id="days-end" type="date">
          </label>
        </div>

        <label class="checkbox-row" for="days-include-end">
          <input id="days-include-end" type="checkbox">
          Incluir a data final na contagem
        </label>

        <div class="split-actions">
          <button class="primary-action" type="submit">Calcular dias</button>
          <button class="secondary-action" id="days-today" type="button">Usar hoje</button>
        </div>

        <p class="tool-message" id="days-message" aria-live="polite"></p>
      </form>

      <div class="salary-result" id="days-result" hidden>
        <span>Total calculado</span>
        <strong id="days-total">0 dias</strong>
      </div>

      <div class="breakdown-grid" id="days-breakdown" hidden></div>
    `);

    setupDaysCounter(setToolMessage);
  }

  function setupDaysCounter(setToolMessage) {
    const form = document.querySelector("#days-counter-form");
    const start = document.querySelector("#days-start");
    const end = document.querySelector("#days-end");
    const includeEnd = document.querySelector("#days-include-end");
    const todayButton = document.querySelector("#days-today");
    const message = document.querySelector("#days-message");
    const result = document.querySelector("#days-result");
    const total = document.querySelector("#days-total");
    const breakdown = document.querySelector("#days-breakdown");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    start.value = toDateInputValue(today);
    end.value = toDateInputValue(tomorrow);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculate();
    });

    [start, end, includeEnd].forEach((field) => {
      field.addEventListener("input", calculate);
    });

    todayButton.addEventListener("click", () => {
      start.value = toDateInputValue(new Date());
      calculate();
      setToolMessage(message, "Data inicial atualizada para hoje.");
    });

    calculate();

    function calculate() {
      if (!start.value || !end.value) {
        setToolMessage(message, "Selecione as duas datas.", true);
        return;
      }

      const startDate = parseDateInput(start.value);
      const endDate = parseDateInput(end.value);
      const direction = endDate >= startDate ? 1 : -1;
      const rawDays = Math.abs(Math.round((endDate - startDate) / 86400000));
      const countedDays = rawDays + (includeEnd.checked ? 1 : 0);
      const businessDays = countBusinessDays(startDate, endDate, includeEnd.checked);
      const weeks = Math.floor(countedDays / 7);
      const remainingDays = countedDays % 7;

      result.hidden = false;
      breakdown.hidden = false;
      total.textContent = `${countedDays} ${countedDays === 1 ? "dia" : "dias"}`;
      breakdown.innerHTML = renderBreakdown([
        ["Dias corridos", `${rawDays} ${rawDays === 1 ? "dia" : "dias"}`],
        ["Dias úteis", `${businessDays} ${businessDays === 1 ? "dia" : "dias"}`],
        ["Semanas", `${weeks} sem. e ${remainingDays} dia${remainingDays === 1 ? "" : "s"}`],
        ["Meses aproximados", formatNumber(countedDays / 30.4375)],
        ["Ordem", direction === 1 ? "Data final depois da inicial" : "Data final antes da inicial"],
        ["Inclusão", includeEnd.checked ? "Data final incluída" : "Data final não incluída"]
      ]);
      setToolMessage(message, "Contagem calculada.");
    }
  }

  function renderBreakdown(items) {
    return items.map(([label, value]) => `
      <div class="breakdown-item">
        <strong>${value}</strong>
        <span>${label}</span>
      </div>
    `).join("");
  }

  function countBusinessDays(startDate, endDate, includeEnd) {
    const direction = endDate >= startDate ? 1 : -1;
    const current = new Date(startDate);
    const last = new Date(endDate);
    let count = 0;

    while ((direction === 1 && current < last) || (direction === -1 && current > last) || (includeEnd && current.getTime() === last.getTime())) {
      const day = current.getUTCDay();
      if (day !== 0 && day !== 6) count++;
      current.setUTCDate(current.getUTCDate() + direction);

      if (!includeEnd && current.getTime() === last.getTime()) break;
    }

    return count;
  }

  function parseDateInput(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDuration(milliseconds, includeCentiseconds) {
    const totalCentiseconds = Math.floor(Math.max(0, milliseconds) / 10);
    const centiseconds = totalCentiseconds % 100;
    const totalSeconds = Math.floor(totalCentiseconds / 100);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    const base = [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0")
    ].join(":");

    return includeCentiseconds ? `${base}.${String(centiseconds).padStart(2, "0")}` : base;
  }

  function notifyTimerFinished() {
    if (navigator.vibrate) navigator.vibrate([180, 80, 180]);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 1
    }).format(value);
  }
})();
