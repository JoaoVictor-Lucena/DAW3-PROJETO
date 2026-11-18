export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  /** Rota do front para abrir ao clicar (ex.: /conta/pedidos/10). */
  link: string | null;
  idPedido: number | null;
  lida: boolean;
  dataCriacao: string;
}
