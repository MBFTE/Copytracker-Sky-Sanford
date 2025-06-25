
document.addEventListener("DOMContentLoaded", () => {
  const clientList = document.getElementById("clientList");
  const clientHeader = document.getElementById("clientHeader");
  const creativeForm = document.getElementById("creativeForm");
  const monthTabs = document.getElementById("monthTabs");
  const platformTables = document.getElementById("platformTables");

  let currentClient = "SkySanford";
  let creatives = JSON.parse(localStorage.getItem("creatives") || "{}");

  function saveData() {
    localStorage.setItem("creatives", JSON.stringify(creatives));
  }

  window.switchClient = function (client) {
    currentClient = client;
    document.querySelectorAll(".client").forEach(c => c.classList.remove("active"));
    const match = [...clientList.children].find(li => li.textContent.includes(client));
    if (match) match.classList.add("active");
    clientHeader.textContent = client;
    renderTabs();
  };

  window.addClient = function () {
    const name = prompt("Enter new client name:");
    if (name && !creatives[name]) {
      creatives[name] = {};
      saveData();
      renderClientList();
      switchClient(name);
    }
  };

  function renderClientList() {
    clientList.innerHTML = "";
    const clients = Object.keys(creatives);
    if (clients.length === 0) {
      creatives["SkySanford"] = {};
      saveData();
    }
    Object.keys(creatives).forEach(client => {
      const li = document.createElement("li");
      li.className = "client";
      li.textContent = client;
      li.onclick = () => switchClient(client);

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.style.marginLeft = "10px";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Delete client "${client}"?`)) {
          delete creatives[client];
          saveData();
          renderClientList();
          currentClient = Object.keys(creatives)[0] || "";
          if (currentClient) switchClient(currentClient);
        }
      };

      li.appendChild(delBtn);
      clientList.appendChild(li);
    });

    const addLi = document.createElement("li");
    addLi.className = "add-client";
    addLi.innerHTML = "<button>Add New Client</button>";
    addLi.onclick = addClient;
    clientList.appendChild(addLi);

    // Switch to default client if exists
    if (clients.length > 0) {
      switchClient(currentClient);
    }
  }

  function renderTabs() {
    monthTabs.innerHTML = "";
    platformTables.innerHTML = "";
    const months = creatives[currentClient] || {};
    Object.keys(months).sort().forEach(month => {
      const tab = document.createElement("div");
      tab.className = "tab";
      tab.textContent = month;
      tab.onclick = () => renderMonth(month);
      monthTabs.appendChild(tab);
    });
  }

  function renderMonth(month) {
    platformTables.innerHTML = "";
    const data = creatives[currentClient][month] || {};
    ["Facebook", "Display", "CTV", "Audio", "TikTok"].forEach(platform => {
      if (!data[platform]) return;
      const table = document.createElement("table");
      const thead = `<tr><th>Name</th><th>Adpiler</th><th>UTM</th><th>Status</th><th>Updated By</th><th>Actions</th></tr>`;
      table.innerHTML = `<caption>${platform}</caption><thead>${thead}</thead><tbody></tbody>`;
      data[platform].forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td contenteditable="true">${item.name}</td>
          <td contenteditable="true">${item.adpiler}</td>
          <td contenteditable="true">${item.utm}</td>
          <td>
            <select class="status-dropdown">
              <option value="Live" ${item.status === "Live" ? "selected" : ""}>Live</option>
              <option value="Paused" ${item.status === "Paused" ? "selected" : ""}>Paused</option>
              <option value="Retired" ${item.status === "Retired" ? "selected" : ""}>Retired</option>
            </select>
          </td>
          <td contenteditable="true">${item.updatedBy}</td>
          <td><button onclick="this.closest('tr').remove();">🗑️</button></td>
        `;
        table.querySelector("tbody").appendChild(tr);
      });
      platformTables.appendChild(table);
    });
  }

  creativeForm.addEventListener("submit", e => {
    e.preventDefault();
    const month = document.getElementById("monthDropdown").value;
    const name = document.getElementById("creativeName").value;
    const adpiler = document.getElementById("adpilerLink").value;
    const utm = document.getElementById("utmUrl").value;
    const status = document.getElementById("status").value;
    const updatedBy = document.getElementById("updatedBy").value;

    const platform = utm.includes("facebook") ? "Facebook"
                    : utm.includes("tiktok") ? "TikTok"
                    : utm.includes("audio") ? "Audio"
                    : utm.includes("ctv") ? "CTV"
                    : "Display";

    creatives[currentClient] = creatives[currentClient] || {};
    creatives[currentClient][month] = creatives[currentClient][month] || {};
    creatives[currentClient][month][platform] = creatives[currentClient][month][platform] || [];
    creatives[currentClient][month][platform].push({ name, adpiler, utm, status, updatedBy });
    saveData();
    renderTabs();
    creativeForm.reset();
  });

  document.querySelector(".add-btn").onclick = () => creativeForm.scrollIntoView({ behavior: 'smooth' });

  renderClientList();
});
