import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NoteContent } from '@/components/note-content';
import { noteClasses, type Note } from '@/lib/notes';
export function WidgetPreview({notes}:{notes:Note[]}){
 const [id,setId]=useState('');const [size,setSize]=useState('small');const note=notes.find(n=>n.id===id)??notes[0];
 return <section className="widgets-screen"><h1>Widgets</h1><div className="widget-settings"><select aria-label="Nota do widget" value={note?.id??''} onChange={e=>setId(e.target.value)}>{notes.map(n=><option key={n.id} value={n.id}>{n.title}</option>)}</select><div className="ios-segment">{[{id:'small',label:'Pequeno'},{id:'medium',label:'Médio'},{id:'large',label:'Grande'}].map(s=><Button key={s.id} variant="ghost" className={size===s.id?'segment-active':''} onClick={()=>setSize(s.id)}>{s.label}</Button>)}</div></div><div className="widget-stage">{note?<div className={`widget-paper widget-${size} ${noteClasses(note)}`}><NoteContent note={note}/></div>:<p>Nenhuma nota disponível</p>}</div><p className="widget-size-caption">{size==='small'?'2 × 2':size==='medium'?'4 × 2':'4 × 4'}</p></section>;
}
