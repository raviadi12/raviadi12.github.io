//Var
var rowIdx = 0;
var browsed = '';
const tidur = (time) => {
  return new Promise(resolve => setTimeout(resolve, time))
}
//Filtrasi Input
//Mulai Jquery
window.onload = () => {
  setTimeout(hilang, 3000);
}
function hilang() {
  var selamatdatang = document.getElementById('selamat');
  selamatdatang.classList.add('gakada');
}
function tambah_table() {
  $('#tbody').append(`<tr id="R${++rowIdx}">
  <td class="row-index text-center">
     <label>Barang ${rowIdx}</label>
 <input class="namab" id="nama${rowIdx}">
  </td>
  <td class="row-index text-center">
     <input type="number" onfocusout="if(this.value==''){this.value='0'}" onfocusin="if(this.value=='' || this.value=='0'){this.value=''}" class="isianw" id="W${rowIdx}" value=0>
     <label>W</label>
     </td>
     <td class="row-index text-center">
         <input type="number" min="0" max="24" onchange="if(this.value>1*this.max){this.value=this.max;}else if(this.value<this.min){this.value='0';}else if(this.value==this.max){M${rowIdx}.value='0';}" onfocusout="if(this.value==''){this.value='0'}" onfocusin="if(this.value=='' || this.value=='0'){this.value=''}" class="ij" id="J${rowIdx}" value=0>
         <label>Jam</label>
         <input type="number" min="0" max="60" placeholder="Max. 60" onchange="if(J${rowIdx}.value==1*J${rowIdx}.max){this.value='0';}else if(this.value<0){this.value='0';} else if(this.value>1*this.max){this.value='60';}" onfocusout="if(this.value==''){this.value='0'}" onfocusin="if(this.value=='' || this.value=='0'){this.value=''}" class="ij" id="M${rowIdx}" value=0>
         <label>Menit</label>
<select onchange="if(this.value=='1'){J${rowIdx}.max='24';J${rowIdx}.value='0'}else if(this.value=='2'){J${rowIdx}.max='168';J${rowIdx}.value='0'}else if(this.value=='3'){J${rowIdx}.max='720';J${rowIdx}.value='0'}" class="form-select form-select-sm" id="waktu${rowIdx}" aria-label=".form-select-sm example">
<option value="1">/Hari</option>
<option value="2">/Minggu</option>
<option value="3">/Bulan</option>
</select>
</td>
<td class="row-index text-center">
<button id="rmhapus" type="button" onclick="hapuss(b${rowIdx}.value)" class="btn btn-danger sihapus">Hapus</button>
<input type="button" id="b${rowIdx}" value="${rowIdx}" style="display:none">
</td>
            </div>
        </div>

   </tr>
`);
}
const hapuss = async (skr) => {
  let watts = [];
  let jams = [];
  let menits = [];
  let namas = [];
  let opsis = [];
  const rightnow = rowIdx;
  $('#jmldata').text(rightnow- 1);
  for (i = skr; i <= rightnow; i++) {
    if (i != rightnow) {
     let atas1 = i - -1;
     let nama = String(document.getElementById("nama"+atas1).value);
     let watt = parseFloat(document.getElementById("W"+atas1).value);
     let jam = parseFloat(document.getElementById("J"+atas1).value);
     let menit = parseFloat(document.getElementById("M"+atas1).value);
     let opsi = parseFloat(document.getElementById("waktu"+atas1).value);
     namas.push(nama);
     watts.push(watt);
     menits.push(menit);
     jams.push(jam);
     opsis.push(opsi);
    }
    $('#R'+i).remove();
    rowIdx--;
  }
  await tidur (2);
  let parray = 0;
  let panjang = namas.length;
  for (let i = 1; i <= panjang; i++) {
    await tidur(1);
    let saat_ini = rowIdx - -1;
    tambah_table();
    $('#nama'+saat_ini).val(namas[parray]);
    $('#W'+saat_ini).val(watts[parray]);
    $('#J'+saat_ini).val(jams[parray]);
    $('#M'+saat_ini).val(menits[parray]);
    $('#waktu'+saat_ini).val(opsis[parray])
    console.log("Tambah" + rowIdx);
    parray++;
    rowIdx+1;
  }
  console.log(watts);
  console.log(jams);
  console.log(menits);
  console.log(namas);
  console.log(opsis);
}
$(document).ready(function () {
  //$(".ij").bind('keyup mouseup', function () {
  //  alert("Berubah");            
//});
$('#tablegesek').DataTable({
  "scrollY": "50vh",
  "scrollCollapse": true,
  "ordering": false,
  "language": {
    "emptyTable": "Masukan datanya",
    "lengthMenu":     "Menampilkan _MENU_ list"
  }
});
$('#isi').on('click', function () {
  $('#isi').val('');
})
$('#isi').on('change', function (event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function() {
      var text = reader.result;
      var node = document.getElementById('isi');
      node.innerText = text;
      loading = reader.result.substring();
      browsed = JSON.parse(reader.result.substring());
      console.log(reader.result.substring());
      var panjangnya = browsed.length;
      console.log(panjangnya);
      for (i = rowIdx; i >= 1; i--) {
        let jml_skr = '#R' + rowIdx;
        $(jml_skr).remove();
        rowIdx--;
        console.log("berhasil_removed"+rowIdx)
      }
      $('#jmldata').text(panjangnya);
      for (let i = 0; i < panjangnya; i++) {
        tambah_table();
        $('#nama'+rowIdx).val(browsed[i].nama);
        $('#W'+rowIdx).val(browsed[i].watt);
        $('#J'+rowIdx).val(browsed[i].jam);
        $('#M'+rowIdx).val(browsed[i].menit);
        $('#waktu'+rowIdx).val(browsed[i].opsi)
        console.log("Tambah" + rowIdx);
      }
      hitung();
    };
    reader.readAsText(input.files[0]);
}),
$('#isi2').on('click', function () {
  $('#isi2').val('');
})
$('#isi2').on('change', function (event) {
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function() {
    var text = reader.result;
    var node = document.getElementById('isi');
    node.innerText = text;
    loading = reader.result.substring();
    browsed = JSON.parse(reader.result.substring());
    console.log(reader.result.substring());
    var panjangnya = browsed.length;
    console.log(panjangnya);
    for (let i = 0; i < panjangnya; i++) {
      tambah_table();
      $('#nama'+rowIdx).val(browsed[i].nama);
      $('#W'+rowIdx).val(browsed[i].watt);
      $('#J'+rowIdx).val(browsed[i].jam);
      $('#M'+rowIdx).val(browsed[i].menit);
      $('#waktu'+rowIdx).val(browsed[i].opsi)
      console.log("Tambah" + rowIdx);
      hitung();
    }
    $('#jmldata').text(rowIdx);
  };
  reader.readAsText(input.files[0]);
})
$('html').keyup(function(e){
  if(e.keyCode == 46) {
    var sekarang = '#R' + rowIdx;
    if (rowIdx > 0) {
      $(sekarang).remove();
      
      // Kurangin 1
      rowIdx--;
      }
  }
  if(e.keycode == 45) {
   tambah_table();
  }
  $('#jmldata').text(rowIdx);
});
$('.dataTables_length').addClass('bs-select'),
    $('#addBtn').on('click', function () {
      
      // Tambah Row dan kawan-kawan
      tambah_table();
        $('#jmldata').text(rowIdx);
    });

    // jQuery hilang row
    $('#hapusall').on('click', function () {
      for (i = rowIdx; i >= 1; i--) {
        let jml_skr = '#R' + rowIdx;
        $(jml_skr).remove();
        rowIdx--;
        console.log("berhasil_removed"+rowIdx);
      }
      $('#jmldata').text(rowIdx);
    });
    $('#hapus1').on('click', function () {
    var sekarang = '#R' + rowIdx;
    if (rowIdx > 0) {
      $(sekarang).remove();
      rowIdx--;
      console.log("berhasil");
      $('#jmldata').text(rowIdx);
    }
    });
});
  

