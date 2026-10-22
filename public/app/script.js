/* =========================================================
   Passo a Passo — script principal
   Tudo é salvo no localStorage do navegador.
   ========================================================= */

// ---------- 1. DADOS E SALVAMENTO ----------
const CHAVE = "passoapasso-tarefas";
// Cada tarefa: { id, titulo, feita, bloco: ""|"manha"|"tarde"|"noite", passos: [{id, texto, feito}] }
let tarefas = JSON.parse(localStorage.getItem(CHAVE) || "[]");

function salvar() {
  localStorage.setItem(CHAVE, JSON.stringify(tarefas));
}
function novoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function acharTarefa(id) {
  return tarefas.find(t => t.id === id);
}

const NOMES_BLOCO = { manha: "☀️ Manhã", tarde: "🌤️ Tarde", noite: "🌙 Noite" };

// ---------- 2. ABAS ----------
document.querySelectorAll(".aba").forEach(botao => {
  botao.addEventListener("click", () => {
    document.querySelectorAll(".aba").forEach(b => b.classList.remove("ativa"));
    document.querySelectorAll(".painel").forEach(p => p.classList.remove("ativo"));
    botao.classList.add("ativa");
    document.getElementById(botao.dataset.aba).classList.add("ativo");
    if (botao.dataset.aba === "rotina") desenharRotina(); // atualiza só ao abrir
  });
});

// ---------- 3. TAREFAS ----------
const lista = document.getElementById("lista-tarefas");
const avisoVazio = document.getElementById("vazio-tarefas");

// Cria o elemento <li> de UMA tarefa (assim só redesenhamos o que mudou)
function criarItemTarefa(t) {
  const li = document.createElement("li");
  li.className = "tarefa" + (t.feita ? " feita" : "");
  li.dataset.id = t.id;
  li.innerHTML = `
    <div class="tarefa-topo">
      <input type="checkbox" class="marcar" aria-label="Concluir tarefa" ${t.feita ? "checked" : ""}>
      <span class="titulo"></span>
      <button class="icone acao-bloco" title="Escolher período">🗓️</button>
      <button class="icone acao-editar" title="Editar">✏️</button>
      <button class="icone acao-excluir" title="Excluir">🗑️</button>
    </div>
    ${t.bloco ? `<span class="etiqueta">${NOMES_BLOCO[t.bloco]}</span>` : ""}
    <div class="progresso" ${t.passos.length ? "" : "hidden"}>
      <span class="texto-progresso"></span>
      <div class="barra"><span></span></div>
    </div>
    <ul class="passos"></ul>
    <form class="linha form-passo">
      <input type="text" placeholder="Adicionar um passo pequeno" maxlength="100" required>
      <button class="btn btn-sec" type="submit">+ Passo</button>
    </form>`;
  li.querySelector(".titulo").textContent = t.titulo; // textContent evita HTML injetado
  const ul = li.querySelector(".passos");
  t.passos.forEach(p => ul.appendChild(criarItemPasso(p)));
  atualizarProgresso(li, t);
  return li;
}

function criarItemPasso(p) {
  const li = document.createElement("li");
  li.className = "passo" + (p.feito ? " feito" : "");
  li.dataset.passo = p.id;
  li.innerHTML = `<input type="checkbox" class="marcar-passo" aria-label="Concluir passo" ${p.feito ? "checked" : ""}>
    <span></span><button class="icone excluir-passo" title="Remover passo">✕</button>`;
  li.querySelector("span").textContent = p.texto;
  return li;
}

// Atualiza texto "2 de 5 passos feitos" e a barra
function atualizarProgresso(li, t) {
  const total = t.passos.length;
  const feitos = t.passos.filter(p => p.feito).length;
  const caixa = li.querySelector(".progresso");
  caixa.hidden = total === 0;
  li.querySelector(".texto-progresso").textContent = `${feitos} de ${total} passos feitos`;
  li.querySelector(".barra span").style.width = total ? (feitos / total * 100) + "%" : "0";
}

function atualizarVazio() {
  avisoVazio.hidden = tarefas.length > 0;
}

// Troca só o item de uma tarefa pelo novo
function redesenharTarefa(t) {
  const antigo = lista.querySelector(`[data-id="${t.id}"]`);
  if (antigo) antigo.replaceWith(criarItemTarefa(t));
}

// Desenho inicial
tarefas.forEach(t => lista.appendChild(criarItemTarefa(t)));
atualizarVazio();

// Adicionar tarefa
document.getElementById("form-tarefa").addEventListener("submit", e => {
  e.preventDefault();
  const campo = document.getElementById("nova-tarefa");
  const titulo = campo.value.trim();
  if (!titulo) return;
  const t = { id: novoId(), titulo, feita: false, bloco: "", passos: [] };
  tarefas.push(t);
  salvar();
  lista.appendChild(criarItemTarefa(t));
  campo.value = "";
  atualizarVazio();
});

