
function addRow(tableId) {
  const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
  const row = table.insertRow();
  for (let i = 0; i < 5; i++) {
    const cell = row.insertCell();
    cell.contentEditable = true;
  }
  saveData();
}

function clearAll() {
  if (confirm("Are you sure you want to clear all data?")) {
    document.querySelectorAll("table tbody").forEach(tbody => tbody.innerHTML = "");
    localStorage.clear();
  }
}

function saveData() {
  const data = {};
  document.querySelectorAll("table").forEach(table => {
    const id = table.id;
    const rows = [];
    table.querySelectorAll("tbody tr").forEach(tr => {
      const cells = Array.from(tr.children).map(td => td.innerText.trim());
      rows.push(cells);
    });
    data[id] = rows;
  });
  localStorage.setItem("creativeData", JSON.stringify(data));
}

function loadData() {
  const data = JSON.parse(localStorage.getItem("creativeData") || "{}");
  Object.keys(data).forEach(tableId => {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    table.innerHTML = "";
    data[tableId].forEach(rowData => {
      const row = table.insertRow();
      rowData.forEach(cellData => {
        const cell = row.insertCell();
        cell.contentEditable = true;
        cell.innerText = cellData;
      });
    });
  });
}

window.onload = function() {
  loadData();
  document.querySelectorAll("table").forEach(table =>
    table.addEventListener("input", saveData)
  );
};
