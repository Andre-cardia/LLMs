# Lacunas UX — reconciliação do Globo Cesium

**Fontes:** PRD `prd.md` e `addendum.md`; UX `DESIGN.md`, `EXPERIENCE.md`, `.memlog.md` e `imports/cesium-evaluation-2026-10-12.md`. A decisão final está em `prd-LLMs-2026-10-07/.memlog.md:38-43`.

**Premissa confirmada:** a exclusão de “voos” trata trajetos aéreos/aerolíneas e controles adicionais de voo por Empresa/região. Zoom, rotação e foco/navegação do Globo continuam válidos.

1. **O contrato visual/funcional UX ainda define quatro Vistas.** DESIGN/EXPERIENCE e o memlog dizem 3D, 2D plano, MAPA noturno com luzes de cidades e SAT (`DESIGN.md:421`; `EXPERIENCE.md:394-403`; UX `.memlog.md:57,83`). O PRD final define uma projeção 3D com bases MAPA cartográfica muito escura e SAT (`prd.md:403-409`). Atualizar o par UX para retirar 2D, redefinir MAPA e especificar o comportamento SAT: imagery em zoom amplo; transição automática para cena fotorealística em área coberta e zoom próximo; retorno ao afastar, sair da cobertura ou falhar (`prd.md:408-410`; `addendum.md:113`).

2. **O memlog UX conserva a regra antiga de troca global de base por zoom.** A decisão antiga descreve satélite distante → tiles OSM próximo → satélite ao afastar (`ux-LLMs-2026-10-09/.memlog.md:103`). PRD e Addendum §F já substituem essa regra: OSM detalha a base MAPA; a transição de imagery para fotorealismo ocorre em SAT (`prd.md:408-409,478-485`; `addendum.md:113-117`). Atualizar a nota UX para distinguir as duas bases e remover a troca global obsoleta.

3. **A base inicial segue sem decisão UX.** MAPA ou SAT deve ser escolhido em conjunto por UX, arquitetura e Andre antes das stories (`prd.md:578`; decisão pendente em `prd-LLMs-2026-10-07/.memlog.md:41`). EXPERIENCE também deixa em aberto a vista inicial do atalho `R` (`EXPERIENCE.md:476`). Registrar a escolha da base inicial antes de decompor as stories do Globo.
