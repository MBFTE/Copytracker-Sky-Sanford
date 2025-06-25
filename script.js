const GITHUB_REPO = "MBFTE/Copytracker-Sky-Sanford";
const DATA_FILE = "data.json";
const BRANCH = "main";

let currentClient = null;
let creatives = {};
let githubToken = null; // Token stored/retrieved from localStorage

// Utility to call GitHub API
async function githubRequest(method, path, body = null) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `token ${githubToken}`,
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(url, options);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(`GitHub API error: ${err.message}`);
  }
  return response.json();
}

// Load data.json from GitHub
async function loadData() {
  try {
    const file = await githubRequest("GET", DATA_FILE);
    const content = atob(file.content);
    creatives = JSON.parse(content);
    if (!currentClient) {
      currentClient = Object.keys(creatives)[0] || null;
    }
    renderClientList();
    if (currentClient) switchClient(currentClient);
  } catch (e) {
    console.error("Failed to load data:", e);
    // Initialize empty data
    creatives = { SkySanford: {} };
    currentClient = "SkySanford";
    await saveData(); // create data.json
    renderClientList();
    switchClient(currentClient);
  }
}

// Save data.json to GitHub (create or update)
async function saveData() {
  try {
    // Get current sha of data.json for update (required by GitHub API)
    let sha = null;
    try {
      const file = await githubRequest("GET", DATA_FILE);
      sha = file.sha;
    } catch {
      sha = null; // file not found, creating new
    }

    const content = btoa(JSON.stringify(creatives, null, 2));
    const body = {
      message: "Update creatives data",
      content,
      branch: BRANCH,
      sha,
    };
    await githubRequest("PUT", DATA_FILE, body);
  } catch (e) {
    alert("Failed to save data. Check token and repo permissions.");
    console.error(e);
  }
}

function renderClientList() {
  const sidebar = document.getElementById("client-list");
  sidebar.innerHTML = "";
  Object.keys(creatives).forEach((client) => {
    const li = document.createElement("li");
    li.className = client === currentClient ? "active" : "";
    li.innerHTML = `
      <span style="flex-grow:1;cursor:pointer;">${client}</span>
      <button title="Delete Client" aria-label="Delete Client">❌</button>
    `;
    li.querySelector("span").onclick = () => switchClient(client);
    li.querySelector("button").onclick = async (e) => {
      e.stopPropagation();
      if (confirm(`Delete client "${client}"? This action cannot be undone.`)) {
        delete creatives[client];
        if (client === currentClient) {
          currentClient = Object.keys(creatives)[0] || null;
        }
        await saveData();
        renderClientList();
        if (currentClient) switchClient(currentClient);
        else document.getElementById("tabs").innerHTML = "";
      }
    };
    sidebar.appendChild(li);
  });
}

function parsePlatform(utm) {
  const u = utm.toLowerCase();
  if (u.includes("facebook")) return "Social";
  if (u.includes("display")) return "Display";
  if (u.includes("ctv")) return "CTV";
  if (u.includes("audio")) return "Audio";
  if (u.includes("tiktok")) return "TikTok";
  return "Other";
}

function getMonthsRange(start, end) {
  const months = [];
  let startMonth = new Date(start).getMonth() + 1;
  let endMonth = new Date(end).getMonth() + 1;
  for (let m = startMonth; m <= endMonth; m++) {
    months.push(`M${m}`);
  }
  return months;
}

async function submitCreative() {
  const name = document.getElementById("creative-name").value.trim();
  const adpiler = document.getElementById("adpiler-link").value.trim();
  const utm = document.getElementById("utm-link").value.trim();
  const status = document.getElementById("status").value;
  const updatedBy = document.getElementById("updated-by").value.trim();
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;

  if (!name || !utm || !startDate || !endDate) {
    alert("Please fill in all required fields (Creative Name, UTM, Start Date, End Date).");
    return;
  }

  const platform = parsePlatform(utm);
  const months = getMonthsRange(startDate, endDate);

  months.forEach((month) => {
    if (!creatives[currentClient][month]) creatives[currentClient][month] = {};
    if (!creatives[currentClient][month][platform]) creatives[currentClient][month][platform] = [];
    creatives[currentClient][month][platform].push({
      name,
      adpiler,
      utm,
      status,
      updatedBy,
      lastUpdated: new Date().toISOString().split("T")[0],
    });
  });

  await saveData();
  renderMonthTabs();
  document.getElementById("creative-form").reset();
}

