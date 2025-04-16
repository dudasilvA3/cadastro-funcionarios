// Inicializa o banco de dados
const request = indexedDB.open("FuncionariosDB", 1); // versão 1 do banco de dados funcionáriosDB do IndexedDB

request.onupgradeneeded = function (event) { // onupgradeneeded -> evento de atualização
    let db = event.target.result;
    let store = db.createObjectStore("funcionarios", { keyPath: "id", autoIncrement: true });
    // store.createIndex() cria um índice no objeto store
    store.createIndex("nome", "nome", { unique: false });
    store.createIndex("cpf", "cpf", { unique: true });
    store.createIndex("email", "email", { unique: true });
    store.createIndex("telefone", "telefone", { unique: true });
    store.createIndex("cargo", "cargo", { unique: false });
};

request.onsuccess = function (event) { // caso o evento seja executado com sucesso
    console.log("Banco de dados carregado com sucesso!");
    listarFuncionarios(); // Garante que os dados sejam carregados ao iniciar
};

request.onerror = function (event) { // caso o evento não seja executado com sucesso
    console.error("Erro ao abrir o IndexedDB:", event.target.error);
};

// Função auxiliar para verificar se o banco de dados foi carregado corretamente
function verificarDB() {
    // Verifica se o banco foi carregado corretamente
    if (!request.result) {
        console.error("O banco de dados não foi carregado corretamente.");
        return null;
    }
    return request.result; // Retorna o banco de dados carregado
}

// Captura o evento de envio do formulário
document.querySelector(".add_names").addEventListener("submit", function (event) {
    event.preventDefault();
    let funcionario = { // Criando objeto funcionário
        nome: document.querySelector("#nome").value,
        cpf: document.querySelector("#cpf").value,
        email: document.querySelector("#email").value,
        telefone: document.querySelector("#telefone").value,
        data_nascimento: document.querySelector("#data_nascimento").value,
        cargo: document.querySelector("#cargo").value
    };

    adicionarFuncionario(funcionario); // Adiciona o funcionário
});

// Função para listar funcionários com feedback visual
function listarFuncionarios() {
    let db = verificarDB(); // Verifica se o banco está carregado
    if (!db) {
        mostrarFeedback("Erro ao carregar banco de dados!", "error");
        return;
    }

    let transaction = db.transaction("funcionarios", "readonly"); // Faz a leitura do banco de funcionários
    let store = transaction.objectStore("funcionarios");

    let listaFuncionarios = document.querySelector(".your_dates"); // Exibir lista no HTML
    listaFuncionarios.innerHTML = ""; // Limpa antes de exibir
    
    let cursorRequest = store.openCursor(); // Percorre todos os registros dentro da store
    cursorRequest.onsuccess = function (event) { // Lista executada com sucesso
        let cursor = event.target.result; // O cursor aponta para cada registro
        if (cursor) {
            let funcionario = cursor.value; // O cursor busca as informações dos funcionários
            listaFuncionarios.innerHTML += `<p>ID: ${funcionario.id} - Nome: ${funcionario.nome} - CPF: ${funcionario.cpf}
           </p>`;
            cursor.continue();
        } else {
            mostrarFeedback("Lista de funcionários carregada com sucesso!", "success");
        }
    };

    cursorRequest.onerror = function (event) {
        console.error("Erro ao listar funcionários:", event.target.error);
        mostrarFeedback("Erro ao listar funcionários!", "error");
    };
}

// Função para adicionar um funcionário com feedback visual
function adicionarFuncionario(funcionario) {
    let db = verificarDB(); // Verifica se o banco de dados foi carregado corretamente
    if (!db) return; // Se não estiver carregado, sai da função

    let transaction = db.transaction("funcionarios", "readwrite"); // Cria uma transação de leitura e escrita
    let store = transaction.objectStore("funcionarios"); // Referência direta ao objeto onde os dados serão armazenados
    
    let addRequest = store.add(funcionario); // Adiciona o funcionário na store
    addRequest.onsuccess = function () { // Funcionário foi adicionado com sucesso
        console.log("Funcionário adicionado com sucesso!");
        mostrarFeedback("Funcionário cadastrado com sucesso!", "success"); // Mostra feedback visual
        listarFuncionarios(); // Lista os funcionários após adicionar
    };

    addRequest.onerror = function (event) { // Erro ao adicionar funcionário
        console.error("Erro ao adicionar funcionário:", event.target.error);
        mostrarFeedback("Erro ao cadastrar funcionário!", "error"); // Exibe erro na interface
    };
}

// Função para atualizar um funcionário com feedback visual
function atualizarFuncionario(id, novosDados) {
    let db = verificarDB(); // Verifica se o banco de dados foi carregado corretamente
    if (!db) return; // Se não estiver carregado, sai da função

    let transaction = db.transaction("funcionarios", "readwrite");
    let store = transaction.objectStore("funcionarios");

    let getRequest = store.get(id); // Pega o número do registro do funcionário
    getRequest.onsuccess = function () { // Obteve sucesso ao obter o id do funcionário
        let funcionario = getRequest.result;
        if (funcionario) {
            Object.assign(funcionario, novosDados); // Atualiza os dados do funcionário
            let updateRequest = store.put(funcionario); // Atualiza os dados dos funcionários
            updateRequest.onsuccess = function () {
                console.log("Funcionário atualizado com sucesso!");
                mostrarFeedback("Dados atualizados com sucesso!", "success"); // Mostra feedback visual
                listarFuncionarios(); // Atualiza a lista após atualização
            };

            updateRequest.onerror = function (event) { // Alteração não realizada
                console.error("Erro ao atualizar funcionário:", event.target.error);
                mostrarFeedback("Erro ao atualizar funcionário!", "error"); // Exibe erro na interface
            };
        }
    };

    getRequest.onerror = function (event) { // Erro ao obter funcionário para atualização
        console.error("Erro ao obter funcionário para atualização:", event.target.error);
        mostrarFeedback("Erro ao carregar funcionário para atualização!", "error"); // Feedback visual
    };
}

// Função para deletar um funcionário com feedback visual
function deletarFuncionario(id) {
    let db = verificarDB();
    if (!db) return;

    let transaction = db.transaction("funcionarios", "readwrite");
    let store = transaction.objectStore("funcionarios");

    let deleteRequest = store.delete(id);
    deleteRequest.onsuccess = function () {
        console.log("Funcionário deletado com sucesso!");
        mostrarFeedback("Funcionário removido com sucesso!", "success"); // Exibe feedback visual
        listarFuncionarios(); // Atualiza a lista após remoção
    };

    deleteRequest.onerror = function (event) {
        console.error("Erro ao deletar funcionário:", event.target.error);
        mostrarFeedback("Erro ao remover funcionário!", "error"); // Mostra mensagem de erro
    };
}



// Mostrar feedback
function mostrarFeedback(mensagem, tipo) {
    let feedback = document.getElementById("feedback-msg");
    feedback.textContent = mensagem;
    feedback.className = `feedback ${tipo}`; // Aplica classe de sucesso ou erro
    feedback.style.display = "block";

    setTimeout(() => {
        feedback.style.display = "none"; // Oculta após 3 segundos
    }, 3000);
}



// Chamada inicial para listar funcionários ao carregar a página
window.onload = listarFuncionarios;