// Um só "ouvinte" para cliques na lista (delegação de eventos)
lista.addEventListener("click", e => {
  const li = e.target.closest(".tarefa");
  if (!li) return;
  const t = acharTarefa(li.dataset.id);

  if (e.target.classList.contains("acao-excluir")) {
    if (!confirm("Excluir esta tarefa?")) return;
    tarefas = tarefas.filter(x => x.id !== t.id);
    salvar();
    li.remove();
    atualizarVazio();
  } else if (e.target.classList.contains("acao-editar")) {
    const novo = prompt("Editar tarefa:", t.titulo);
    if (novo && novo.trim()) {
      t.titulo = novo.trim();
      salvar();
      li.querySelector(".titulo").textContent = t.titulo;
    }
  } else if (e.target.classList.contains("acao-bloco")) {
    const resp = prompt("Em qual período? Digite: 1 = Manhã, 2 = Tarde, 3 = Noite, 0 = Nenhum", "1");
    const mapa = { "0": "", "1": "manha", "2": "tarde", "3": "noite" };
    if (resp !== null && resp.trim() in mapa) {
      t.bloco = mapa[resp.trim()];
      salvar();
      redesenharTarefa(t);
    }
  } else if (e.target.classList.contains("excluir-passo")) {
    const pid = e.target.closest(".passo").dataset.passo;
    t.passos = t.passos.filter(p => p.id !== pid);
    salvar();
    e.target.closest(".passo").remove();
    atualizarProgresso(li, t);
  }
});

// Checkboxes (tarefa e passos)
lista.addEventListener("change", e => {
  const li = e.target.closest(".tarefa");
  const t = acharTarefa(li.dataset.id);
  if (e.target.classList.contains("marcar")) {
    t.feita = e.target.checked;
    li.classList.toggle("feita", t.feita);
  } else if (e.target.classList.contains("marcar-passo")) {
    const itemPasso = e.target.closest(".passo");
    const p = t.passos.find(x => x.id === itemPasso.dataset.passo);
    p.feito = e.target.checked;
    itemPasso.classList.toggle("feito", p.feito);
    atualizarProgresso(li, t);
  }
  salvar();
});

// Adicionar passo
lista.addEventListener("submit", e => {
  e.preventDefault();
  const li = e.target.closest(".tarefa");
  const t = acharTarefa(li.dataset.id);
  const campo = e.target.querySelector("input");
  const texto = campo.value.trim();
  if (!texto) return;
  const p = { id: novoId(), texto, feito: false };
  t.passos.push(p);
  salvar();
  li.querySelector(".passos").appendChild(criarItemPasso(p));
  atualizarProgresso(li, t);
  campo.value = "";
});

// Limpar tudo
document.getElementById("limpar-tudo").addEventListener("click", () => {
  if (!confirm("Tem certeza? Todas as tarefas serão apagadas.")) return;
  tarefas = [];
  salvar();
  lista.innerHTML = "";
  atualizarVazio();
});

// ---------- 4. ROTINA ----------
function desenharRotina() {
  ["manha", "tarde", "noite"].forEach(b => {
    const ul = document.getElementById("bloco-" + b);
    ul.innerHTML = "";
    const doBloco = tarefas.filter(t => t.bloco === b);
    if (!doBloco.length) {
      ul.innerHTML = '<li class="vazio">Livre por enquanto.</li>';
      return;
    }
    doBloco.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t.titulo;
      if (t.feita) li.className = "feita";
      ul.appendChild(li);
    });
  });
}

// ---------- 5. TIMER DE FOCO ----------
const relogio = document.getElementById("relogio");
const msgFoco = document.getElementById("msg-foco");
const btnSom = document.getElementById("btn-som");
let minutosEscolhidos = 25;
let segundosRestantes = 25 * 60;
let intervalo = null;
let somLigado = localStorage.getItem("passoapasso-som") !== "off";

function mostrarTempo() {
  const m = String(Math.floor(segundosRestantes / 60)).padStart(2, "0");
  const s = String(segundosRestantes % 60).padStart(2, "0");
  relogio.textContent = `${m}:${s}`;
}
function atualizarBotaoSom() {
  btnSom.textContent = somLigado ? "🔔 Som ligado" : "🔕 Som desligado";
}
atualizarBotaoSom();

// Bipe simples gerado pelo navegador (sem arquivo de áudio)
function tocarAviso() {
  if (!somLigado) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.4].forEach(atraso => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.frequency.value = 660;
      vol.gain.value = 0.15;
      osc.connect(vol).connect(ctx.destination);
      osc.start(ctx.currentTime + atraso);
      osc.stop(ctx.currentTime + atraso + 0.25);
    });
  } catch (e) { /* navegador sem áudio: tudo bem */ }
}

function pausar() {
  clearInterval(intervalo);
  intervalo = null;
}

document.querySelectorAll(".tempo").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".tempo").forEach(x => x.classList.remove("ativo"));
    b.classList.add("ativo");
    pausar();
    minutosEscolhidos = Number(b.dataset.min);
    segundosRestantes = minutosEscolhidos * 60;
    msgFoco.hidden = true;
    mostrarTempo();
  });
});

document.getElementById("btn-iniciar").addEventListener("click", () => {
  if (intervalo) return; // já está rodando
  if (segundosRestantes <= 0) segundosRestantes = minutosEscolhidos * 60;
  msgFoco.hidden = true;
  intervalo = setInterval(() => {
    segundosRestantes--;
    mostrarTempo();
    if (segundosRestantes <= 0) {
      pausar();
      msgFoco.textContent = "🌿 Você terminou esse tempo de foco. Que tal uma pausa para respirar e beber água?";
      msgFoco.hidden = false;
      tocarAviso();
    }
  }, 1000);
});

document.getElementById("btn-pausar").addEventListener("click", pausar);

document.getElementById("btn-reiniciar").addEventListener("click", () => {
  pausar();
  segundosRestantes = minutosEscolhidos * 60;
  msgFoco.hidden = true;
  mostrarTempo();
});

btnSom.addEventListener("click", () => {
  somLigado = !somLigado;
  localStorage.setItem("passoapasso-som", somLigado ? "on" : "off");
  atualizarBotaoSom();
});
