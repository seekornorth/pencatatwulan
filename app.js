const API_URL =
"https://script.google.com/macros/s/AKfycbzR8tcylwRF0pDhWWBSRa56Y50kj2xDRxatqfbIN7Lq8CjlBA6jJmNbyugLN1x4CBP_/exec";

const form = document.getElementById("formTransaksi");
const transactionList = document.getElementById("transactionList");

const modal = document.getElementById("modal");
const fab = document.getElementById("fab");
const closeModal = document.getElementById("closeModal");

const tabs = document.querySelectorAll(".tab");

let chart;
let allTransactions = [];
let currentFilter = "all";

/* =========================
MODAL
========================= */

fab.addEventListener("click", () => {

document.getElementById(
"transaksiId"
).value = "";

form.reset();

modal.classList.add("show");
});

closeModal.addEventListener("click", () => {
modal.classList.remove("show");
});

modal.addEventListener("click", (e) => {

if (e.target === modal) {
modal.classList.remove("show");
}
});

/* =========================
FORMAT
========================= */

function rupiah(value) {

return "Rp " +
Number(value)
.toLocaleString("id-ID");
}

/* =========================
CHART KATEGORI
========================= */

function renderCategoryChart(data) {

const expenseData = {};

data.forEach(item => {


if (item.jenis !== "Keluar")
  return;

const kategori =
  item.kategori || "Lainnya";

expenseData[kategori] =
  (expenseData[kategori] || 0)
  + Number(item.nominal);


});

const labels =
Object.keys(expenseData);

const values =
Object.values(expenseData);

const ctx =
document
.getElementById("moneyChart")
.getContext("2d");

if (chart) {
chart.destroy();
}

chart = new Chart(ctx, {


type: "doughnut",

data: {

  labels,

  datasets: [{

    data: values,

    backgroundColor: [
      "#ec4899",
      "#22c55e",
      "#3b82f6",
      "#f97316",
      "#a855f7",
      "#eab308",
      "#ef4444"
    ],

    borderWidth: 0
  }]
},

options: {

  responsive: true,

  plugins: {

    legend: {

      position: "bottom",

      labels: {
        color: "#fff"
      }
    }
  }
}


});
}

/* =========================
TOP EXPENSES
========================= */

function renderTopExpenses() {

const summary = {};

allTransactions.forEach(item => {


if (item.jenis !== "Keluar")
  return;

summary[item.kategori] =
  (summary[item.kategori] || 0)
  + Number(item.nominal);


});

const sorted =
Object.entries(summary)
.sort((a, b) => b[1] - a[1])
.slice(0, 5);

const container =
document.getElementById(
"topExpenseList"
);

container.innerHTML = "";

sorted.forEach(item => {


container.innerHTML += `

  <div
    class="top-expense-item"
  >

    <span>
      ${item[0]}
    </span>

    <strong>
      ${rupiah(item[1])}
    </strong>

  </div>

`;


});
}

/* =========================
CARD TRANSAKSI
========================= */

function transactionCard(item) {

const income =
item.jenis === "Masuk";

return `


<div
  class="transaction-card"
>

  <div
    class="transaction-top"
  >

    <div>

      <div
        class="transaction-category"
      >
        ${item.kategori}
      </div>

      <div
        class="transaction-date"
      >
        ${item.tanggal}
      </div>

    </div>

    <div
      class="
        transaction-amount
        ${income
          ? "income"
          : "expense"}
      "
    >

      ${income ? "+" : "-"}

      ${rupiah(
        item.nominal
      )}

    </div>

  </div>

  <div
    class="transaction-bottom"
  >

    <span>
      ${item.catatan || "-"}
    </span>

    <div class="actions">

      <button
        class="edit-btn"
        onclick="editTransaction('${item.id}')"
      >
        ✏️
      </button>

      <button
        class="delete-btn"
        onclick="deleteTransaction('${item.id}')"
      >
        🗑️
      </button>

    </div>

  </div>

</div>


`;
}

