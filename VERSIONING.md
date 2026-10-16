# Regras internas de versionamento do LynkNotes

Estas regras são destinadas à manutenção do projeto, não à interface do usuário nem ao histórico público de alterações.

- Toda alteração que não mudar MAJOR.MINOR.PATCH deve incrementar obrigatoriamente o REV.
- Não registrar uma nova alteração mantendo o mesmo REV.
- Ao incrementar MAJOR, MINOR ou PATCH, reiniciar o REV em 1.
- Usar `npm run version:rev` para revisões sem mudança de MAJOR.MINOR.PATCH.
- Usar `npm run version:patch`, `npm run version:minor` ou `npm run version:major` quando a versão semântica mudar.
- Atualizar a descrição das alterações registradas no histórico para refletir o trabalho realmente realizado.

Este arquivo registra as versões publicadas do LynkNotes. A versão do LynkNotes é independente da versão do JSLynk e dos demais aplicativos conectados.
