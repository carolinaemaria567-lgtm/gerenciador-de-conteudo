
const CHAVE = "hairBeautyProdutos";
let produtos = JSON.parse(localStorage.getItem(CHAVE) || "[]");

const $ = id => document.getElementById(id);
const dinheiro = n => Number(n).toLocaleString("pt-BR", {
    style: "currency", currency: "BRL"
});

function salvar() {
    localStorage.setItem(CHAVE, JSON.stringify(produtos));
    listar();
    atualizar();
}

function mostrar(pagina) {
    document.querySelectorAll(".pagina").forEach(p =>
        p.classList.add("escondido")
    );
    $(pagina).classList.remove("escondido");
    atualizar();
}

function limpar() {
    $("formulario").reset();
    $("id").value = "";
}

$("formulario").addEventListener("submit", e => {
    e.preventDefault();

    const dados = {
        nome: $("nome").value.trim(),
        marca: $("marca").value.trim(),
        categoria: $("categoria").value,
        preco: Number($("preco").value),
        estoque: Number($("estoque").value),
        descricao: $("descricao").value.trim()
    };

    if (!dados.nome || !dados.marca || !dados.categoria ||
        dados.preco < 0 || !Number.isFinite(dados.preco) ||
        !Number.isInteger(dados.estoque) || dados.estoque < 0) {
        alert("Confira os dados preenchidos.");
        return;
    }

    if ($("id").value) {
        const produto = produtos.find(p => p.id === Number($("id").value));
        if (produto) Object.assign(produto, dados);
    } else {
        dados.id = Date.now();
        produtos.push(dados);
    }

    limpar();
    salvar();
    alert("Produto salvo com sucesso! ♡");
});

function listar() {
    const busca = $("busca").value.toLowerCase();
    const filtro = $("filtro").value;

    const resultado = produtos.filter(p =>
        (p.nome.toLowerCase().includes(busca) ||
         p.marca.toLowerCase().includes(busca)) &&
        (!filtro || p.categoria === filtro)
    );

    $("lista").innerHTML = resultado.map(p => `
        <article class="produto">
            <h3>${escapar(p.nome)}</h3>
            <p>Marca: ${escapar(p.marca)} · ${escapar(p.categoria)}</p>
            <p>Preço: ${dinheiro(p.preco)}</p>
            <p>Estoque: <strong class="${
                p.estoque === 0 ? "sem-estoque" :
                p.estoque <= 5 ? "alerta" : ""
            }">${p.estoque} unidades</strong></p>
            <p>${escapar(p.descricao || "Sem descrição.")}</p>
            <button onclick="editar(${p.id})">Editar</button>
            <button onclick="excluir(${p.id})">Excluir</button>
        </article>
    `).join("") || "<p>Nenhum produto encontrado.</p>";
}

function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
    })[c]);
}

function editar(id) {
    const p = produtos.find(p => p.id === id);
    if (!p) return;

    $("id").value = p.id;
    $("nome").value = p.nome;
    $("marca").value = p.marca;
    $("categoria").value = p.categoria;
    $("preco").value = p.preco;
    $("estoque").value = p.estoque;
    $("descricao").value = p.descricao;

    mostrar("cadastro");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluir(id) {
    if (!confirm("Deseja excluir este produto?")) return;
    produtos = produtos.filter(p => p.id !== id);
    salvar();
}

function atualizar() {
    const unidades = produtos.reduce((s, p) => s + p.estoque, 0);
    const valor = produtos.reduce((s, p) => s + p.preco * p.estoque, 0);
    const baixos = produtos.filter(p => p.estoque <= 5);

    $("total").textContent = produtos.length;
    $("unidades").textContent = unidades;
    $("valor").textContent = dinheiro(valor);
    $("baixo").textContent = baixos.length;

    $("rProdutos").textContent = produtos.length;
    $("rUnidades").textContent = unidades;
    $("rValor").textContent = dinheiro(valor);

    $("alertas").innerHTML = baixos.map(p =>
        `<li>${escapar(p.nome)} — ${
            p.estoque === 0 ? "Sem estoque!" :
            `${p.estoque} unidades restantes`
        }</li>`
    ).join("") || "<li>Todos os produtos estão com estoque suficiente ♡</li>";
}

function exportar() {
    const linhas = [
        ["Nome", "Marca", "Categoria", "Preço", "Estoque", "Descrição"],
        ...produtos.map(p => [
            p.nome, p.marca, p.categoria, p.preco, p.estoque, p.descricao
        ])
    ];

    const csv = "\uFEFF" + linhas.map(linha =>
        linha.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")
    ).join("\r\n");

    const arquivo = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(arquivo);
    link.download = "relatorio-hair-beauty.csv";
    link.click();
    URL.revokeObjectURL(link.href);
}

listar();
atualizar();
