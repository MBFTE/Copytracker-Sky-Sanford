let currentClient = "SkySanford";
let creatives = JSON.parse(localStorage.getItem("creatives")) || {};

function saveData() {
  localStorage.setItem("creatives", JSON.stringify(creatives));
}

window.switchClient = function(clientName) {
  currentClient = clientName;
  document.getElementById("current-client").innerText = clientName;
  renderMonthTabs();
};

window.addClient = function() {
  const name = prompt("Enter new client name:");
  if (name && !creatives[name]) {
    creatives[name] = {};
    saveData();
    renderClientList();
    switchClient(name);
  }
};

window.deleteClient = function(clientName) {
  if (confirm(`Delete client "${clientName}"? This cannot be undone.`)) {
    delete creatives[clientName];
    saveData();
    renderClientList();
    const firstClient = Object.keys(creatives)[0];
    if (firstClient) {
      switchClient(firstClient);
    } else {
      currentClient = null;
      document.getElementById("tabs").innerHTML = "";
    }
  }
};

function parsePlatform(utm) {
  utm = utm.toLowerCase();
  if (utm.includes("facebook")) return "Social";
  if (utm.includes("display")) return "Display";
  if (utm.includes("ctv")) return "CTV";
  if (utm.includes("audio")) return "Audio";
  if (utm.includes("tiktok")) return "TikTok";
  return "Unknown";
}

function getMonthRange(start, end) {
  const months = [];
  const startMonth = parseInt(start.split("-")[1]);
  const endMonth = parseInt(end.split("-")[1]);
  for (let m = startMonth; m <= endMonth; m++) {
    months.push("M" + m);
  }
  return months;
}

window.submitCreative = function() {
  const name = document.getElementById("creative-name").value.trim();
  const adpiler = document.getElementById("adpiler-link").value.trim();
  const utm = document.getElementById("utm-link").value.trim();
  const status = document.getElementById("status").value;
  const updatedBy = document.getElementById("updated-by").value.trim();
  const start = document.getElementById("start-date").value;
  const end = document.getElementById("end-date").value;

  if (!name || !utm || !start || !end) {
    alert("Creative name, UTM link, and dates are required.");
    return;
  }

  const months = getMonthRange(start, end);
  const platform = parsePlatform(utm);
  const creative = {
    name, adpiler, utm, status, updatedBy, platform,
    lastUpdated: new Date().toISOString().split("T")[0]
  };

  months.forEach(month => {
    if (!creatives[currentClient][month]) creatives[currentClient][month] = {};
    if (!creatives[currentClient][month][platform]) creatives[currentClient][month][platform] = [];
    creatives[currentClient][month][platform].push(creative);
  });

  saveData();
  renderMonthTabs();
  document.getElementById("creative-form").reset();
};

function renderMonthTabs() {
  const container = document.getElementById("tabs");
  container.innerHTML = "";
  if (!creatives[currentClient]) return;

  Object.keys(creatives[currentClient])
    .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
    .forEach(month => {
      const section = document.createElement("section");
      section.innerHTML = `<h2>${month}</h2>`;
      const monthData = creatives[currentClient][month];

      ["Social", "Display", "CTV", "Audio", "TikTok"].forEach(platform => {
        if (!monthData[platform] || monthData[platform].length === 0) return;
        const card = document.createElement("div");
        card.className = "platform-card";
        card.innerHTML = `<h3>${platform}</h3>`;
        const table = document.createElement("table");
        table.innerHTML = `
          <tr><th>Name</th><th>Adpiler</th><th>UTM</th><th>Status</th><th>Updated By</th><th>Date</th><th>Delete</th></tr>`;
        
        monthData[platform].forEach((c, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td contenteditable="true">${c.name}</td>
            <td contenteditable="true">${c.adpiler}</td>
            <td contenteditable="true">${c.utm}</td>
            <td>
              <select onchange="updateStatus('${month}', '${platform}', ${index}, this.value)">
                <option value="Live" ${c.status === "Live" ? "selected" : ""}>Live</option>
                <option value="Paused" ${c.status === "Paused" ? "selected" : ""}>Paused</option>
                <option value="Retired" ${c.status === "Retired" ? "selected" : ""}>Retired</option>
              </select>
            </td>
            <td contenteditable="true">${c.updatedBy}</td>
            <td>${c.lastUpdated}</td>
            <td><button onclick="deleteCreative('${month}', '${platform}', ${index})">🗑️</button></td>
          `;
          table.appendChild(row);
        });

        card.appendChild(table);
        section.appendChild(card);
      });

      container.appendChild(section);
    });
}

window.updateStatus = function(month, platform, index, newStatus) {
  creatives[currentClient][month][platform][index].status = newStatus;
  saveData();
};

window.deleteCreative = function(month, platform, index) {
  if (confirm("Delete this creative?")) {
    creatives[currentClient][month][platform].splice(index, 1);
    saveData();
    renderMonthTabs();
  }
};

function renderClientList() {
  const sidebar = document.getElementById("client-list");
  sidebar.innerHTML = "";
  Object.keys(creatives).forEach(client => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span onclick="switchClient('${client}')">${client}</span>
      <button onclick="deleteClient('${client}')">❌</button>`;
    sidebar.appendChild(li);
  });
}

window.onload = () => {
  if (Object.keys(creatives).length === 0) {
    creatives["SkySanford"] = {};
    saveData();
  }
  renderClientList();
  switchClient(currentClient);
};
