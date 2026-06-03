const API_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnThBhBReeyp6kTeP4nlLfQsWKveOgB0MfMc5ddMB7kU_BuC-A7Q8ophunV-YnGeKkbmne8m7jqK6Jb5WUBty8YOzizIINEtqRu-2Rwb351plPbaNFCYJVlmQh-nmffbuRxW12s7DRSY0PeYtLHbxRgVtYLsro-Yz-RQeWQz71U2A_qDLMJlpiM7F4jE72kpSpO7NnjFJ6vixW3rD2FYoazqeSdH-hebknulf47On691PdI2GGkkDs4r-go4DWh9dbT-8_fe0EjlNQLYvE_aF2d4n6L5fQ&lib=M04E52ro3yPgQd2Quri6tj3tq80Kj4Y18";

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