// Algoritma penghitungan
let tarif = 1447.70;
let data_hasil = [];
let data_simpan = [];
let totalkwh = [];
let wmax = [];
let loading = '';

function hitung() {
  //hilangkan array yang sebelumnya
wmax.length = 0;
totalkwh.length = 0;
data_hasil.length = 0;
let jml = rowIdx;
  for (let i = 1; i <= jml; i++) {
    let opsi = parseInt(document.getElementById("waktu"+i).value);
    var watt = parseFloat(document.getElementById("W"+i).value);
    var jam = parseFloat(document.getElementById("J"+i).value);
    var menit = parseFloat(document.getElementById("M"+i).value);
    wmax.push(watt)
    console.log(watt);
    console.log(jam);
    console.log(menit);
    // 1 = harian, 2 = mingguan, 3 = Bulanan
    if (opsi == 1 && watt != null && jam != null && menit != null && opsi != null) {
        hitungharian(watt, jam, menit);
        console.log("iterasiOpsi1 " + i);
    } else if (opsi == 2) {
        hitungmingguan(watt, jam, menit);
        console.log("iterasiOpsi2 " + i);
    } else if (opsi == 3) {
        hitungbulanan(watt, jam, menit);
        console.log("iterasiOpsi3 " + i);
    } else {
        console.log("Pilih dong");
    }
  }

//save hasil


  // fungsi jumlah array
  function jumArray(array){
    let sum = 0 // awalan dimulai dari 0
  
// coba untuk sortir
    for (let i = 0; i < 
    array.length; i += 1) {
    // ambil semua terus dijumlahin
    sum += array[i]
    // initial: sum = 0 
    // iteration 1: 0 + 1 => sum = 1
    // iteration 2: 1 + 4 => sum = 5
    // iteration 3: 5 + 0 => sum = 5
    // iteration 4: 5 + 9 => sum = 14
    // iteration 5: 14 + -3 => sum = 11
  
    }
   // 11
    // return hasil
    return sum
  }
//panggil  

function separateComma(val) {
  // remove sign if negative
  var sign = 1;
  if (val < 0) {
    sign = -1;
    val = -val;
  }
  // trim the number decimal point if it exists
  let num = val.toString().includes('.') ? val.toString().split('.')[0] : val.toString();
  let len = num.toString().length;
  let result = '';
  let count = 1;

  for (let i = len - 1; i >= 0; i--) {
    result = num.toString()[i] + result;
    if (count % 3 === 0 && count !== 0 && i !== 0) {
      result = ',' + result;
    }
    count++;
  }

  // add number after decimal point
  if (val.toString().includes('.')) {
    result = result + '.' + val.toString().split('.')[1];
  }
  // return result with - sign if negative
  return sign < 0 ? '-' + result : result;
}

let jumlahakhir = jumArray(data_hasil);
var duakoma = parseFloat(jumlahakhir).toFixed(2);
var jadikoma = separateComma(duakoma);
//totalkwh
let jumlahakhirkwh = jumArray(totalkwh);
var duakomakwh = parseFloat(jumlahakhirkwh).toFixed(2);
var jadikomakwh = separateComma(duakomakwh);
//kwhkonsisten
let kwhkons = jumlahakhirkwh/720;
var duakomakwhkons = parseFloat(kwhkons).toFixed(2);
var jadikomakwhkons = separateComma(duakomakwhkons);
var jadiwhkons = kwhkons*1000;
var duakomawhkons = parseFloat(jadiwhkons).toFixed(2);
var jadikomawhkons = separateComma(duakomawhkons);
var wtotal = jumArray(wmax);
var wjadikoma = parseFloat(wtotal).toFixed(1);
var wkoma = separateComma(wjadikoma);
//ss
document.getElementById("total").innerHTML = "Rp " + jadikoma;
document.getElementById("kwhtotal").innerHTML = jadikomakwh + " kWh"
document.getElementById("konsisten").innerHTML = jadikomakwhkons + " kWh atau " + jadikomawhkons + " Wh";
document.getElementById("daya-max").innerHTML = wkoma + " W"
console.log(jumlahakhir);
}
function simpan() {
  data_simpan.length = 0;
  let now = rowIdx;
  for (let i = 1; i <= now; i++) {
    let nama = String(document.getElementById('nama'+i).value);
    let opsi = parseInt(document.getElementById('waktu'+i).value);
    let watt = parseInt(document.getElementById('W'+i).value);
    let jam = parseFloat(document.getElementById('J'+i).value);
    let menit = parseFloat(document.getElementById('M'+i).value);
    data_simpan.push({nama, opsi, watt, jam, menit});
    console.log("Data ditambahkan");
  }
  console.log(data_simpan);
  var jsonData = JSON.stringify(data_simpan);
  download(jsonData, 'hasil.rvi', 'text/plain')
};
function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

