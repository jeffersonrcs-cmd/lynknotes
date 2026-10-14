export type NoteColor = 'yellow' | 'pink' | 'green' | 'blue' | 'purple' | 'peach';
export type Note = {
  id: string; title: string; content: string; color: NoteColor; kind: 'text' | 'checklist';
  category: string; items: { text: string; done: boolean }[];
  pinned: boolean; archived: boolean; deleted: boolean; updated_at: string;
};
export const colors: NoteColor[] = ['yellow', 'pink', 'green', 'blue', 'purple', 'peach'];
export const colorNames = { yellow: 'Amarelo', pink: 'Rosa', green: 'Verde', blue: 'Azul', purple: 'Lilás', peach: 'Pêssego' };
export function newNote(color: NoteColor = 'yellow', kind: Note['kind'] = 'text'): Note {
  return { id: crypto.randomUUID(), title: '', content: '', color, kind, category: 'Pessoal', items: [], pinned: false, archived: false, deleted: false, updated_at: new Date().toISOString() };
}
const base = { archived: false, deleted: false, updated_at: '2026-10-14T12:00:00Z', items: [], kind: 'text' as const };
export const examples: Note[] = [
  { ...base, id: 'demo-1', title: 'Um lembrete para mim', content: 'Não precisa dar conta de tudo hoje.\n\nUma coisa de cada vez.\nUm passo de cada vez.\n\nVocê está indo bem. ♡', color: 'yellow', category: 'Pessoal', pinned: true },
  { ...base, id: 'demo-2', title: 'Ideias que merecem sair do papel ✨', content: 'Criar uma newsletter sobre as pequenas coisas do dia.\n\nFazer um curso de cerâmica.\n\nComeçar aquele projeto que está sempre ficando para depois.', color: 'purple', category: 'Ideias', pinned: true },
  { ...base, id: 'demo-3', title: 'Minha semana', content: '', color: 'green', kind: 'checklist', category: 'Trabalho', pinned: false, items: [{text:'Organizar a mesa de trabalho',done:true},{text:'Finalizar a apresentação',done:false},{text:'Responder os e-mails',done:false},{text:'Pausa para um café ☕',done:false}] },
  { ...base, id: 'demo-4', title: 'Próxima parada: Itália', content: 'Dias de sol, ruas sem pressa e um gelato em cada esquina. 🍋\n\nSetembro, quem sabe?', color: 'peach', category: 'Pessoal', pinned: false },
  { ...base, id: 'demo-5', title: 'Para não esquecer', content: '“A criatividade é a inteligência se divertindo.”\n\n— Albert Einstein', color: 'pink', category: 'Ideias', pinned: false },
  { ...base, id: 'demo-6', title: 'Lista do mercado', content: '', color: 'blue', kind: 'checklist', category: 'Pessoal', pinned: false, items: [{text:'Abacate e bananas',done:false},{text:'Pão de fermentação natural',done:false},{text:'Leite de aveia',done:true},{text:'Flores para a sala 🌷',done:false}] },
  { ...base, id: 'demo-7', title: 'Pequenas alegrias', content: 'O cheiro do café de manhã.\nUma música descoberta por acaso.\nConversas que fazem o tempo voar.\n\nMais disso, por favor. ☀', color: 'yellow', category: 'Pessoal', pinned: false },
  { ...base, id: 'demo-8', title: 'Projeto novo', content: 'Menos ruído, mais intenção.\n\nExplorar uma paleta mais natural e deixar espaço para as ideias respirarem.', color: 'purple', category: 'Trabalho', pinned: false },
];