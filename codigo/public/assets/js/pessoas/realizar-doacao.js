function getCurrentUserId() {
  return JSON.parse(sessionStorage.getItem('usuarioCorrente')).id || {};
}


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('doacao-form');
  const qrCodeContainer = document.getElementById('qr-code');
  const actionButtons = document.getElementById('action-buttons');
  const confirmarButton = document.getElementById('confirmar-doacao');
  const cancelarButton = document.getElementById('cancelar-doacao');
  const ongsSelect = document.getElementById('ongs');
  const gerarQrBtn = document.getElementById('gerar-qr-btn');
  const formContainer = document.getElementById('form-container');
  let ongsOptions = [];

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  fetch('/ongs')
    .then(response => response.json())
    .then(data => {
      ongsOptions = data;

      data.forEach(ong => {
        const option = document.createElement('option');
        option.value = ong.id;
        option.textContent = ong.nome_fantasia;
        ongsSelect.appendChild(option);
      });

      const ongID = getQueryParam('ongID');
      if (ongID) {
        ongsSelect.value = ongID;
        ongsSelect.disabled = true;
      }

      checkFormValidity();
    })
    .catch(error => {
      console.error('Erro ao carregar as ONGs:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível carregar as ONGs. Tente novamente mais tarde.',
      });
    });

  function generatePixPayload(data) {
    const { version, key, city, name, value, message, currency, countryCode } = data;

    function genEMV(id, parameter) {
      const len = parameter.length.toString().padStart(2, '0');
      return `${id}${len}${parameter}`;
    }

    let payload = [
      genEMV('00', version),
      genEMV('26', `BR.GOV.BCB.PIX${genEMV('01', key)}${message ? genEMV('02', message) : ''}`),
      genEMV('52', '0000'),
      genEMV('53', String(currency)),
    ];

    if (value) {
      payload.push(genEMV('54', value.toFixed(2)));
    }

    const sanitizedName = name.substring(0, 25).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const sanitizedCity = city.substring(0, 15).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    payload.push(genEMV('58', countryCode.toUpperCase()));
    payload.push(genEMV('59', sanitizedName));
    payload.push(genEMV('60', sanitizedCity));

    const payloadString = payload.join('') + '6304';
    const crc = crc16ccitt(payloadString).toString(16).toUpperCase().padStart(4, '0');
    const payloadFinal = `${payloadString}${crc}`;

    return payloadFinal;
  }

  function crc16ccitt(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc;
  }

  form.addEventListener('input', checkFormValidity);

  function checkFormValidity() {
    const ongSelected = ongsSelect.value !== "";
    const valorFilled = document.getElementById('valor').value !== "";
    if (ongSelected && valorFilled) {
      gerarQrBtn.disabled = false;
    } else {
      gerarQrBtn.disabled = true;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const valor = parseFloat(document.getElementById('valor').value).toFixed(2);
    const descricao = document.getElementById('descricao').value || "Nenhuma descrição fornecida.";
    const ongId = document.getElementById('ongs').value;

    const ong = ongsOptions.find(ong => String(ong.id) === String(ongId));
    if (!ong) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'ONG selecionada inválida.',
      });
      return;
    }

    const pixData = {
      version: "01",
      key: ong.contatos.email || ong.contatos.telefone,
      city: ong.endereco.cidade,
      name: ong.nome_fantasia,
      value: parseFloat(valor),
      message: descricao,
      currency: 986,
      countryCode: "BR"
    };

    const pixPayload = generatePixPayload(pixData);

    qrCodeContainer.innerHTML = "";
    new QRCode(qrCodeContainer, {
      text: pixPayload,
      width: 250,
      height: 250,
    });

    qrCodeContainer.classList.add('visible');
    formContainer.classList.add('row');

    actionButtons.style.display = 'flex';

    disableFormFields(true);

    confirmarButton.disabled = false;
    cancelarButton.disabled = false;

    qrCodeContainer.scrollIntoView({ behavior: 'smooth' });
  });

  confirmarButton.addEventListener('click', async () => {
    await postarDoacao();
  });

  cancelarButton.addEventListener('click', async () => {
    await postarDoacao(false);
  });

  async function postarDoacao(confirmado = true) {
    const valor = parseFloat(document.getElementById('valor').value).toFixed(2);
    const descricao = document.getElementById('descricao').value || "Nenhuma descrição fornecida.";
    const ongId = document.getElementById('ongs').value;

    const doacaoData = {
      ong: parseInt(ongId),
      doador: getCurrentUserId(),
      valor: parseFloat(valor),
      data: new Date().toISOString().split('T')[0],
      status: confirmado ? "done" : "cancelled",
      descricao: descricao,
      pagamento: {
        tipo: "pix"
      }
    };

    try {
      const response = await fetch('/doacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(doacaoData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: confirmado ? 'Doação realizada com sucesso!' : 'Doação cancelada.',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao realizar a doação.',
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao realizar a doação.',
      });
    }
  }

  function disableFormFields(disabled) {
    const fields = form.querySelectorAll('input, select, textarea, button');
    fields.forEach(field => {
      if (field !== gerarQrBtn) { // Mantém o botão gerar QR habilitado/desabilitado conforme necessário
        field.disabled = disabled;
      }
    });
    gerarQrBtn.disabled = disabled;
  }
});