function renderMonthTabs() {
  const container = document.getElementById("tabs");
  container.innerHTML = "";

  if (!currentClient || !creatives[currentClient]) return;

  // Always show all 12 months, M1 to M12
  for (let i = 1; i <= 12; i++) {
    const month = `M${i}`;
    const section = document.createElement("section");
    section.innerHTML = `<h2>${month}</h2>`;

    const monthData = creatives[currentClient][month] || {};

    ["Social", "Display", "CTV", "Audio", "TikTok", "Other"].forEach((platform) => {
      if (!monthData[platform] || monthData[platform].length === 0) {
        // Render platform header with "No creatives" if empty
        const emptyCard = document.createElement("div");
        emptyCard.className = "platform-card";
        emptyCard.innerHTML = `<h3>${platform}</h3><p><em>No creatives added.</em></p>`;
        section.appendChild(emptyCard);
        return;
      }

      const card = document.createElement("div");
      card.className = "platform-card";
      card.innerHTML = `<h3>${platform}</h3>`;

      const table = document.createElement("table");
      table.innerHTML = `
        <tr>
          <th>Name</th>
          <th>Adpiler</th>
          <th>UTM</th>
          <th>Status</th>
          <th>Updated By</th>
          <th>Last Updated</th>
          <th>Delete</th>
        </tr>
      `;

      monthData[platform].forEach((creative, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td contenteditable="true">${creative.name}</td>
          <td contenteditable="true">${creative.adpiler}</td>
          <td contenteditable="true">${creative.utm}</td>
          <td>
            <select class="status-dropdown">
              <option value="Live" ${creative.status === "Live" ? "selected" : ""}>Live</option>
              <option value="Paused" ${creative.status === "Paused" ? "selected" : ""}>Paused</option>
              <option value="Retired" ${creative.status === "Retired" ? "selected" : ""}>Retired</option>
            </select>
          </td>
          <td contenteditable="true">${creative.updatedBy}</td>
          <td>${creative.lastUpdated}</td>
          <td><button class="delete-btn">🗑️</button></td>
        `;

        // Save changes on blur or change
        const saveCellChanges = () => {
          creative.name = tr.children[0].innerText.trim();
          creative.adpiler = tr.children[1].innerText.trim();
          creative.utm = tr.children[2].innerText.trim();
          creative.status = tr.querySelector(".status-dropdown").value;
          creative.updatedBy = tr.children[4].innerText.trim();
          creative.lastUpdated = new Date().toISOString().split("T")[0];
          saveData();
        };

        tr.children[0].addEventListener("blur", saveCellChanges);
        tr.children[1].addEventListener("blur", saveCellChanges);
        tr.children[2].addEventListener("blur", saveCellChanges);
        tr.querySelector(".status-dropdown").addEventListener("change", () => {
          creative.status = tr.querySelector(".status-dropdown").value;
          creative.lastUpdated = new Date().toISOString().split("T")[0];
          saveData();
          renderMonthTabs(); // Update badge colors
        });
        tr.children[4].addEventListener("blur", saveCellChanges);

        // Delete creative
        tr.querySelector(".delete-btn").addEventListener("click", async () => {
          if (confirm("Delete this creative?")) {
            monthData[platform].splice(index, 1);
            await saveData();
            renderMonthTabs();
          }
        });

        table.appendChild(tr);
      });

      card.appendChild(table);
      section.appendChild(card);
    });

    container.appendChild(section);
  }
}

function updateCurrentClient(name) {
  currentClient = name;
  document.getElementById("current-client").innerText = name;
}

async function switchClient(name) {
  updateCurrentClient(name);
  renderMonthTabs();
}

window.addClient = async function () {
  const name = prompt("Enter new client name:");
  if (!name || creatives[name]) {
    alert("Client name is empty or already exists.");
    return;
  }
  creatives[name] = {};
  await saveData();
  renderClientList();
  switchClient(name);
};

function renderClientList() {
  const sidebar = document.getElementById("client-list");
  sidebar.innerHTML = "";
  Object.keys(creatives).forEach((client) => {
    const li = document.createElement("li");
    li.className = client === currentClient ? "active" : "";
    li.innerHTML = `
      <span style="flex-grow:1;cursor:pointer;">${client}</span>
      <button title="Delete Client">❌</button>
    `;
    li.querySelector("span").onclick = () => switchClient(client);
    li.querySelector("button").onclick = async (e) => {
      e.stopPropagation();
      if (confirm(`Delete client "${client}"? This action cannot be undone.`)) {
        delete creatives[client];
        if (client === currentClient) {
          const remaining = Object.keys(creatives);
          if (remaining.length > 0) {
            await switchClient(remaining[0]);
          } else {
            currentClient = null;
            document.getElementById("tabs").innerHTML = "";
          }
        }
        await saveData();
        renderClientList();
      }
    };
    sidebar.appendChild(li);
  });
}

window.onload = async () => {
  githubToken = localStorage.getItem("githubToken");
  if (!githubToken) {
    githubToken = prompt("Please enter your GitHub personal access token:");
    if (githubToken) {
      localStorage.setItem("githubToken", githubToken);
    } else {
      alert("GitHub token is required to load data.");
      return;
    }
  }
  await loadData();
  renderClientList();
  if (currentClient) switchClient(currentClient);
};
