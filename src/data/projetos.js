// Índice: [ano, cliente, disciplina, cidade, filtro, foto]
const linhas = [
  [2025, 'Preamar', 'Produto digital', 'Recife', 'digital', 'preamar'],
  [2025, 'Prato Raso', 'Produto digital', 'João Pessoa', 'digital', 't18'],
  [2024, 'Torra Alta', 'Identidade e embalagem', 'Garanhuns', 'embalagem', 'torra-alta'],
  [2024, 'Engenho Vau', 'Rótulo', 'Pombos', 'embalagem', 't10'],
  [2024, 'Jandaíra', 'Embalagem', 'Mossoró', 'embalagem', 't20'],
  [2023, 'Sól', 'Identidade visual', 'Olinda', 'identidade', 'sol'],
  [2023, 'Cine Ladeira', 'Festival', 'Olinda', 'identidade', 't28'],
  [2023, 'Âmbar Botica', 'Embalagem', 'Natal', 'embalagem', 't05'],
  [2022, 'Restinga', 'Design editorial', 'Recife', 'editorial', 'restinga'],
  [2022, 'Taipa', 'Identidade', 'Caruaru', 'identidade', 't06'],
  [2022, 'Quadrante', 'Revista', 'Recife', 'editorial', 't23'],
  [2021, 'Sururu', 'Restaurante', 'Maceió', 'identidade', 't07'],
  [2021, 'Feira Aurora', 'Sinalização', 'Recife', 'identidade', 't21'],
  [2020, 'Maré Mansa', 'Cartaz e programa', 'Recife', 'editorial', 't17'],
  [2019, 'Casa Cajá', 'Identidade', 'Fortaleza', 'identidade', 't25'],
];

export const projetos = linhas.map(([ano, cliente, disciplina, cidade, filtro, foto]) => ({
  ano, cliente, disciplina, cidade, filtro, foto: `/trabalhos/${foto}.webp`,
}));

export const totalProjetos = 41;

export const filtros = [
  { id: 'todos', nome: 'Todos' },
  { id: 'identidade', nome: 'Identidade' },
  { id: 'embalagem', nome: 'Embalagem' },
  { id: 'editorial', nome: 'Editorial' },
  { id: 'digital', nome: 'Digital' },
];
