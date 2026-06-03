const API_URL = "https://script.google.com/macros/s/AKfycbw0jBHLLz42MCehM9ksuP6WC7VJyCmcM2U7D8KeGx0y8D1ksM7HbiVBuF5P7nOHoD_s/exec";

const form = document.getElementById("formTransaksi");
const tbody = document.getElementById("tbody");

async function loadData() {

  const res = await fetch(API_URL);
  const data = await res.json();

  tbody.innerHTML = "";

  let totalMasuk = 0;
  let totalKeluar = 0;

  data.reverse().forEach(item => {

    if(item.jenis === "Masuk"){
      totalMasuk += Number(item.nominal);
    } else {
      totalKeluar += Number(item.nominal);
    }

    tbody.innerHTML += `
      <tr>
        <td>${item.tanggal}</td>
        <td>${item.jenis}</td>
        <td>${item.kategori}</td>
        <td>Rp ${Number(item.nominal).toLocaleString('id-ID')}</td>
        <td>${item.catatan}</td>
      </tr>
    `;
  });

  document.getElementById("totalMasuk").textContent =
    "Rp " + totalMasuk.toLocaleString('id-ID');

  document.getElementById("totalKeluar").textContent =
    "Rp " + totalKeluar.toLocaleString('id-ID');

  document.getElementById("saldo").textContent =
    "Rp " + (totalMasuk - totalKeluar).toLocaleString('id-ID');
}

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const payload = {
    tanggal: document.getElementById("tanggal").value,
    jenis: document.getElementById("jenis").value,
    kategori: document.getElementById("kategori").value,
    nominal: document.getElementById("nominal").value,
    catatan: document.getElementById("catatan").value
  };

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  form.reset();

  loadData();
});

loadData();
