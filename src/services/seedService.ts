import { api, ApiError } from "@/services/api";
import { authService } from "@/services/authService";
import { categoriaService } from "@/services/categoriaService";
import { produtoService } from "@/services/produtoService";
import { vendedorService } from "@/services/vendedorService";
import type { Categoria, Vendedor } from "@/types";

export const SEED_UPDATED_EVENT = "marketplace:seed-updated";

export function notifySeedUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SEED_UPDATED_EVENT));
  }
}

const DEPARTAMENTOS_CANDIDATOS = [
  {
    nome: "Smartphones",
    descricao: "Celulares, smartphones e acessórios móveis de última geração.",
  },
  {
    nome: "Periféricos",
    descricao: "Teclados mecânicos, mouses gamer, webcams e mousepads.",
  },
  {
    nome: "Áudio",
    descricao: "Headsets, fones Bluetooth, caixas de som e microfones.",
  },
  {
    nome: "Monitores",
    descricao: "Monitores ultrawide, 4K e alta taxa de atualização.",
  },
  {
    nome: "Cadeiras Gamer",
    descricao: "Cadeiras ergonômicas e gamer para escritório e setup.",
  },
  {
    nome: "Hardware",
    descricao: "Processadores, placas de vídeo, memórias RAM e SSDs NVMe.",
  },
  {
    nome: "Casa Inteligente",
    descricao: "Lâmpadas smart, assistentes de voz, sensores e automação.",
  },
  {
    nome: "Redes e Wi-Fi",
    descricao: "Roteadores Wi-Fi 6, switches gigabit e repetidores Mesh.",
  },
];

