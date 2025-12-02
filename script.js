// SIMULATION
function setupSimulation() {
  const form = document.querySelector("#sim-form");
  const canvas = document.querySelector("#simChart");
  if (!form || !canvas) return;

  let chart = null;

  function compound(capital, monthly, years, rate) {
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    let value = capital;
    let invested = capital;
    const points = [];

    for (let m = 0; m <= months; m++) {
      if (m > 0) {
        value = value * (1 + monthlyRate) + monthly;
        invested += monthly;
      }
      points.push({ t: m / 12, v: value });
    }
    return { invested, value, points };
  }

  function updateBox(prefix, data) {
    const investedEl = document.querySelector(`#${prefix}-invested`);
    const valueEl = document.querySelector(`#${prefix}-value`);
    const perfEl = document.querySelector(`#${prefix}-perf`);

    investedEl.textContent =
      data.invested.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
    valueEl.textContent =
      data.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
    const perf = data.value - data.invested;
    perfEl.textContent =
      perf.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const capital = Number(document.querySelector("#capital").value || 0);
    const monthly = Number(document.querySelector("#monthly").value || 0);
    const years = Number(document.querySelector("#years").value || 0);
    const rate = Number(document.querySelector("#rate").value || 0);

    if (!capital || !years) return;

    const pessRate = rate - 2;
    const optRate = rate + 2;

    const pess = compound(capital, monthly, years, pessRate);
    const med = compound(capital, monthly, years, rate);
    const opt = compound(capital, monthly, years, optRate);

    updateBox("pess", pess);
    updateBox("med", med);
    updateBox("opt", opt);

    const labels = med.points.map((p) => p.t.toFixed(1));
    const pessData = pess.points.map((p) => p.v);
    const medData = med.points.map((p) => p.v);
    const optData = opt.points.map((p) => p.v);

    if (chart) chart.destroy();

    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Pessimiste",
            data: pessData,
            borderColor: "#f97373",
            tension: 0.25,
            borderWidth: 1.3,
            pointRadius: 0,
          },
          {
            label: "Médian",
            data: medData,
            borderColor: "#22c55e",
            tension: 0.25,
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            label: "Optimiste",
            data: optData,
            borderColor: "#38bdf8",
            tension: 0.25,
            borderWidth: 1.5,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#e5e7eb", font: { size: 11 } },
          },
        },
        scales: {
          x: {
            ticks: { color: "#9ca3af", maxTicksLimit: 7 },
            grid: { color: "rgba(55,65,81,0.6)" },
          },
          y: {
            ticks: {
              color: "#9ca3af",
              callback: (v) =>
                v.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €",
            },
            grid: { color: "rgba(55,65,81,0.6)" },
          },
        },
      },
    });
  });
}

// ASSISTANT
function setupAssistant() {
  const log = document.querySelector("#chat-log");
  const form = document.querySelector("#chat-form");
  const input = document.querySelector("#chat-input");
  const faqContainer = document.querySelector("#faq-tags");
  if (!log || !form || !input || !faqContainer) return;

  const faq = {
    "Livret vs ETF long terme": `Un livret protège le capital nominal et reste liquide, mais son rendement est limité, surtout après inflation. Un ETF actions diversifié accepte la volatilité pour viser une rémunération supérieure sur un horizon long (8–15 ans). La question centrale : de quel argent parle-t-on et pour quel horizon ?`,
    "Place de la crypto": `Dans notre approche, la crypto est traitée comme une poche expérimentale, jamais au cœur d'un patrimoine. Taille limitée, argent dont on peut se passer, horizon long, et surtout aucune confusion entre volatilité spectaculaire et stratégie d'investissement.`,
    "Horizon de placement": `Plus l'horizon est long, plus il est raisonnable d'accepter la volatilité à court terme. En dessous de 3–5 ans, il est délicat de s'exposer fortement aux actions. Au-delà de 8–10 ans, un portefeuille diversifié peut absorber plus de variations.`,
    "ETF monde": `Un ETF monde permet de s'exposer à plusieurs centaines d'entreprises internationales via une seule ligne. C'est un outil simple pour travailler la diversification géographique et sectorielle, sans choisir des titres individuellement.`,
    "Risque & tolérance": `Il y a le risque "sur le papier" (volatilité des prix) et le risque réel de vendre au mauvais moment car on n'avait pas l'horizon ou la tolérance. Un bon point de départ : ne pas exposer en actifs volatils l'argent dont on a besoin à court terme.`,
  };

  function append(text, from) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${from}`;
    bubble.textContent = text;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  }

  function answer(question) {
    const key = Object.keys(faq).find((k) =>
      question.toLowerCase().includes(k.split(" ")[0].toLowerCase())
    );
    if (key) {
      append(faq[key], "bot");
    } else {
      append(
        "Pour l’instant, je réponds avec une base pédagogique fixe : horizon, rôle du cash, diversification, risque. Plus tard, ce composant pourra être relié à une API d’IA côté serveur pour un traitement plus fin de ta situation.",
        "bot"
      );
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    append(q, "user");
    input.value = "";
    setTimeout(() => answer(q), 350);
  });

  Object.keys(faq).forEach((label) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      append(label, "user");
      setTimeout(() => append(faq[label], "bot"), 300);
    });
    faqContainer.appendChild(btn);
  });
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  setupSimulation();
  setupAssistant();
});
