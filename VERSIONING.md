# Regras internas de versionamento do LynkNotes

O LynkNotes usa versionamento semântico **MAJOR.MINOR.PATCH**. O sistema não utiliza REV.

## Como a versão aumenta

- **MAJOR**: alterações incompatíveis ou commits com indicação de breaking change, como `feat!:` ou `BREAKING CHANGE:`.
- **MINOR**: novas funcionalidades indicadas por `feat:`.
- **PATCH**: correções e demais alterações elegíveis que não sejam uma nova funcionalidade nem uma breaking change, incluindo `fix:`, `chore:`, `docs:`, `test:`, `ci:`, `style:`, `refactor:` e `perf:`.
- Se um intervalo de commits contiver mais de um tipo, prevalece o nível mais alto: MAJOR, depois MINOR e depois PATCH.

## Detecção automática

O script analisa alterações em todo o repositório, incluindo código, arquivos de configuração, testes e workflows. Alterações relevantes fora de `src/` também podem gerar uma nova versão.

Os arquivos `version-history.json`, `VERSION_HISTORY.md` e `public/version-history.json` são artefatos de histórico gerados automaticamente e não geram outra versão por si só.

O histórico público deve descrever as alterações reais. Evite mensagens genéricas como “manutenção e melhorias internas”; prefira mensagens de commit específicas, por exemplo `fix(notes): correct note ordering` ou `feat(search): add note search`.

## Comandos manuais

- `npm run version:patch` — incrementa PATCH.
- `npm run version:minor` — incrementa MINOR e zera PATCH.
- `npm run version:major` — incrementa MAJOR e zera MINOR e PATCH.

O histórico e o campo `version` do `package.json` são atualizados pelo script. A versão do LynkNotes é independente da versão do JSLynk e dos demais aplicativos conectados.
