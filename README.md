# psi09

correr frontend (em angular-psi-frontend): ng serve

correr backend (em express-psi-backend): npm run serverstart (Windows) ou npm start

Esta é a **versão original** do projeto desenvolvida durante o semestre. O frontend e backend estão configurados com as definições iniciais utilizadas durante o desenvolvimento. **Não** funciona no appserver.

## Versão atual (main)

- Frontend em Angular com versão original do trabalho.
- Backend com conexão MongoDB configurada para a **conta pessoal** do grupo (e não para o servidor da faculdade).
- Backend escutando na porta `3000`, com o frontend acessando serviços via `http://localhost:3000`.

**-->** Para usar este projeto no `appserver.alunos.di.fc.ul.pt`, é necessário alterar para a branch `angular_16`, que já está preparada para execução.

- também é necessário apagar os node_modules e fazer um npm install