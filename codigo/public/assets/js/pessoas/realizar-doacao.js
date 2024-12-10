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

  function getCurrentUserId() {
    const usuario = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
    return usuario ? usuario.id : null;
  }

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
      const { version, key, city, name, value, currency, countryCode, message } = data;
    
      function genEMV(id, parameter) {
        const len = parameter.length.toString().padStart(2, '0');
        return `${id}${len}${parameter}`;
      }
    
      function sanitizeInput(input, maxLength) {
        return input
          .substring(0, maxLength)
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^A-Z0-9 ]/g, '');
      }
    
      let payload = [
        genEMV('00', version), // Payload Format Indicator
        genEMV(
          '26', // Merchant Account Information - PIX
          genEMV('00', 'BR.GOV.BCB.PIX') + genEMV('01', key) + (message ? genEMV('02', sanitizeInput(message, 25)) : '')
        ),
        genEMV('52', '0000'), // Merchant Category Code (Default: 0000)
        genEMV('53', String(currency)), // Transaction Currency (Default: 986 for BRL)
      ];
    
      if (value) {
        payload.push(genEMV('54', value.toFixed(2))); // Transaction Amount
      }
    
      payload.push(genEMV('58', countryCode.toUpperCase())); // Country Code
      payload.push(genEMV('59', sanitizeInput(name, 25))); // Merchant Name
      payload.push(genEMV('60', sanitizeInput(city, 15))); // Merchant City
    
      // Adiciona o CRC16 no final do payload
      const payloadString = payload.join('') + '6304';
      const crc = crc16ccitt(payloadString).toString(16).toUpperCase().padStart(4, '0');
      const payloadFinal = `${payloadString}${crc}`;
    
      return payloadFinal;
    }
    
    // Função para calcular o CRC16-CCITT
    function crc16ccitt(str) {
      let crc = 0xffff;
      for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) !== 0) {
            crc = (crc << 1) ^ 0x1021;
          } else {
            crc <<= 1;
          }
        }
        crc &= 0xffff;
      }
      return crc;
    }
    
  function checkFormValidity() {
    const ongSelected = ongsSelect.value !== "";
    const valorFilled = document.getElementById('valor').value !== "";
    gerarQrBtn.disabled = !(ongSelected && valorFilled);
  }

  form.addEventListener('input', checkFormValidity);
  const qrCode = new QRCodeStyling({
    width: 250,
    height: 250,
    data: "",
    image: "",
    dotsOptions: {
      color: "#000",
      type: "square"
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 0
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const valor = parseFloat(document.querySelector('#valor').value).toFixed(2);
    let descricao = document.getElementById('descricao').value || "Nenhuma descrição fornecida.";
    descricao = descricao.substring(0, 25);
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
      key: ong.contatos.email || `+55${ong.contatos.telefone}`,
      city: ong.endereco.cidade,
      name: ong.razao_social,
      value: parseFloat(valor),
      message: "Doação no site do Conexão",
      currency: 986,
      countryCode: "BR"
    };

    const pixPayload = generatePixPayload(pixData);

    try {
      qrCode.update({
        data: pixPayload
      });
      qrCode.append(qrCodeContainer);
    } catch (error) {
      console.error('Erro ao gerar o QR Code:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível gerar o QR Code. Verifique os dados e tente novamente.',
      });
      return;
    }

    qrCodeContainer.classList.add('visible');
    formContainer.classList.add('row');
    actionButtons.style.display = 'flex';
    disableFormFields(true);
    confirmarButton.disabled = false;
    cancelarButton.disabled = false;
    qrCodeContainer.scrollIntoView({ behavior: 'smooth' });
  });

  confirmarButton.addEventListener('click', () => {
    postarDoacao(true);
  });

  cancelarButton.addEventListener('click', () => {
    postarDoacao(false);
  });

  async function postarDoacao(confirmado = true) {
    const valor = parseFloat(document.getElementById('valor').value).toFixed(2);
    const descricao = document.getElementById('descricao').value.substring(0, 25) || "Nenhuma descrição fornecida.";
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
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error('Falha na resposta do servidor.');
      }
    } catch (error) {
      console.error('Erro ao postar a doação:', error);
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
      if (field !== gerarQrBtn) {
        field.disabled = disabled;
      }
    });
    gerarQrBtn.disabled = disabled;
  }
});
