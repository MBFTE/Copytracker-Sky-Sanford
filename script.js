
const platforms = ["facebook", "display", "ctv", "audio", "tiktok"];

document.getElementById("creativeForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("creativeName").value.trim();
  const startDate = new Date(document.getElementById("startDate").value.trim());
  const endDate = new Date(document.getElementById("endDate").value.trim() || startDate);
  const adpilerLink = document.getElementById("adpilerLink").value.trim();
  const updatedBy = document.getElementById("updatedBy").value.trim();
  const utmUrl = document.getElementById("utmUrl").value.trim();
  const status = document.getElementById("status").value;
  const months = getMonthRange(startDate, endDate);
  const platform = detectPlatformFromUTM(utmUrl);

  const entry = {
    creativeName: name,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    adpilerLink: adpilerLink,
    utmUrl: utmUrl,
    platform: platform,
    updatedBy: updatedBy,
    status: status,
    updatedAt: new Date().toISOString()
  };

  let all = JSON.parse(localStorage.getItem("creativeData") || "{}");
  months.forEach(m => {
    if (!all[m]) all[m] = [];
    all[m].push(entry);
  });
  localStorage.setItem("creativeData", JSON.stringify(all));

  this.reset();
  renderTabs();
  renderTables(months[0]);
});

function detectPlatformFromUTM(url) {
  const u = url.toLowerCase();
  if (u.includes("facebook")) return "facebook";
  if (u.includes("display")) return "display";
  if (u.includes("ctv")) return "ctv";
  if (u.includes("audio")) return "audio";
  if (u.includes("tiktok")) return "tiktok";
  return "unknown";
}

function getMonthRange(start, end) {
  const months = [];
  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    months.push("M" + (d.getMonth() + 1));
  }
  return months;
}

function renderTabs() {
  const data = JSON.parse(localStorage.getItem("creativeData") || "{}");
  const tabContainer = document.getElementById("monthTabs");
  tabContainer.innerHTML = "";
  Object.keys(data).sort().forEach((month, i) => {
    const tab = document.createElement("div");
    tab.className = "tab" + (i === 0 ? " active" : "");
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
  const entries = data[month] || [];

  platforms.forEach(platform => {
    const platformEntries = entries.filter(e => e.platform === platform);
    if (platformEntries.length === 0) return;

    const section = document.createElement("section");
    section.className = "platform-section";
    const table = document.createElement("table");
    table.innerHTML = `
      <caption>${month} - ${platform.toUpperCase()}</caption>
      <thead><tr>
        <th>Creative</th><th>Start</th><th>End</th><th>Status</th>
        <th>Adpiler</th><th>Click URL</th><th>Updated By</th><th>Last Updated</th>
      </tr></thead><tbody></tbody>`;

    platformEntries.forEach((entry, idx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td contenteditable="true">${entry.creativeName}</td>
        <td contenteditable="true">${entry.startDate}</td>
        <td contenteditable="true">${entry.endDate}</td>
        <td contenteditable="true">${entry.status}</td>
        <td><a href="${entry.adpilerLink}" target="_blank">View</a></td>
        <td><a href="${entry.utmUrl}" target="_blank">${entry.utmUrl}</a></td>
        <td contenteditable="true">${entry.updatedBy}</td>
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
  const firstTab = document.querySelector(".tab");
  if (firstTab) renderTables(firstTab.textContent);
};