/* =========================
RENDER TRANSAKSI
========================= */

function renderTransactions() {

transactionList.innerHTML = "";

let filtered =
allTransactions;

if (
currentFilter !== "all"
) {


filtered =
  allTransactions.filter(
    item =>
      item.jenis ===
      currentFilter
  );


}

if (
filtered.length === 0
) {


transactionList.innerHTML =
  `
  <div class="card">
    Belum ada transaksi 🌸
  </div>
  `;

return;


}

filtered.forEach(item => {


transactionList.innerHTML +=
  transactionCard(item);


});
}

/* =========================
EDIT
========================= */

window.editTransaction =
function(id) {

const item =
allTransactions.find(
t =>
String(t.id)
=== String(id)
);

if (!item) return;

document.getElementById(
"transaksiId"
).value = item.id;

document.getElementById(
"tanggal"
).value = item.tanggal;

document.getElementById(
"jenis"
).value = item.jenis;

document.getElementById(
"kategori"
).value = item.kategori;

document.getElementById(
"nominal"
).value = item.nominal;

document.getElementById(
"catatan"
).value = item.catatan;

modal.classList.add("show");
};

/* =========================
DELETE
========================= */

window.deleteTransaction =
async function(id) {

const ok =
confirm(
"Hapus transaksi ini?"
);

if (!ok) return;

try {


await fetch(
  API_URL,
  {

    method: "POST",

    body: JSON.stringify({

      action: "delete",

      id: id
    })
  }
);

loadData();


} catch (err) {


console.error(err);

alert(
  "Gagal menghapus"
);


}
};

/* =========================
LOAD DATA
========================= */

async function loadData() {

try {


const res =
  await fetch(API_URL);

const data =
  await res.json();

allTransactions =
  data.reverse();

let totalMasuk = 0;
let totalKeluar = 0;

allTransactions.forEach(
  item => {

    if (
      item.jenis ===
      "Masuk"
    ) {

      totalMasuk +=
        Number(
          item.nominal
        );

    } else {

      totalKeluar +=
        Number(
          item.nominal
        );
    }
  }
);

document.getElementById(
  "totalMasuk"
).textContent =
  rupiah(totalMasuk);

document.getElementById(
  "totalKeluar"
).textContent =
  rupiah(totalKeluar);

document.getElementById(
  "saldo"
).textContent =
  rupiah(
    totalMasuk -
    totalKeluar
  );

renderCategoryChart(
  allTransactions
);

renderTopExpenses();

renderTransactions();


} catch (err) {


console.error(err);


}
}

/* =========================
FILTER TAB
========================= */

tabs.forEach(tab => {

tab.addEventListener(
"click",
() => {


  tabs.forEach(
    t =>
      t.classList.remove(
        "active"
      )
  );

  tab.classList.add(
    "active"
  );

  currentFilter =
    tab.dataset.filter;

  renderTransactions();
}


);
});

/* =========================
SUBMIT
========================= */

form.addEventListener(
"submit",
async (e) => {


e.preventDefault();

const id =
  document.getElementById(
    "transaksiId"
  ).value;

const payload = {

  action:
    id
      ? "update"
      : "create",

  id: id,

  tanggal:
    document.getElementById(
      "tanggal"
    ).value,

  jenis:
    document.getElementById(
      "jenis"
    ).value,

  kategori:
    document.getElementById(
      "kategori"
    ).value,

  nominal:
    document.getElementById(
      "nominal"
    ).value,

  catatan:
    document.getElementById(
      "catatan"
    ).value
};

try {

  await fetch(
    API_URL,
    {

      method: "POST",

      body:
        JSON.stringify(
          payload
        )
    }
  );

  form.reset();

  document.getElementById(
    "transaksiId"
  ).value = "";

  modal.classList.remove(
    "show"
  );

  loadData();

} catch (err) {

  console.error(err);

  alert(
    "Gagal menyimpan"
  );
}


}
);

loadData();
