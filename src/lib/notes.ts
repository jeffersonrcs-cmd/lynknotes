import { z } from 'zod';
export type NoteColor = 'yellow' | 'pink' | 'green' | 'blue' | 'purple' | 'peach';
export type NoteKind = 'text' | 'checklist' | 'reminder' | 'draw' | 'bookmark';
export const appearanceSchema = z.object({ font: z.enum(['caveat','marker','oswald','quicksand']).default('quicksand'), size:z.enum(['small','medium','large']).default('medium'), align:z.enum(['left','center','right']).default('left'), reminder:z.string().max(40).default(''), drawing:z.string().max(1500000).default(''), url:z.string().max(2048).default(''), previewTitle:z.string().max(300).default(''), previewImage:z.string().max(2048).default('') });
export type Appearance = z.infer<typeof appearanceSchema>;
export const defaultAppearance:Appearance = appearanceSchema.parse({});
export type Note = { id:string; title:string; content:string; color:NoteColor; kind:NoteKind; category:string; items:{text:string;done:boolean}[]; pinned:boolean; archived:boolean; deleted:boolean; updated_at:string; appearance:Appearance };
export const colors:NoteColor[]=['yellow','pink','green','blue','purple','peach'];
export const colorNames={yellow:'Amarelo',pink:'Rosa',green:'Verde',blue:'Azul',purple:'Lilás',peach:'Laranja'};
export const kindNames:Record<NoteKind,string>={text:'Memo',checklist:'Checklist',reminder:'Reminder',draw:'Draw',bookmark:'Bookmark'};
export function newNote(color:NoteColor='yellow',kind:NoteKind='text'):Note{return {id:crypto.randomUUID(),title:'',content:'',color,kind,category:'Pessoal',items:[],pinned:false,archived:false,deleted:false,updated_at:new Date().toISOString(),appearance:{...defaultAppearance}};}
const base={archived:false,deleted:false,pinned:false,updated_at:'2026-10-14T12:00:00Z',items:[],kind:'text' as const,category:'Pessoal',appearance:defaultAppearance};
export const examples:Note[]=[
 {...base,id:'demo-1',title:'Groceries',content:'',color:'green',kind:'checklist',items:[{text:'Soy milk',done:false},{text:'Fish',done:true},{text:'Eggs',done:false},{text:'Avocado',done:true}]},
 {...base,id:'demo-2',title:'Times Square,',content:'Monday\n11:45',color:'pink',kind:'reminder',appearance:{...defaultAppearance,font:'oswald',align:'center',reminder:'2026-10-19T11:45'}},
 {...base,id:'demo-3',title:'Pin',content:'3672',color:'yellow',appearance:{...defaultAppearance,font:'marker',align:'center',size:'large'}},
 {...base,id:'demo-4',title:'Weekend plans',content:'A little sunshine,\na good book\nand absolutely\nno rush.',color:'blue',appearance:{...defaultAppearance,font:'caveat',size:'large'}},
 {...base,id:'demo-5',title:'My ideas',content:'Make something\nwonderful today!',color:'purple',appearance:{...defaultAppearance,font:'quicksand',align:'center'}},
 {...base,id:'demo-6',title:'Don’t forget',content:'Call mom ♥\nWater the plants\nTake a little break',color:'peach',appearance:{...defaultAppearance,font:'caveat'}},
];
export function noteClasses(note:Note){return `note-${note.color} font-${note.appearance.font} size-${note.appearance.size} align-${note.appearance.align}`;}
