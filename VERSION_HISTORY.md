# Histórico de versões do LynkNotes

Este arquivo registra as versões publicadas do LynkNotes e o REV (Registro de Evolução de Versões). A versão do LynkNotes é independente da versão do JSLynk e dos demais aplicativos conectados.\n\n**Regra obrigatória:** toda alteração que não mudar MAJOR.MINOR.PATCH deve incrementar o REV. Não registre correções, ajustes ou melhorias mantendo o mesmo REV. Se MAJOR, MINOR ou PATCH mudar, reinicie o REV em 1.

## v1.0.0 — REV 1 (2026-10-14)

- Criado versionamento semântico independente, com REV para revisões da mesma versão.
- Adicionado histórico de versões em JSON e Markdown e comandos para incrementar major, minor, patch ou REV.
- Adicionada área no aplicativo para consultar a versão atual e o histórico de evolução.

## Regras de versionamento

- Correção ou ajuste pontual: incrementar o patch.
- Nova funcionalidade: incrementar o minor.
- Mudança incompatível: incrementar o major.
- **Toda alteração sem mudança de MAJOR.MINOR.PATCH:** incrementar obrigatoriamente somente o REV.\n- Não publicar alterações mantendo o mesmo REV.\n- Quando MAJOR, MINOR ou PATCH mudar, reiniciar o REV em 1.
- Cada nova versão semântica reinicia o REV em 1.
