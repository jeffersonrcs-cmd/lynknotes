import { jslynkAuth } from '@/integrations/jslynk/client';
import type { Note } from '@/lib/notes';

async function requireJSLynkUser() {
  const { data, error } = await jslynkAuth.auth.getUser();
  const user = data.user;
  if (error || !user || !user.email_confirmed_at) {
    throw new Error('Sessão JSLynk inválida ou e-mail ainda não confirmado.');
  }
  return user;
}

export async function listUserNotes() {
  const user = await requireJSLynkUser();
  const { data, error } = await jslynkAuth
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  if (error) throw new Error('Não foi possível carregar suas notas.');
  return data ?? [];
}

export async function saveUserNote(note: Note) {
  const user = await requireJSLynkUser();
  const { appearance, kind, ...fields } = note;
  const row = {
    ...fields,
    kind: kind === 'checklist' ? 'checklist' : 'text',
    metadata: { ...appearance, noteKind: kind },
    user_id: user.id,
  };
  const { error } = await jslynkAuth.from('notes').upsert(row, { onConflict: 'id' });
  if (error) throw new Error('Não foi possível salvar a nota.');
  return { success: true };
}

export async function deleteUserNote(input: { data: { id: string } }) {
  const user = await requireJSLynkUser();
  const { error } = await jslynkAuth
    .from('notes')
    .delete()
    .eq('id', input.data.id)
    .eq('user_id', user.id);
  if (error) throw new Error('Não foi possível excluir a nota.');
  return { success: true };
}
