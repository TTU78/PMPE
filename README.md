# Cronograma PMPE — Foco Total até Fevereiro

Aplicativo PWA estático para celular, preservando o visual clássico. Contém: cronograma com foco total na PMPE até fevereiro de 2027, 15 horas efetivas por semana, prioridades antigas da PRF arquivadas no menu, registros de questões e erros separados para cada concurso, gráficos semanais, backup JSON e menu de três pontinhos.

## Plano semanal
- Segunda: Português (base comum) — 1h30.
- Terça: História de Pernambuco (PMPE) — 1h45.
- Quarta: Raciocínio Lógico (base comum) — 1h45.
- Quinta: Legislação Extravagante / Estatuto PMPE (um assunto por sessão) — 1h45.
- Sexta: Direito Constitucional (base comum) — 1h45.
- Sábado: Informática + Direitos Humanos — 3h15.
- Domingo: Redação PMPE + Português (reforço AOCP) — 3h15.

Até fevereiro de 2027, não há sessões dedicadas às matérias exclusivas da PRF. Português, Raciocínio Lógico, Informática e Direito Constitucional continuam sendo úteis aos dois concursos. No sábado, Direitos Humanos recebe uma sessão específica; na quinta, o foco fica em legislação e Estatuto da PMPE. Todos os blocos de questões correspondem ao conteúdo estudado no dia. As pausas são adicionais aos tempos indicados. A distribuição é uma organização de estudo, não uma garantia de conclusão de todos os tópicos dos editais.

## Publicação no GitHub + Vercel
1. Extraia o ZIP.
2. Envie **todos os 7 arquivos**, incluindo `index.html`, `app.js`, `sw.js`, `manifest.webmanifest` e ícones, à **raiz** de um repositório GitHub.
3. No Vercel, importe esse repositório. Framework **Other**, sem build command, output directory padrão/raiz.
4. Abra o domínio HTTPS da Vercel no Chrome do celular. Após carregar pela primeira vez, tente abrir com a internet desligada. Para instalar, utilize o menu do navegador → **Adicionar à tela inicial** ou **Instalar app**.

## Armazenamento e backup
O histórico de questões fica em **localStorage**:
- PRF: chave antiga `prf-questoes-v1`, preservada.
- PMPE: chave independente `pmpe-questoes-v1`.

Resultados de Português e das outras matérias comuns registrados na PRF não aparecem automaticamente na PMPE (e vice-versa). A PMPE permite registrar Direitos Humanos, Legislação Extravagante e Estatuto separadamente; a opção agrupada antiga permanece para preservar o histórico. Redação PMPE não é contada como questão objetiva. Não há conta, sincronização com GitHub/Vercel ou armazenamento no servidor. Faça backups pelo menu **Backup dos dados** antes de limpar o navegador, trocar de aparelho ou domínio.

## Atualização
Esta revisão mantém o histórico da PRF no mesmo domínio e navegador, mesmo sem sessões PRF no cronograma atual. O backup novo, versão 2, inclui registros de PRF e PMPE. Backups antigos, versão 1, ainda podem ser importados: atualizam apenas a PRF e preservam os registros PMPE atuais. A primeira atualização deve ser aberta com internet, para renovar o cache offline.

## Observações
Prioridades da PRF baseadas no edital de 2014; não representam edital novo. Para a PMPE, o plano usa o edital de Soldado publicado em 2026. Páginas da apostila vêm das referências do planejamento anterior. O funcionamento em Android precisa ser testado no aparelho após publicar.
