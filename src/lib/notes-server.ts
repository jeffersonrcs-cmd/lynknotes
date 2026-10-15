import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { createClient, type User } from '@supabase/supabase-js';
import { z } from 'zod';

const JSLYNK_SUPABASE_URL = 'https://ipqrxdozzlenmanykgoz.supabase.co';
const JSLYNK_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_hV2iHEN9aiJUdz9r0MEJBQ_ZlL1DY0X';

function getNotesAdminClient() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SECRET_KEY'] || process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) {
    throw new Error('O backend do LynkNotes precisa de SUPABASE_URL e SUPABASE_SECRET_KEY configurados no servidor.');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireJSLynkUser(): Promise<User> {
  const request = getRequest();
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) throw new Error('Sessão ausente. Entre novamente.');
  const token = header.slice('Bearer '.length).trim();
  if (!token) throw new Error('Sessão ausente. Entre novamente.');

  const identityClient = createClient(JSLYNK_SUPABASE_URL, JSLYNK_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await identityClient.auth.getUser(token);
  if (error || !data.user || !data.user.email_confirmed_at) {
    throw new Error('Sessão JSLynk inválida ou e-mail ainda não confirmado.');
  }
  return data.user;
}

const noteInput = z.object({
  id: z.string().uuid(),
  title: z.string().max(150),
  content: z.string().max(20000),
  color: z.enum(['yellow', 'pink', 'green', 'blue', 'purple', 'peach']),
  kind: z.enum(['text', 'checklist', 'reminder', 'draw', 'bookmark']),
  category: z.string().max(60),
  items: z.array(z.object({ text: z.string().max(2000), done: z.boolean() })).max(1000),
  pinned: z.boolean(),
  archived: z.boolean(),
  deleted: z.boolean(),
  updated_at: z.string(),
  appearance: z.object({
    font: z.enum(['caveat', 'marker', 'oswald', 'quicksand']),
    size: z.enum(['small', 'medium', 'large']),
    align: z.enum(['left', 'center', 'right']),
    reminder: z.string().max(40),
    drawing: z.string().max(1500000),
    url: z.string().max(2048),
    previewTitle: z.string().max(300),
    previewImage: z.string().max(2048),
  }),
});

export const listUserNotes = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireJSLynkUser();
  const db = getNotesAdminClient();
  const { data, error } = await db.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
  if (error) throw new Error('Não foi possível carregar suas notas.');
  return data ?? [];
});

export const saveUserNote = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => noteInput.parse(input))
  .handler(async ({ data }) => {
    const user = await requireJSLynkUser();
    const db = getNotesAdminClient();
    const { appearance, kind, ...note } = data;
    const row = {
      ...note,
      kind: kind === 'checklist' ? 'checklist' : 'text',
      metadata: { ...appearance, noteKind: kind },
      user_id: user.id,
    };
    const { error } = await db.from('notes').upsert(row);
    if (error) throw new Error('Não foi possível salvar a nota.');
    return { success: true };
  });

export const deleteUserNote = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const user = await requireJSLynkUser();
    const db = getNotesAdminClient();
    const { error } = await db.from('notes').delete().eq('id', data.id).eq('user_id', user.id);
    if (error) throw new Error('Não foi possível excluir a nota.');
    return { success: true };
  });
