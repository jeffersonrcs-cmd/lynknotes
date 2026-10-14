import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { StickyNote, Plus, Search, Pin, Archive, Trash2, LayoutGrid, List, ArrowUpRight, Check, MoreHorizontal, X, LogOut, SlidersHorizontal, Menu, RotateCcw, ListTodo, Cloud, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Toaster, toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { NoteEditor } from '@/components/note-editor';
import { colors, colorNames, examples, newNote, type Note, type NoteColor } from '@/lib/notes';
import travel from '@/assets/travel.jpg';
import type { User } from '@supabase/supabase-js';

export const Route = createFileRoute('/')({
  head: () => ({meta:[{title:'Sticky — Suas ideias, em cores'},{name:'description',content:'Seu espaço para notas coloridas, listas e pequenas grandes ideias.'},{property:'og:title',content:'Sticky — Suas ideias, em cores'},{property:'og:description',content:'Notas, listas e ideias em um mural cheio de personalidade.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component: Index,
});

function Index() {
  const [notes,setNotes] = useState<Note[]>(examples);
  const [user,setUser] = useState<User | null>(null);
  const [loading,setLoading] = useState(false);
  const [view,setView] = useState('Todas as notas');
  const [category,setCategory] = useState('Todas');
  const [color,setColor] = useState<NoteColor | null>(null);
  const [query,setQuery] = useState('');
  const [layout,setLayout] = useState('grid');
  const [sort,setSort] = useState('recent');
  const [editor,setEditor] = useState<Note | null>(null);
  const [auth,setAuth] = useState(false);
  const [mobile,setMobile] = useState(false);
  const [authMode,setAuthMode] = useState<'login'|'signup'|'reset'|'password'>('login');
  const [busy,setBusy] = useState(false);
  const [authError,setAuthError] = useState('');

  useEffect(()=>{
    let active = true;
    async function load(current:User|null) {
      setUser(current);
      if(!current){setNotes(examples);return;}
      setLoading(true);
      const {data,error}=await supabase.from('notes').select('*').order('updated_at',{ascending:false});
      if(!active)return;
      if(error)toast.error('Não foi possível carregar suas notas.');
      else setNotes((data ?? []).map(row=>({...row,color:row.color as NoteColor,kind:row.kind as Note['kind'],items:Array.isArray(row.items)?row.items.filter((x):x is {text:string;done:boolean}=>!!x&&typeof x==='object'&&'text' in x&&typeof x['text']==='string'&&'done' in x&&typeof x['done']==='boolean'):[]})));
      setLoading(false);
    }
    void supabase.auth.getSession().then(({data})=>load(data.session?.user??null));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY'){setAuthMode('password');setAuth(true);}if(event==='SIGNED_IN'||event==='SIGNED_OUT'){void load(session?.user??null);if(session && event!=='SIGNED_IN')setAuth(false);}});
    return ()=>{active=false;subscription.unsubscribe();};
  },[]);

  async function save(note:Note) {
    if(!user){setNotes(old=>old.some(n=>n.id===note.id)?old.map(n=>n.id===note.id?note:n):[note,...old]);toast.success('Nota salva nesta demonstração');return;}
    const {error}=await supabase.from('notes').upsert({...note,user_id:user.id});
    if(error){toast.error('Não foi possível salvar. Tente novamente.');throw error;}
    setNotes(old=>old.some(n=>n.id===note.id)?old.map(n=>n.id===note.id?note:n):[note,...old]);
    toast.success('Nota salva');
  }
  async function change(note:Note,patch:Partial<Note>){try{await save({...note,...patch,updated_at:new Date().toISOString()});}catch{/* The save action displays the error. */}}
  async function remove(note:Note){
    if(!window.confirm('Excluir esta nota definitivamente?'))return;
    if(user){const {error}=await supabase.from('notes').delete().eq('id',note.id);if(error){toast.error('Não foi possível excluir.');return;}}
    setNotes(old=>old.filter(n=>n.id!==note.id));toast.success('Nota excluída');
  }
  const visible=notes.filter(n=>{
    if(view==='Lixeira'?!n.deleted:n.deleted)return false;
    if(view==='Arquivadas'?!n.archived:(view!=='Lixeira'&&n.archived))return false;
    return (view!=='Fixadas'||n.pinned)&&(category==='Todas'||n.category===category)&&(!color||n.color===color)&&`${n.title} ${n.content} ${n.items.map(x=>x.text).join(' ')}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
  }).sort((a,b)=>sort==='title'?a.title.localeCompare(b.title):b.updated_at.localeCompare(a.updated_at));
  const pinned=visible.filter(n=>n.pinned);
  const others=visible.filter(n=>!n.pinned);
  const activeNotes=notes.filter(n=>!n.deleted&&!n.archived);
  const openNew=(c:NoteColor='yellow',kind:Note['kind']='text')=>setEditor(newNote(c,kind));
  function section(title:string,list:Note[],icon?:boolean){return list.length>0&&<section className="notes-section"><div className="section-label">{icon&&<Pin size={13}/>}<h2>{title}</h2><span>{list.length}</span></div><div className={`notes-grid ${layout==='list'?'notes-list':''}`}>{list.map(note=><article key={note.id} className={`sticky-card note-${note.color}`}>
    <div className="note-top"><span className="note-category">{note.category}</span><div className="flex items-center gap-1">{note.pinned&&<Pin size={14} className="rotate-[-25deg]"/>}<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Opções de ${note.title}`} className="note-menu"><MoreHorizontal/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>void change(note,{pinned:!note.pinned})}><Pin/>{note.pinned?'Desafixar':'Fixar nota'}</DropdownMenuItem><DropdownMenuItem onSelect={()=>void change(note,{archived:!note.archived})}><Archive/>{note.archived?'Desarquivar':'Arquivar'}</DropdownMenuItem><DropdownMenuItem onSelect={()=>void change(note,{deleted:!note.deleted})}>{note.deleted?<RotateCcw/>:<Trash2/>}{note.deleted?'Restaurar':'Mover para a lixeira'}</DropdownMenuItem>{note.deleted&&<DropdownMenuItem onSelect={()=>void remove(note)}><Trash2/>Excluir definitivamente</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></div></div>
    <div role="button" tabIndex={0} aria-label={`Editar ${note.title}`} className="note-body" onClick={()=>setEditor(note)} onKeyDown={e=>{if(e.key==='Enter')setEditor(note);}}><h3>{note.title}</h3>{note.id==='demo-4'&&<img src={travel} alt="Casas coloridas à beira do mar na Itália" width={1024} height={768} loading="lazy" className="travel-photo"/>}{note.kind==='text'&&<p className="note-hand whitespace-pre-line">{note.content}</p>}</div>
    {note.kind==='checklist'&&<div className="note-checklist">{note.items.map((item,i)=><label key={i} className={item.done?'item-done':''}><input type="checkbox" checked={item.done} onChange={()=>void change(note,{items:note.items.map((x,j)=>i===j?{...x,done:!x.done}:x)})}/><span>{item.text}</span></label>)}</div>}
    <div className="note-footer"><span>{new Date(note.updated_at).toLocaleDateString('pt-BR',{day:'numeric',month:'short'}).replace('.','')}</span>{note.kind==='checklist'?<span>{note.items.filter(x=>x.done).length}/{note.items.length} concluídos</span>:<Button aria-label={`Abrir ${note.title}`} title="Abrir nota" size="icon" variant="ghost" onClick={()=>setEditor(note)}><ArrowUpRight/></Button>}</div>
  </article>)}</div></section>;}

  return <div className="app-shell"><Toaster position="bottom-right" richColors/>
    {mobile&&<div className="sidebar-backdrop" onClick={()=>setMobile(false)}/>}
    <aside className={`sidebar ${mobile?'sidebar-open':''}`}>
      <a href="/" className="brand"><span className="brand-mark"><StickyNote size={23}/></span>sticky<span className="brand-period">.</span></a>
      <Button className="new-note-button" onClick={()=>openNew()}><Plus size={20}/>Nova nota<span className="plus-hint">+</span></Button>
      <p className="nav-caption">MEU ESPAÇO</p>
      <nav className="main-nav">{[{name:'Todas as notas',icon:StickyNote,count:activeNotes.length},{name:'Fixadas',icon:Pin,count:activeNotes.filter(n=>n.pinned).length},{name:'Arquivadas',icon:Archive,count:notes.filter(n=>n.archived&&!n.deleted).length},{name:'Lixeira',icon:Trash2,count:notes.filter(n=>n.deleted).length}].map(({name,icon:Icon,count})=><Button key={name} variant="ghost" className={`nav-item ${view===name?'nav-active':''}`} onClick={()=>{setView(name);setCategory('Todas');setMobile(false);}}><Icon size={18}/>{name}<span className="nav-count">{count||''}</span></Button>)}</nav>
      <div className="sidebar-divider"/><div className="flex justify-between items-center"><p className="nav-caption">CATEGORIAS</p><span className="text-muted-foreground text-xs">3</span></div>
      <nav className="category-nav">{['Pessoal','Trabalho','Ideias'].map((c,i)=><Button key={c} variant="ghost" className={`nav-item ${category===c?'category-active':''}`} onClick={()=>{setCategory(category===c?'Todas':c);setView('Todas as notas');setMobile(false);}}><span className={`category-dot dot-${i}`}/>{c}<span className="nav-count">{activeNotes.filter(n=>n.category===c).length}</span></Button>)}</nav>
      <div className="sidebar-bottom"><div className="little-note"><Sparkles size={17}/><p>Grandes ideias começam<br/>com uma pequena nota.</p><span>✳</span></div><Button variant="ghost" className="account-button" onClick={()=>user?void supabase.auth.signOut():setAuth(true)}><span className="avatar">{user?(user.email?.slice(0,1).toUpperCase()??'V'):'V'}</span><span><strong>{user?'Meu espaço':'Seu espaço criativo'}</strong><small>{user?user.email:'Entre para salvar suas notas'}</small></span>{user?<LogOut size={16}/>:<ArrowUpRight size={16}/>}</Button></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="flex items-center gap-3"><Button className="mobile-menu" variant="ghost" size="icon" aria-label="Abrir menu" onClick={()=>setMobile(true)}><Menu/></Button><span className="breadcrumb">Meu espaço<span>/</span><strong>{view}</strong></span></div><div className="topbar-right"><span className="cloud-status"><Cloud size={16}/>{user?'Seu espaço privado':'Um cantinho para suas ideias'}</span><Button variant="ghost" size="icon" className="top-avatar" aria-label="Minha conta" onClick={()=>setAuth(true)}>{user?user.email?.slice(0,1).toUpperCase():'V'}</Button></div></header>
    <main className="workspace"><div className="page-heading"><div><div className="eyebrow"><span/>UM POUCO MAIS DE COR NO SEU DIA</div><h1>{category!=='Todas'?category:view}<span className="heading-spark">✳</span></h1><p>Ideias soltas, planos e tudo o que vale lembrar.</p></div><Button className="desktop-create" onClick={()=>openNew()}><Plus/>Criar nota</Button></div>
      <div className="quick-capture"><div className="capture-label"><span className="capture-icon"><Plus size={19}/></span><Button variant="ghost" onClick={()=>openNew()} className="capture-placeholder">O que você quer lembrar?</Button></div><div className="capture-tools"><div className="capture-colors">{colors.slice(0,5).map(c=><Button key={c} aria-label={`Criar nota ${colorNames[c].toLowerCase()}`} title={`Nova nota ${colorNames[c].toLowerCase()}`} variant="ghost" className={`color-swatch note-${c}`} onClick={()=>openNew(c)}/>)}</div><span className="tool-divider"/><Button variant="ghost" size="icon" title="Nova lista" aria-label="Nova lista" onClick={()=>openNew('green','checklist')}><ListTodo/></Button></div></div>
      <div className="board-toolbar"><div className="filter-tabs">{['Todas','Pessoal','Trabalho','Ideias'].map(c=><Button key={c} variant="ghost" className={category===c?'filter-active':''} onClick={()=>setCategory(c)}>{c}{c==='Todas'&&<span>{activeNotes.length}</span>}</Button>)}</div><div className="board-controls"><div className="search-box"><Search size={16}/><input aria-label="Buscar notas" placeholder="Buscar notas..." value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<Button size="icon" variant="ghost" aria-label="Limpar busca" onClick={()=>setQuery('')}><X size={14}/></Button>}</div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Filtrar por cor" title="Filtrar por cor" className={color?'bg-secondary':''}><SlidersHorizontal size={17}/></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={()=>setColor(null)}>Todas as cores</DropdownMenuItem>{colors.map(c=><DropdownMenuItem key={c} onSelect={()=>setColor(c)}><span className={`tiny-swatch note-${c}`}/>{colorNames[c]}{color===c&&<Check size={14}/>}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu><span className="tool-divider"/><div className="layout-toggle"><Button aria-label="Visualização em grade" title="Grade" variant="ghost" size="icon" className={layout==='grid'?'layout-active':''} onClick={()=>setLayout('grid')}><LayoutGrid size={16}/></Button><Button aria-label="Visualização em lista" title="Lista" variant="ghost" size="icon" className={layout==='list'?'layout-active':''} onClick={()=>setLayout('list')}><List size={17}/></Button></div></div></div>
      <div className="board-meta"><span>{visible.length} notas{!user&&<span className="demo-badge">DEMONSTRAÇÃO</span>}</span><select aria-label="Ordenar notas" value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">Mais recentes primeiro</option><option value="title">Título A–Z</option></select></div>
      {loading?<div className="empty-state">Carregando suas ideias...</div>:visible.length===0?<div className="empty-state"><StickyNote size={38}/><h2>{query?'Nenhuma nota encontrada':'Um espaço para começar'}</h2><p>{query?'Tente outra palavra ou escolha outra categoria.':'Sua próxima ideia merece uma nota.'}</p><Button onClick={()=>openNew()}><Plus/>Criar nota</Button></div>:<>{section('FIXADAS',pinned,true)}{section(pinned.length?'OUTRAS NOTAS':'SUAS NOTAS',others)}</>}
      <footer className="workspace-footer"><span>Feito para deixar a mente mais leve.</span><span>Menos na cabeça. Mais no papel. <span className="footer-star">✳</span></span></footer>
    </main></div>
    <NoteEditor note={editor} onClose={()=>setEditor(null)} onSave={save}/>
    <Dialog open={auth} onOpenChange={setAuth}><DialogContent className="auth-dialog"><DialogTitle className="text-2xl">{authMode==='password'?'Escolha uma nova senha':user?'Seu espaço':authMode==='signup'?'Dê um lar às suas ideias.':authMode==='reset'?'Recuperar acesso':'Suas ideias, sempre com você.'}</DialogTitle><DialogDescription>{user?'Suas notas ficam guardadas na sua conta.':'Entre para guardar suas notas com privacidade.'}</DialogDescription>{authMode==='password'?<form className="space-y-3" onSubmit={async e=>{e.preventDefault();setBusy(true);const password=String(new FormData(e.currentTarget).get('password'));const {error}=await supabase.auth.updateUser({password});setBusy(false);if(error)setAuthError('Não foi possível alterar sua senha.');else{toast.success('Senha atualizada');setAuth(false);setAuthMode('login');}}}><label className="auth-label">Nova senha<input type="password" name="password" required minLength={8} maxLength={128} autoComplete="new-password"/></label>{authError&&<p className="text-destructive text-sm" role="alert">{authError}</p>}<Button type="submit" disabled={busy}>{busy?'Salvando...':'Salvar senha'}</Button></form>:user?<><p className="text-sm">{user.email}</p><Button onClick={()=>{void supabase.auth.signOut();setAuth(false);}}>Sair da conta</Button></>:<><Button variant="outline" disabled={busy} onClick={async()=>{const result=await lovable.auth.signInWithOAuth('google',{redirect_uri:window.location.origin});if(result.error)setAuthError('Não foi possível entrar com o Google.');}}><span className="font-bold">G</span>Continuar com Google</Button><div className="auth-or">ou com seu e-mail</div><form className="space-y-3" onSubmit={async e=>{e.preventDefault();setBusy(true);setAuthError('');const form=new FormData(e.currentTarget);const email=String(form.get('email'));const password=String(form.get('password'));try{if(authMode==='reset'){const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});if(error)throw error;toast.success('Confira seu e-mail para recuperar o acesso.');}else if(authMode==='signup'){const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin}});if(error)throw error;if(!data.session)toast.success('Confira seu e-mail para confirmar sua conta.');else setAuth(false);}else{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;setAuth(false);}}catch{setAuthError('Não foi possível continuar. Confira os dados e tente novamente.');}finally{setBusy(false);}}}><label className="auth-label">E-mail<input type="email" name="email" required placeholder="voce@exemplo.com" maxLength={254}/></label>{authMode!=='reset'&&<label className="auth-label">Senha<input type="password" name="password" required minLength={8} maxLength={128} autoComplete={authMode==='signup'?'new-password':'current-password'} placeholder="Pelo menos 8 caracteres"/></label>}{authError&&<p role="alert" className="text-sm text-destructive">{authError}</p>}<Button type="submit" className="w-full" disabled={busy}>{busy?'Aguarde...':authMode==='signup'?'Criar conta':authMode==='reset'?'Enviar link':'Entrar'}</Button></form><Button variant="link" onClick={()=>{setAuthMode(authMode==='signup'?'login':'signup');setAuthError('');}}>{authMode==='signup'?'Já tenho uma conta':'Ainda não tenho conta'}</Button>{authMode==='login'&&<Button variant="link" onClick={()=>setAuthMode('reset')}>Esqueci minha senha</Button>}</>}</DialogContent></Dialog>
  </div>;
}
