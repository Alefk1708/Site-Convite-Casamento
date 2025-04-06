document.getElementById('confirmForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const name = document.getElementById('name').value;
    const guests = document.getElementById('guests').value;
  
    // Obtém ou gera um deviceId único para o usuário
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId || deviceId === 'null' || deviceId === 'undefined') {
        deviceId = crypto.randomUUID();
        localStorage.setItem('deviceId', deviceId);
        console.log('Novo deviceId gerado:', deviceId);
    } else {
        console.log('DeviceId existente encontrado:', deviceId);
    }
  
    // Envia os dados do formulário para o servidor
    const response = await fetch('http://localhost:5000', { // Altere a URL conforme necessário
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'device-id': deviceId
        },
        body: JSON.stringify({ name, guests: Number(guests) }),
        credentials: "include"
    });
  
    const data = await response.json();
  
    if (response.ok) {
        // Exibe a mensagem de sucesso
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('errorMessage').style.display = 'none';
    } else {
        // Exibe a mensagem de erro dependendo da resposta do servidor
        if (data.message && data.message === "Você já confirmou presença!") {
            document.getElementById('errorMessage').innerText = "Você já confirmou presença!";
        } else {
            document.getElementById('errorMessage').innerText = data.message || "Ocorreu um erro inesperado.";
        }
        document.getElementById('errorMessage').style.display = 'block';
    }
});
