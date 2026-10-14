import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
export const previewBookmark = createServerFn({method:'POST'})
 .inputValidator((input:unknown)=>z.object({url:z.string().url().max(2048).refine(value=>{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;},'Use um link HTTPS público.')} ).parse(input))
 .handler(async({data})=>{
  // Only a fixed metadata provider is contacted: never fetch arbitrary destinations in this worker.
  const response=await fetch(`https://api.microlink.io/?url=${encodeURIComponent(data.url)}`,{signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error('Não foi possível gerar a prévia.');
  const schema=z.object({status:z.literal('success'),data:z.object({title:z.string().nullish(),image:z.object({url:z.string().url()}).nullish()})});
  const parsed=schema.safeParse(await response.json());
  if(!parsed.success)throw new Error('Este site não disponibilizou uma prévia.');
  return {title:(parsed.data.data.title??new URL(data.url).hostname).slice(0,300),image:parsed.data.data.image?.url.startsWith('https:')?parsed.data.data.image.url:''};
 });
