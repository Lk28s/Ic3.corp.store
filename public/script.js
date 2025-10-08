// Carregar contas ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    carregarContas();
    configurarFormAdmin();
    configurarNavegacao();
});

// Função para carregar contas da API
async function carregarContas() {
    try {
        const response = await fetch('/api/contas');
        const contas = await response.json();
        const container = document.getElementById('lista-contas');
        container.innerHTML = '';

        contas.forEach(conta => {
            const card = `
                <div class="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="${conta.id * 100}">
                    <div class="card h-100">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${conta.tipo}</h5>
                            <p class="card-text">${conta.descricao}</p>
                            <p class="text-success fw-bold fs-4">${conta.preco}</p>
                            <button class="btn btn-primary mt-auto comprar-btn" data-id="${conta.id}">Comprar Agora</button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });

        // Adicionar event listeners para botões de compra
        document.querySelectorAll('.comprar-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                try {
                    const response = await fetch(`/api/comprar/${id}`, { method: 'POST' });
                    const data = await response.json();
                    alert(data.message);
                    carregarContas(); // Recarrega a lista
                } catch (error) {
                    alert('Erro ao comprar: ' + error.message);
                }
            });
        });
    } catch (error) {
        console.error('Erro ao carregar contas:', error);
    }
}

// Configurar formulário de admin
function configurarFormAdmin() {
    const form = document.getElementById('form-adicionar');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tipo = document.getElementById('tipo').value;
        const preco = document.getElementById('preco').value;
        const descricao = document.getElementById('descricao').value;

        try {
            const response = await fetch('/api/contas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo, preco, descricao })
            });
            const data = await response.json();
            alert(data.message);
            form.reset();
            carregarContas(); // Recarrega a lista
        } catch (error) {
            alert('Erro ao adicionar: ' + error.message);
        }
    });
}

// Smooth scroll para navegação
function configurarNavegacao() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}
