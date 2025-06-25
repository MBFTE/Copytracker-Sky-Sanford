
const platforms = ["facebook", "display", "ctv", "audio", "tiktok"];

document.getElementById("creativeForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const data = {
    month: document.getElementById("month").value.trim(),
    creativeName: document.getElementById("creativeName").value.trim(),
    adpilerLink: document.getElementById("adpilerLink").value.trim(),
    updatedBy: document.getElementById("updatedBy").value.trim(),
    status: document.getElementById("status").value.trim(),
    updatedAt: new Date().toISOString(),
  };

  platforms.forEach(p => {
    data[p] = document.getElementById(p + "Url").value.trim();
  });

  let all = JSON.parse(localStorage.getItem("creativeData") || "{}");
  if (!all[data.month]) all[data.month] = [];
  all[data.month].push(data);
  localStorage.setItem("creativeData", JSON.stringify(all));

  this.reset();
  renderTabs();
  renderContent(data.month);
});

function renderTabs() {
  const all = JSON.parse(localStorage.getItem("creativeData") || "{}");
  const tabContainer = document.getElementById("tabs");
  tabContainer.innerHTML = "";
  Object.keys(all).sort().forEach((month, i) => {
    const btn = document.createElement("button");
    btn.className = "tab-button" + (i === 0 ? " active" : "");
    btn.innerText = month;
    btn.onclick = () => {
      document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderContent(month);
    };
    tabContainer.appendChild(btn);
  });
}

function renderContent(month) {
  const wrapper = document.getElementById("content");
  wrapper.innerHTML = "";
  const all = JSON.parse(localStorage.getItem("creativeData") || "{}");
  const monthData = (all[month] || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  platforms.forEach(platform => {
    const section = document.createElement("div");
    section.className = "section active";
    const title = platform.charAt(0).toUpperCase() + platform.slice(1);
    section.innerHTML = "<h2>" + month + " - " + title + "</h2>";
    const table = document.createElement("table");
    table.innerHTML = `
      <thead><tr>
        <th>Creative Name</th><th>Adpiler Link</th><th>${title} UTM</th>
        <th>Status</th><th>Updated By</th><th>Last Updated</th>
      </tr></thead><tbody></tbody>`;
    monthData.forEach(entry => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.creativeName}</td>
        <td><a href="${entry.adpilerLink}" target="_blank">Adpiler</a></td>
        <td><a href="${entry[platform]}" target="_blank">${entry[platform]}</a></td>
        <td>${entry.status}</td>
        <td>${entry.updatedBy}</td>
        <td>${new Date(entry.updatedAt).toLocaleString()}</td>
      `;
      table.querySelector("tbody").appendChild(row);
    });
    section.appendChild(table);
    wrapper.appendChild(section);
  });
}

window.onload = function() {
  renderTabs();
  const firstTab = document.querySelector(".tab-button");
  if (firstTab) renderContent(firstTab.innerText);
};