const CATALOGO_PRODUTOS = [
  {
    nome: "Smartphone Galaxy S24 Ultra 256GB",
    descricao:
      "Tela Dynamic AMOLED 2X de 6.8 polegadas, câmera quádrupla de 200MP e caneta S-Pen integrada.",
    precoBase: 5899.9,
  },
  {
    nome: "Teclado Mecânico RGB Switch Brown ABNT2",
    descricao:
      "Teclado mecânico compacto 75% com switches táteis silenciosos, keycaps PBT double-shot e iluminação RGB.",
    precoBase: 349.9,
  },
  {
    nome: "Mouse Gamer Wireless 26000 DPI",
    descricao:
      "Sensor óptico de alta precisão, peso ultraleve de 59g, bateria para até 80 horas e receptor 2.4GHz.",
    precoBase: 429.0,
  },
  {
    nome: "Headset Bluetooth ANC Over-Ear",
    descricao:
      "Cancelamento ativo de ruído híbrido, drivers de 40mm, autonomia de 45h e conexão multiponto.",
    precoBase: 679.9,
  },
  {
    nome: "Monitor Gamer IPS 27\" QHD 165Hz",
    descricao:
      "Painel IPS Quad HD (2560x1440), tempo de resposta de 1ms, suporte HDR400 e ajuste de altura e pivô.",
    precoBase: 1899.0,
  },
  {
    nome: "Cadeira Ergonômica Mesh Presidente",
    descricao:
      "Apoio lombar adaptativo, encosto em tela respirável, braços 4D e mecanismo sincronizado com trava.",
    precoBase: 1249.9,
  },
  {
    nome: "SSD NVMe PCIe 4.0 1TB 7000MB/s",
    descricao:
      "Unidade de estado sólido M.2 2280 com dissipador em grafeno e leitura sequencial de até 7000 MB/s.",
    precoBase: 589.9,
  },
  {
    nome: "Roteador Mesh Wi-Fi 6 AX3000 Dual Band",
    descricao:
      "Cobertura para até 220m², portas Gigabit Ethernet, suporte MU-MIMO e controle parental via aplicativo.",
    precoBase: 459.9,
  },
  {
    nome: "Webcam Full HD 1080p 60fps com Microfone",
    descricao:
      "Foco automático rápido, correção de luz em ambientes escuros, tampa de privacidade e encaixe para tripé.",
    precoBase: 289.9,
  },
  {
    nome: "Notebook Ultrafino Core i7 16GB 512GB SSD",
    descricao:
      "Chassi em alumínio de 1.3kg, tela IPS Full HD antirreflexo de 14 polegadas e teclado retroiluminado.",
    precoBase: 4399.0,
  },
  {
    nome: "Caixa de Som Portátil Bluetooth 40W IP67",
    descricao:
      "Resistente à água e poeira, radiadores passivos duplos para graves intensos e até 20 horas de reprodução.",
    precoBase: 519.9,
  },
  {
    nome: "Placa de Vídeo RTX 4060 8GB GDDR6",
    descricao:
      "Arquitetura Ada Lovelace com suporte a DLSS 3, Ray Tracing de 3ª geração e sistema dual fan silencioso.",
    precoBase: 2199.0,
  },
  {
    nome: "Microfone Condensador USB Cardióide",
    descricao:
      "Captação profissional para podcasts e streaming, botão mute touch, saída para fone sem latência e pedestal.",
    precoBase: 379.9,
  },
  {
    nome: "Smartwatch AMOLED GPS Integrado 5ATM",
    descricao:
      "Monitoramento contínuo de frequência cardíaca, oxigenação SpO2, mais de 120 modos esportivos e bateria de 14 dias.",
    precoBase: 749.0,
  },
  {
    nome: "Hub USB-C 8 em 1 HDMI 4K 100W PD",
    descricao:
      "Expansor em alumínio com saída HDMI 4K@60Hz, rede Gigabit RJ45, leitor SD/MicroSD e 3 portas USB 3.0.",
    precoBase: 219.9,
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shortTag(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

async function garantirCategorias(existentes: Categoria[]): Promise<Categoria[]> {
  const lista = [...existentes];
  const nomesUsados = new Set(lista.map((c) => c.nome.toLowerCase()));

  // Escolhe até 2 departamentos ainda não presentes ou cria com sufixo curto
  const disponiveis = DEPARTAMENTOS_CANDIDATOS.filter(
    (d) => !nomesUsados.has(d.nome.toLowerCase()),
  );

  const qtdCriar = lista.length === 0 ? 2 : 1;
  for (let i = 0; i < qtdCriar; i++) {
    const base =
      disponiveis[i] ??
      DEPARTAMENTOS_CANDIDATOS[randomInt(0, DEPARTAMENTOS_CANDIDATOS.length - 1)];
    const nomeCandidato = nomesUsados.has(base.nome.toLowerCase())
      ? `${base.nome} #${shortTag()}`.slice(0, 50)
      : base.nome;

    try {
      const nova = await categoriaService.criar({
        nome: nomeCandidato,
        descricao: base.descricao,
      });
      lista.push(nova);
      nomesUsados.add(nova.nome.toLowerCase());
    } catch {
      // Se houver colisão eventual de nome, ignora e segue com as existentes
    }
  }

  return lista;
}

async function garantirVendedores(existentes: Vendedor[]): Promise<Vendedor[]> {
  if (existentes.length > 0) return existentes;
  const tag = shortTag();
  const num = randomInt(10000000, 99999999);
  const novo = await authService.registrarVendedor({
    nome: `Loja Tech ${tag}`,
    razaoSocial: `Comércio Eletrônico ${tag} LTDA`,
    cnpjCpf: `${num}000199`,
    email: `vendedor.${tag.toLowerCase()}@marketplace.com`,
    senha: "senha123",
  });
  return [novo];
}

async function gerarLoteAdicional(quantidade = 10): Promise<number> {
  const [catsIniciais, vendsIniciais] = await Promise.all([
    categoriaService.listarTodas(),
    vendedorService.listarTodos(),
  ]);

  const [categorias, vendedores] = await Promise.all([
    garantirCategorias(catsIniciais),
    garantirVendedores(vendsIniciais),
  ]);

  // Embaralha os templates para variar os produtos a cada clique
  const embaralhados = [...CATALOGO_PRODUTOS].sort(() => Math.random() - 0.5);
  const selecionados = embaralhados.slice(0, quantidade);
  const loteTag = shortTag();

  let criados = 0;
  for (let i = 0; i < selecionados.length; i++) {
    const tpl = selecionados[i];
    const categoria = categorias[i % categorias.length];
    const vendedor = vendedores[i % vendedores.length];
    const variacao = 1 + (randomInt(-8, 12) / 100);
    const preco = Math.max(19.9, Number((tpl.precoBase * variacao).toFixed(2)));
    const estoque = randomInt(3, 80);

    await produtoService.criar({
      nome: `${tpl.nome} [${loteTag}-${i + 1}]`.slice(0, 150),
      descricao: tpl.descricao,
      preco,
      estoque,
      idCategoria: categoria.id,
      idVendedor: vendedor.id,
    });
    criados += 1;
  }

  return criados;
}

export interface SeedResult {
  modo: "inicial" | "lote";
  criados?: number;
}

async function limparRemanescentes(): Promise<void> {
  // Remove todos os produtos restantes (ex.: criados manualmente ou em lotes extras)
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const page = await produtoService.listar(0);
    if (page.content.length === 0) break;
    const results = await Promise.allSettled(
      page.content.map((p) => produtoService.remover(p.id)),
    );
    const removeuAlgum = results.some((r) => r.status === "fulfilled");
    if (!removeuAlgum) break;
  }

  // Remove categorias restantes após zerar os produtos
  const categorias = await categoriaService.listarTodas();
  if (categorias.length > 0) {
    await Promise.allSettled(
      categorias.map((c) => categoriaService.remover(c.id)),
    );
  }
}

/** Endpoints restritos a ADMIN. */
export const seedService = {
  popular: () => api.post<unknown>("/seed/popular"),
  resetar: () => api.post<unknown>("/seed/resetar"),

  async limpar(): Promise<void> {
    await api.delete<unknown>("/seed/limpar");
    await limparRemanescentes();
  },

  /**
   * Seed cumulativo ("infinito"):
   * 1) Tenta POST /seed/popular (carga inicial do back-end quando o banco está vazio).
   * 2) Se falhar por duplicidade/conflito (400/409/500), gera um lote adicional de 10 produtos
   *    inéditos via API, sem esbarrar nas constraints UNIQUE.
   */
  async popularInfinito(): Promise<SeedResult> {
    try {
      await this.popular();
      return { modo: "inicial" };
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        throw error;
      }
      const criados = await gerarLoteAdicional(10);
      return { modo: "lote", criados };
    }
  },
};
