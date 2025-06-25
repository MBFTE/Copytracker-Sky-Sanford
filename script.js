
const months = [
  "M1", "M2", "M3", "M4", "M5", "M6",
  "M7", "M8", "M9", "M10", "M11", "M12"
];
const platforms = ["facebook", "display", "ctv", "audio", "tiktok"];

document.getElementById("creativeForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const creativeName = document.getElementById("creativeName").value.trim();
  const month = (creativeName.match(/M\d+/i) || ["M1"])[0].toUpperCase();
  const utmUrl = document.getElementById("utmUrl").value.trim();
  const platform = detectPlatformFromUTM(utmUrl);

  const entry = {
    month: month,
    creativeName: creativeName,
    startDate: document.getElementById("startDate").value.trim(),
    endDate: document.getElementById("endDate").value.trim(),
    adpilerLink: document.getElementById("adpilerLink").value.trim(),
    status: document.getElementById("status").value.trim(),
    updatedBy: document.getElementById("updatedBy").value.trim(),
    utmUrl: utmUrl,
    platform: platform,
    updatedAt: new Date().toISOString()
  };

  let all = JSON.parse(localStorage.getItem("creativeData") || "{}");
  if (!all[month]) all[month] = [];
  all[month].push(entry);
  localStorage.setItem("creativeData", JSON.stringify(all));

  this.reset();
  renderTabs();
  renderTables(month);
});

function detectPlatformFromUTM(url) {
  const lower = url.toLowerCase();
  if (lower.includes("facebook")) return "facebook";
  if (lower.includes("display")) return "display";
  if (lower.includes("ctv")) return "ctv";
  if (lower.includes("audio")) return "audio";
  if (lower.includes("tiktok")) return "tiktok";
  return "unknown";
}

function renderTabs() {
  const tabContainer = document.getElementById("monthTabs");
  tabContainer.innerHTML = "";
  months.forEach((month, i) => {
    const tab = document.createElement("div");
    tab.className = "tab" + (i === 5 ? " active" : ""); // default M6
    tab.textContent = month;
    tab.onclick = () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderTables(month);
    };
    tabContainer.appendChild(tab);
  });
}

function renderTables(month) {
  const container = document.getElementById("platformTables");
  container.innerHTML = "";
  const data = JSON.parse(localStorage.getItem("creativeData") || "{}");
  const entries = (data[month] || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  platforms.forEach(platform => {
    const section = document.createElement("section");
    section.className = "platform-section";
    const table = document.createElement("table");
    table.innerHTML = `
      <caption>${month} - ${platform.toUpperCase()}</caption>
      <thead><tr>
        <th>Creative</th><th>Start</th><th>End</th><th>Status</th>
        <th>Adpiler</th><th>Click URL</th><th>Updated By</th><th>Last Updated</th>
      </tr></thead><tbody></tbody>`;
    entries.filter(e => e.platform === platform).forEach(entry => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.creativeName}</td>
        <td>${entry.startDate}</td>
        <td>${entry.endDate}</td>
        <td>${entry.status}</td>
        <td><a href="${entry.adpilerLink}" target="_blank">View</a></td>
        <td><a href="${entry.utmUrl}" target="_blank">${entry.utmUrl}</a></td>
        <td>${entry.updatedBy}</td>
        <td>${new Date(entry.updatedAt).toLocaleDateString()}</td>
      `;
      table.querySelector("tbody").appendChild(row);
    });
    section.appendChild(table);
    container.appendChild(section);
  });
}

window.onload = function() {
  renderTabs();
  renderTables("M6");
};
