import {
  ArmchairIcon,
  BookOpenIcon,
  CameraIcon,
  CarIcon,
  CpuIcon,
  DumbbellIcon,
  Gamepad2Icon,
  HeadphonesIcon,
  KeyboardIcon,
  LaptopIcon,
  MonitorIcon,
  PawPrintIcon,
  PillIcon,
  ShirtIcon,
  SmartphoneIcon,
  TagIcon,
  ToyBrickIcon,
  UtensilsIcon,
  WatchIcon,
  type LucideIcon,
} from "lucide-react";

const REGRAS: Array<[RegExp, LucideIcon]> = [
  [/smartphone|celular|telefone/, SmartphoneIcon],
  [/informatica|notebook|laptop|computador/, LaptopIcon],
  [/periferico|teclado|mouse/, KeyboardIcon],
  [/audio|fone|headset|som\b|caixa de som/, HeadphonesIcon],
  [/monitor|televis|\btv\b/, MonitorIcon],
  [/cadeira|movel|moveis|sofa|casa|decor/, ArmchairIcon],
  [/hardware|processador|placa|memoria|armazenamento/, CpuIcon],
  [/gamer|game|jogo|console/, Gamepad2Icon],
  [/moda|roupa|camis|vestu/, ShirtIcon],
  [/esporte|fitness|academia/, DumbbellIcon],
  [/livro|papelaria/, BookOpenIcon],
  [/auto|carro|veiculo|moto/, CarIcon],
  [/farmacia|saude|beleza/, PillIcon],
  [/brinquedo|infantil/, ToyBrickIcon],
  [/\bpet\b|animais/, PawPrintIcon],
  [/cozinha|alimento|bebida|mercado/, UtensilsIcon],
  [/camera|foto/, CameraIcon],
  [/relogio|acessorio/, WatchIcon],
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function iconeDaCategoria(nome: string): LucideIcon {
  const chave = normalizar(nome);
  return REGRAS.find(([regra]) => regra.test(chave))?.[1] ?? TagIcon;
}
