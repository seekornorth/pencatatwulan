const API_URL =
"https://script.google.com/macros/s/AKfycbw0jBHLLz42MCehM9ksuP6WC7VJyCmcM2U7D8KeGx0y8D1ksM7HbiVBuF5P7nOHoD_s/exec";

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
   FORMAT RUPIAH
========================= */

function rupiah(number) {
  return "Rp " + Number(number).toLocaleString("id-ID");
}

/* =========================
   CHART
========================= */

function renderChart(masuk, keluar) {

  const saldo = masuk - keluar;

  const ctx = document
    .getElementById("moneyChart")
    .getContext("2d");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "doughnut",

    data: {
      labels: [
        "Pemasukan",
        "Pengeluaran",
        "Saldo"
      ],

      datasets: [{
        data: [
          masuk,
          keluar,
          saldo > 0 ? saldo : 0
        ],

        backgroundColor: [
          "#22c55e",
          "#ef4444",
          "#ec4899"
        ],

        borderWidth: 0
      }]
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          labels: {
            color: "#ffffff"
          }
        }
      }
    }
  });
}

/* =========================
   RENDER TRANSAKSI
========================= */

function renderTransactions() {

  transactionList.innerHTML = "";

  let filtered = allTransactions;

  if (currentFilter !== "all") {
    filtered = allTransactions.filter(
      item => item.jenis === currentFilter
    );
  }

  filtered.forEach(item => {

    const income = item.jenis === "Masuk";

    transactionList.innerHTML += `
      <div class="transaction-card">

        <div class="transaction-top">

          <div class="transaction-category">
            ${item.kategori}
          </div>

          <div class="
            transaction-amount
            ${income ? "income" : "expense"}
          ">
            ${income ? "+" : "-"}
            ${rupiah(item.nominal)}
          </div>

        </div>

        <div class="transaction-bottom">

          <span>
            ${item.tanggal}
          </span>

          <span>
            ${item.catatan || "-"}
          </span>

        </div>

      </div>
    `;
  });

  if (filtered.length === 0) {

    transactionList.innerHTML = `
      <div class="card">
        Belum ada transaksi 🌸
      </div>
    `;
  }
}

/* =========================
   LOAD DATA
========================= */

async function loadData() {

  try {

    const res = await fetch(API_URL);

    const data = await res.json();

    allTransactions = data.reverse();

    let totalMasuk = 0;
    let totalKeluar = 0;

    allTransactions.forEach(item => {

      if (item.jenis === "Masuk") {

        totalMasuk += Number(item.nominal);

      } else {

        totalKeluar += Number(item.nominal);

      }

    });

    const saldo =
      totalMasuk - totalKeluar;

    document.getElementById(
      "totalMasuk"
    ).textContent = rupiah(totalMasuk);

    document.getElementById(
      "totalKeluar"
    ).textContent = rupiah(totalKeluar);

    document.getElementById(
      "saldo"
    ).textContent = rupiah(saldo);

    renderChart(
      totalMasuk,
      totalKeluar
    );

    renderTransactions();

  } catch (err) {

    console.error(err);

    transactionList.innerHTML = `
      <div class="card">
        Gagal mengambil data 😢
      </div>
    `;
  }
}

/* =========================
   FILTER TAB
========================= */

tabs.forEach(tab => {

  tab.addEventListener("click", () => {

    tabs.forEach(t =>
      t.classList.remove("active")
    );

    tab.classList.add("active");

    currentFilter =
      tab.dataset.filter;

    renderTransactions();
  });
});

/* =========================
   SIMPAN TRANSAKSI
========================= */

form.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    const payload = {

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

      await fetch(API_URL, {

        method: "POST",

        body: JSON.stringify(
          payload
        )
      });

      form.reset();

      modal.classList.remove(
        "show"
      );

      loadData();

    } catch (err) {

      alert(
        "Gagal menyimpan data"
      );

      console.error(err);
    }
  }
);

loadData();
