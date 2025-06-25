
const platforms = ["facebook", "display", "ctv", "audio", "tiktok"];

document.getElementById("creativeForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const entry = {
    month: document.getElementById("month").value.trim(),
    startDate: document.getElementById("startDate").value.trim(),
    endDate: document.getElementById("endDate").value.trim(),
    creativeName: document.getElementById("creativeName").value.trim(),
    adpilerLink: document.getElementById("adpilerLink").value.trim(),
    updatedBy: document.getElementById("updatedBy").value.trim(),
    status: document.getElementById("status").value.trim(),
    updatedAt: new Date().toISOString()
  };

  platforms.forEach(p => {
    entry[p] = document.getElementById(p + "Url").value.trim();
  });

  let all = JSON.parse(localStorage.getItem("creativeData") || "{}");
  if (!all[entry.month]) all[entry.month] = [];
  all[entry.month].push(entry);
  localStorage.setItem("creativeData", JSON.stringify(all));

  this.reset();
  renderTabs();
  renderTables(entry.month);
});

function renderTabs() {
  const all = JSON.parse(localStorage.getItem("creativeData") || "{}");
  const tabContainer = document.getElementById("monthTabs");
  tabContainer.innerHTML = "";
  Object.keys(all).sort().forEach((month, i) => {
    const tab = document.createElement("span");
    tab.className = "tab" + (i === 0 ? " active" : "");
    tab.innerText = month;
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
  const monthData = (data[month] || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  platforms.forEach(platform => {
    const section = document.createElement("div");
    section.className = "platform-section active";
    const table = document.createElement("table");
    table.innerHTML = `
      <caption><strong>${month} - ${platform.toUpperCase()}</strong></caption>
      <thead>
        <tr>
          <th>Creative Name</th><th>Start</th><th>End</th><th>Status</th>
          <th>Adpiler</th><th>Click URL</th><th>Updated By</th><th>Last Updated</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    monthData.forEach(entry => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.creativeName}</td>
        <td>${entry.startDate}</td>
        <td>${entry.endDate}</td>
        <td>${entry.status}</td>
        <td><a href="${entry.adpilerLink}" target="_blank">Link</a></td>
        <td><a href="${entry[platform]}" target="_blank">${entry[platform]}</a></td>
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
  const firstTab = document.querySelector(".tab");
  if (firstTab) renderTables(firstTab.innerText);
};