function hitungbulanan(w, j, m) {
    let hasilj = w*j/1000;
    let hasilm = w*m/60000;
    let hasil = hasilj + hasilm;
    let harga = hasil * tarif;
    totalkwh.push(hasil);
    data_hasil.push(harga);
    console.log("fungsi berhasil dipanggil");
    return harga;
}

function hitungharian(w, j, m) {
  let hasilj = w*j/1000;
  let hasilm = w*m/60000;
  let hasil = hasilj + hasilm;
  let kumulatif = hasil * 30;
  let harga = hasil * tarif * 30;
  totalkwh.push(kumulatif);
  data_hasil.push(harga);
  console.log("fungsi berhasil dipanggil");
  return harga;
}

function hitungmingguan(w, j, m) {
    let hasilj = w*j/1000;
    let hasilm = w*m/60000;
    let hasil = hasilj + hasilm;
    let kumulatif = hasil * 4.285714285714286; 
    let harga = hasil * tarif * 4.285714285714286;
    totalkwh.push(kumulatif);
    data_hasil.push(harga);
    console.log("fungsi berhasil dipanggil");
    return harga;
  }

function ubah_tarif(v) {
  let h = v;
  if (h == 1) {
    tarif = 1352.00;
  } else if (h == 2) {
    tarif = 1447.70;
  } else if (h == 3) {
    tarif = 1699.53; 
  } else if (h == 5) {
    tarif = 1114.74;
  } else if (h == 6) {
    tarif = 996.74;
  } else if (h == 7) {
    tarif = 1522.88
  } else if (h == 8) {
    tarif = 1644.52;
  }

}

