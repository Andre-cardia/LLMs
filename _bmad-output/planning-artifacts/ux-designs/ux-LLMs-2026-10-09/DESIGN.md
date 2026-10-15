---
title: DESIGN — Monitor Global de Labs de LLM
status: draft
created: 2026-10-09
updated: 2026-10-13
sources:
  - ../../prds/prd-LLMs-2026-10-07/prd.md
  - ../../prds/prd-LLMs-2026-10-07/addendum.md
  - ../../architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md
  - ../../architecture/architecture-LLMs-2026-10-10/cesium-integration.md
  - ../../../forge/llm-labs-globe/forged-idea.md
  - .memlog.md
  - variants/artificial-analysis-light/DESIGN.md
  - variants/artificial-analysis-light/EXPERIENCE.md
  - .working/reconcile-aa-default-yahoo-2026-10-12.md
  - mockups/assets/news-original-sources.js
name: Monitor Global — Labs de LLM
description: Monitor Global com a família Artificial Analysis como padrão, claro inicial e escuro opcional. Seis temas OSIRIS permanecem como alternativas preservadas. Este arquivo conserva os tokens da linha original; o contrato visual padrão está em variants/artificial-analysis-light/DESIGN.md. Web vanilla e CesiumJS planejado como renderer do Globo principal; sem sistema de UI de terceiros.
colors:
  # Convenção: <família>-<modo>-<papel>. Famílias: osiris (OSIRIS fiel) · ambar (Fósforo âmbar) · noturna (Sala de controle noturna).
  # Papéis: bg fundo · bar barras · s1 superfície · s2 superfície 2 · line linha · tx texto · mu texto suave · acc acento/marca ·
  # d1 dado primário · d2 dado secundário · up alta · dn baixa · camada-* cor de Camada · globe fundo do palco do Globo · atm atmosfera.
  # ---- OSIRIS fiel · escuro (padrão do protótipo original)
  osiris-escuro-bg: '#050607'
  osiris-escuro-bar: '#07090B'
  osiris-escuro-s1: '#0B1014'
  osiris-escuro-s2: '#131A20'
  osiris-escuro-line: '#1C2A33'
  osiris-escuro-tx: '#D7E3EA'
  osiris-escuro-mu: '#708491'  # AA (antes #6B7F8C)
  osiris-escuro-acc: '#F2B33D'
  osiris-escuro-d1: '#36E2F0'
  osiris-escuro-d2: '#3DF58A'
  osiris-escuro-up: '#22E07A'
  osiris-escuro-dn: '#FF4D5E'
  osiris-escuro-camada-laboratorios: '#A78BFA'
  osiris-escuro-camada-chips: '#F472B6'
  osiris-escuro-camada-nuvem: '#4DA3FF'
  osiris-escuro-camada-energia: '#FB923C'
  osiris-escuro-camada-software: '#E2E8F0'
  osiris-escuro-globe: '#050607'
  osiris-escuro-atm: '#4DA3FF'
  # ---- OSIRIS fiel · claro ("console diurno": cromo claro, Globo numa janela escura)
  osiris-claro-bg: '#E9EDF0'
  osiris-claro-bar: '#F6F8F9'
  osiris-claro-s1: '#FFFFFF'
  osiris-claro-s2: '#DDE3E7'
  osiris-claro-line: '#B9C6CE'
  osiris-claro-tx: '#0D1A22'
  osiris-claro-mu: '#576772'  # AA (antes #5A6B76)
  osiris-claro-acc: '#865C00'  # AA (antes #9A6A00)
  osiris-claro-d1: '#006F80'  # AA (antes #00788A)
  osiris-claro-d2: '#08723B'  # AA (antes #0A8F4A)
  osiris-claro-up: '#08723B'  # AA (antes #0A8F4A)
  osiris-claro-dn: '#BF2638'  # AA (antes #C8283A)
  osiris-claro-camada-laboratorios: '#6D4AE0'
  osiris-claro-camada-chips: '#C02C83'
  osiris-claro-camada-nuvem: '#1F6FD1'
  osiris-claro-camada-energia: '#C2560C'
  osiris-claro-camada-software: '#2B3A44'
  osiris-claro-globe: '#0B1014'
  osiris-claro-globe-aro: '#2B3A44'
  osiris-claro-atm: '#7FB8FF'
  # ---- Fósforo âmbar · escuro (CRT âmbar, scanlines + vinheta)
  ambar-escuro-bg: '#0A0700'
  ambar-escuro-bar: '#0D0902'
  ambar-escuro-s1: '#140E04'
  ambar-escuro-s2: '#1F1707'
  ambar-escuro-line: '#3A2A0C'
  ambar-escuro-tx: '#FFC966'
  ambar-escuro-mu: '#A17C36'  # AA (antes #8A6A2E)
  ambar-escuro-acc: '#FFB000'
  ambar-escuro-d1: '#FFD27A'
  ambar-escuro-d2: '#FFE9B8'
  ambar-escuro-up: '#9BE564'
  ambar-escuro-dn: '#FF6A3D'
  ambar-escuro-camada-laboratorios: '#E3B877'
  ambar-escuro-camada-chips: '#B9A9D6'
  ambar-escuro-camada-nuvem: '#8FB3C4'
  ambar-escuro-camada-energia: '#D98F6E'
  ambar-escuro-camada-software: '#CFC6A9'
  ambar-escuro-globe: '#0A0700'
  ambar-escuro-atm: '#FFB000'
  # ---- Fósforo âmbar · claro ("papel térmico de teletipo", Globo em sépia)
  ambar-claro-bg: '#F2E8D0'
  ambar-claro-bar: '#EBDDBC'
  ambar-claro-s1: '#F8F1DF'
  ambar-claro-s2: '#E4D3AC'
  ambar-claro-line: '#C4A970'
  ambar-claro-tx: '#3B2604'
  ambar-claro-mu: '#735829'  # AA (antes #7A5E2C)
  ambar-claro-acc: '#855000'  # AA (antes #B36B00)
  ambar-claro-d1: '#8A4B00'
  ambar-claro-d2: '#5E3A08'
  ambar-claro-up: '#346819'  # AA (antes #3E7D1E)
  ambar-claro-dn: '#A53318'  # AA (antes #B5381A)
  ambar-claro-camada-laboratorios: '#9C6B1E'
  ambar-claro-camada-chips: '#6A5A92'
  ambar-claro-camada-nuvem: '#3F6E84'
  ambar-claro-camada-energia: '#A4502E'
  ambar-claro-camada-software: '#5E5640'
  ambar-claro-globe: '#F2E8D0'
  ambar-claro-atm: '#C9A25A'
  # ---- Sala de controle noturna · escuro (marinho, vidro, luzes das cidades)
  noturna-escuro-bg: '#061226'
  noturna-escuro-bar: '#0A1A33'
  noturna-escuro-s1: '#0E2142'
  noturna-escuro-s2: '#15305A'
  noturna-escuro-line: '#23406B'
  noturna-escuro-tx: '#F4F7FB'
  noturna-escuro-mu: '#8EA3C0'
  noturna-escuro-acc: '#E8C77A'
  noturna-escuro-d1: '#7CC4FF'
  noturna-escuro-d2: '#B7E3FF'
  noturna-escuro-up: '#4ADE80'
  noturna-escuro-dn: '#F87171'
  noturna-escuro-camada-laboratorios: '#C4A7FF'
  noturna-escuro-camada-chips: '#FF9EC7'
  noturna-escuro-camada-nuvem: '#5EE1E6'
  noturna-escuro-camada-energia: '#FFC56B'
  noturna-escuro-camada-software: '#E6EDF7'
  noturna-escuro-globe: '#061226'
  noturna-escuro-atm: '#7CC4FF'
  # ---- Sala de controle noturna · claro ("sala de controle diurna")
  noturna-claro-bg: '#E6ECF3'
  noturna-claro-bar: '#F4F7FB'
  noturna-claro-s1: '#FFFFFF'
  noturna-claro-s2: '#D7E1EC'
  noturna-claro-line: '#B4C3D6'
  noturna-claro-tx: '#0B1E3A'
  noturna-claro-mu: '#506582'  # AA (antes #546A88)
  noturna-claro-acc: '#7E5E21'  # AA (antes #A0782A)
  noturna-claro-d1: '#1B61C1'  # AA (antes #1C64C8)
  noturna-claro-d2: '#0B3F86'
  noturna-claro-up: '#127136'  # AA (antes #15803D)
  noturna-claro-dn: '#BA2E2D'  # AA (antes #C2302F)
  noturna-claro-camada-laboratorios: '#6B46C1'
  noturna-claro-camada-chips: '#C2337A'
  noturna-claro-camada-nuvem: '#0E8C99'
  noturna-claro-camada-energia: '#B86E00'
  noturna-claro-camada-software: '#33475F'
  noturna-claro-globe: '#E6ECF3'
  noturna-claro-atm: '#9CC8FF'
  # ---- Superfícies fixas por família (não mudam com o modo: o Terminal é um objeto físico)
  terminal-osiris-bg: '#050607'
  terminal-osiris-tx: '#D7E3EA'
  terminal-osiris-line: '#1C2A33'
  terminal-osiris-canto: '#F2B33D'
  terminal-ambar-bg: '#140E04'
  terminal-ambar-tx: '#FFC966'
  terminal-ambar-line: '#3A2A0C'
  terminal-ambar-moldura: '#1F1707'
  terminal-cabecalho-line: '#2A2A2A'
  ponto-contorno-escuro: '#000000'
  ponto-contorno-claro: '#FFFFFF'
typography:
  mono: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' }
  sans: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif' }
  corpo: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 13px, fontWeight: '400' }
  hud: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 10.5px, fontWeight: '400', letterSpacing: 0.18em }
  hud-sans: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif', fontSize: 10.5px, fontWeight: '400', letterSpacing: 0.18em }
  marca: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 15px, fontWeight: '700', letterSpacing: 0.42em }
  marca-sub: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 9px, letterSpacing: 0.3em }
  aba: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 10.5px, letterSpacing: 0.2em }
  titulo-vista: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 13px, fontWeight: '700', letterSpacing: 0.3em }
  secao: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 10.5px, letterSpacing: 0.2em }
  terminal: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 12.5px, lineHeight: '1.55' }
  terminal-ascii: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 11px, lineHeight: '1.15', letterSpacing: 0.05em }
  leitor-titulo: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 16px, fontWeight: '700', lineHeight: '1.35' }
  leitor-corpo: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 13px, lineHeight: '1.6' }
  noticia-titulo: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 13.5px, fontWeight: '600' }
  fluxo-item: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 11.5px, lineHeight: '1.4' }
  agente: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 12.5px, lineHeight: '1.6' }
  tabela-cabecalho: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 10px, letterSpacing: 0.12em }
  tabela-celula: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 12px }
  tabela-analitica: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif', fontSize: 13px }
  tabela-analitica-cabecalho: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif', fontSize: 12px, fontWeight: '600', letterSpacing: 0em }
  chip: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 10px, letterSpacing: 0.14em }
  meta: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 10px, letterSpacing: 0.12em }
  micro: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 9.5px, letterSpacing: 0.1em }
  rotulo-laboratorio: { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: 8px, lineHeight: 12px, letterSpacing: 0.12em }
rounded:
  none: 0px
  xs: 2px
  sm: 4px
  botao: 5px
  DEFAULT: 6px
  md: 8px
  lg: 10px
  xl: 12px
  2xl: 14px
  janela: 18px
  full: 9999px
spacing:
  '1': 2px
  '2': 4px
  '3': 6px
  '4': 8px
  '5': 10px
  '6': 12px
  '7': 14px
  '8': 16px
  '9': 22px
  '10': 28px
  barra-status: 56px
  faixa: 34px
  trilho: 46px
  botao-trilho: 38px
  trilho-margem: 10px
  margem-palco: 66px
  margem-vista: 70px
  painel-fluxo: 330px
  previa-min: 180px
  terminal: 430px
  terminal-altura-max: 70vh
  leitor-flutuante: 440px
  leitor-lateral: 480px
  fila: 460px
  agente-altura: 440px
  agente-historico: 260px
  ponto-ecossistema: 6px
  ponto-laboratorio: 9px
  ponto-laboratorio-sel: 12px
  monograma-faixa: 18px
  monograma-previa: 24px
  monograma-noticia: 30px
  monograma-terminal: 34px
  quebra-celular: 760px
  quebra-status-lg: 1280px
  quebra-status-xl: 1560px
components:
  # Referências usam o tema padrão (osiris-escuro-*); com outro tema ativo, troca-se só o prefixo <família>-<modo>-.
  # Regra AA (painéis escuros): em osiris e ambar, terminal-fixado, leitor-de-noticia, agente-console, fila-de-revisao e painel-mercados
  # (com seus cartões e linhas) usam sempre o prefixo <família>-escuro-, também no modo claro. No osiris-claro, rotulo-laboratorio,
  # rotulo-geografico e leitura-de-cursor (sobre a janela escura do Globo) usam osiris-escuro-tx / -mu / -d1.
  globo: { fundo: '{colors.osiris-escuro-globe}', atmosfera: '{colors.osiris-escuro-atm}', z: '0' }
  ponto: { tamanho: '{spacing.ponto-ecossistema}', forma: 'círculo', cor: 'cor da Camada principal', opacidade: '0.82', contorno: '{colors.ponto-contorno-escuro}' }
  ponto-laboratorio: { tamanho: '{spacing.ponto-laboratorio}', tamanho-selecionado: '{spacing.ponto-laboratorio-sel}', forma: 'losango ◆ (quadrado 45°, raio 1.5px)', cor: '{colors.osiris-escuro-camada-laboratorios}', anel-selecao: '{colors.osiris-escuro-acc}' }
  rotulo-laboratorio: { tipografia: '{typography.rotulo-laboratorio}', texto: '{colors.osiris-escuro-tx}', filete: '1px na cor da Camada', hover: '{colors.osiris-escuro-acc}', marca-pulso: '{colors.osiris-escuro-acc}' }
  pulso: { cor: '{colors.osiris-escuro-acc}', forma: 'anéis concêntricos que se propagam' }
  relacao-arco: { fabricacao-de-chips: '{colors.osiris-escuro-camada-chips}', nuvem-e-infraestrutura: '{colors.osiris-escuro-camada-nuvem}', investimento: '{colors.osiris-escuro-acc}', energia: '{colors.osiris-escuro-camada-energia}', parceria-de-modelos: '{colors.osiris-escuro-camada-laboratorios}', fantasma: '{colors.osiris-escuro-acc}' }
  previa: { fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', raio: '{rounded.md}', largura-min: '{spacing.previa-min}', z: '35' }
  terminal-fixado: { largura: '{spacing.terminal}', altura-max: '{spacing.terminal-altura-max}', tipografia: '{typography.terminal}', titulo: '{colors.osiris-escuro-acc}', z: '36' }
  leitor-de-noticia: { largura-flutuante: '{spacing.leitor-flutuante}', largura-lateral: '{spacing.leitor-lateral}', raio-flutuante: '{rounded.DEFAULT}', raio-lateral: '{rounded.none}', tipografia: '{typography.leitor-corpo}', secao: '{colors.osiris-escuro-acc}', z: '37' }
  fluxo-de-noticias: { largura: '{spacing.painel-fluxo}', fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', raio: '{rounded.DEFAULT}', tipografia: '{typography.fluxo-item}', z: '21' }
  aba-labs: { losango: '{colors.osiris-escuro-camada-laboratorios}', lancamento: '{colors.osiris-escuro-acc}', expandir: '{colors.osiris-escuro-d1}' }
  faixa-de-cotacoes: { altura: '{spacing.faixa}', fundo: '{colors.osiris-escuro-bar}', alta: '{colors.osiris-escuro-up}', baixa: '{colors.osiris-escuro-dn}', aviso: '{colors.osiris-escuro-mu}', z: '25' }
  barra-de-status: { altura: '{spacing.barra-status}', marca: '{typography.marca}', marca-cor: '{colors.osiris-escuro-acc}', valor: '{colors.osiris-escuro-d1}', ao-vivo: '{colors.osiris-escuro-up}', atrasado: '{colors.osiris-escuro-acc}', offline: '{colors.osiris-escuro-dn}', z: '20' }
  emblema-da-marca: { forma: 'íris concêntrica — três anéis (externo em acc, médio em tx a 60% opacidade, centro sólido acc)', onde: 'favicon + barra de status, junto à marca "MONITOR GLOBAL"', cor: '{colors.osiris-escuro-acc}', referencia: '.working/emblema-opcoes-2026-10-13.html (opção A)' }
  terminador: { exibicao: 'no Globo principal, cuja projeção é sempre 3D', atualizacao: 'ao vivo', lado-noturno: 'escurecido conforme a cena ativa permitir' }
  rotulo-geografico: { tipografia: '{typography.rotulo-laboratorio}', texto: '{colors.osiris-escuro-mu}', prioridade: 'abaixo do Rótulo de Laboratório na desobstrução' }
  controles-de-navegacao: { botao: '{spacing.botao-trilho}', raio: '{rounded.lg}', fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', icone: '{colors.osiris-escuro-tx}', ativo: '{colors.osiris-escuro-acc}', z: '20' }
  ajuda-de-atalhos: { fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', raio: '{rounded.lg}', titulo: '{colors.osiris-escuro-acc}', tecla: '{typography.meta}', z: '30' }
  painel-mercados: { largura: '{spacing.fila}', raio: '{rounded.none}', titulo: '{colors.osiris-escuro-acc}', prompt: '{colors.osiris-escuro-d2}', regiao: '{typography.secao}', regiao-cor: '{colors.osiris-escuro-acc}', aba-selecionada: '{colors.osiris-escuro-acc}', aviso: '{colors.osiris-escuro-mu}', resumo-agente: '{colors.osiris-escuro-acc}', cabecalho-colunas: '{typography.tabela-cabecalho}', cabecalho-colunas-cor: '{colors.osiris-escuro-mu}', status-ao-vivo: '{colors.osiris-escuro-up}', status-atrasado: '{colors.osiris-escuro-acc}', status-offline: '{colors.osiris-escuro-dn}', pregao: '{typography.micro}', z: '37' }
  cartao-de-indice: { fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', raio: '{rounded.DEFAULT}', rotulo: '{typography.micro}', rotulo-cor: '{colors.osiris-escuro-mu}', valor: '{typography.tabela-celula}', valor-cor: '{colors.osiris-escuro-tx}', alta: '{colors.osiris-escuro-up}', baixa: '{colors.osiris-escuro-dn}' }
  linha-de-cotacao: { tipografia: '{typography.tabela-celula}', ticker: '{colors.osiris-escuro-tx}', nome: '{colors.osiris-escuro-mu}', alta: '{colors.osiris-escuro-up}', baixa: '{colors.osiris-escuro-dn}', minigrafico: '1M', favorito: '{colors.osiris-escuro-acc}', favorito-desligado: '{colors.osiris-escuro-mu}', hover: '{colors.osiris-escuro-s2}' }
  barra-de-amplitude: { sobem: '{colors.osiris-escuro-up}', caem: '{colors.osiris-escuro-dn}', trilho: '{colors.osiris-escuro-s2}', raio: '{rounded.full}', rotulo: '{typography.micro}' }
  abas-principais: { tipografia: '{typography.aba}', selecionada: '{colors.osiris-escuro-acc}', repouso: '{colors.osiris-escuro-mu}', raio: '{rounded.DEFAULT}' }
  barra-lateral: { largura: '{spacing.trilho}', botao: '{spacing.botao-trilho}', raio-botao: '{rounded.lg}', selo: '{colors.osiris-escuro-d1}', ativo-borda: '{colors.osiris-escuro-acc}', ativo-icone: '{colors.osiris-escuro-acc}', ativo-brilho: 'glow do tema (Elevation & Depth)', z: '20' }
  busca-global: { forma: 'a definir — spine-only (sem mock)', botao: '{spacing.botao-trilho}', destaque-modelo: '{colors.osiris-escuro-acc}' }
  popover: { fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', raio: '{rounded.lg}', titulo: '{colors.osiris-escuro-acc}', z: '30' }
  seletor-de-base: { tipografia: '{typography.hud}', selecionada: '{colors.osiris-escuro-acc}', raio: '{rounded.lg}' }
  leitura-de-cursor: { tipografia: '{typography.hud}', rotulo: '{colors.osiris-escuro-mu}', valor: '{colors.osiris-escuro-d1}' }
  legenda-filtro-de-camadas: { tipografia: '{typography.hud}', texto: '{colors.osiris-escuro-mu}', contagem: '{colors.osiris-escuro-tx}', ponto: 'cor da Camada, 8px, com brilho', raio: '{rounded.DEFAULT}', hover-borda: '{colors.osiris-escuro-line}', hover-texto: '{colors.osiris-escuro-tx}', desligado: 'opacidade 0.35, ponto sem brilho', z: '20' }
  tabela-de-modelos: { cabecalho: '{typography.tabela-cabecalho}', celula: '{typography.tabela-celula}', numero: '{colors.osiris-escuro-d1}', barra-inteligencia: '{colors.osiris-escuro-d1}', destaque: '{colors.osiris-escuro-acc}', prompt: '{colors.osiris-escuro-d2}' }
  aba-noticias: { titulo: '{typography.noticia-titulo}', meta: '{typography.hud}', data: '{colors.osiris-escuro-mu}' }
  agente-console: { altura: '{spacing.agente-altura}', historico: '{spacing.agente-historico}', topo: '{colors.osiris-escuro-acc}', pergunta: '{colors.osiris-escuro-d1}', acao: '{colors.osiris-escuro-d2}', fontes: '{colors.osiris-escuro-mu}', tipografia: '{typography.agente}', z: '38' }
  fila-de-revisao: { largura: '{spacing.fila}', titulo: '{colors.osiris-escuro-acc}', z: '37' }
  cartao-de-proposta: { raio: '{rounded.DEFAULT}', aprovar: '{colors.osiris-escuro-up}', rejeitar: '{colors.osiris-escuro-dn}', ver-no-globo: '{colors.osiris-escuro-d1}', tipo: '{colors.osiris-escuro-acc}' }
  chip-filtro: { tipografia: '{typography.chip}', raio: '{rounded.full}', fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', desligado: 'opacidade 0.4' }
  monograma: { forma: 'círculo', fundo: 'cor da Camada principal', texto: '{colors.osiris-escuro-bg}', indice: '{colors.osiris-escuro-d1}' }
  dica: { tipografia: '{typography.meta}', fundo: '{colors.osiris-escuro-s2}', raio: '{rounded.DEFAULT}', z: '40' }
  confirmacao-ocultar: { confirmar: '{colors.osiris-escuro-dn}', raio: '{rounded.botao}' }
---

**Design padrão — Artificial Analysis (2026-10-12).** Andre aprovou o claro como padrão e pediu também o modo escuro. A família `artificial-analysis` aceita `light`/`dark`, com entrada em MODELOS quando não há estado válido restaurado; o diretório `variants/artificial-analysis-light` conserva apenas o nome histórico. A [galeria de templates](mockups/templates.html) oferece oito opções — Artificial Analysis claro/escuro e os seis temas originais como alternativas; cada preview antigo oferece um retorno visível “Design padrão ↗” para o [preview claro padrão no Globo](mockups/prototype-artificial-analysis.html?mode=claro&tab=globo), também disponível no menu de tema; esse override explícito ganha do modo escuro salvo sem apagar a preferência. O [contrato visual](variants/artificial-analysis-light/DESIGN.md) e o [contrato de experiência](variants/artificial-analysis-light/EXPERIENCE.md) da família padrão definem sua composição editorial em claro/escuro, conteúdo imediato da Empresa/Leitor e preferências separadas. O [HTML principal](mockups/prototype-artificial-analysis.html) aceita `?mode=claro/escuro`; o [atalho escuro](mockups/prototype-artificial-analysis-dark.html) redireciona para esse mesmo HTML. A abertura padrão sempre usa Light, mesmo após uma sessão escura. Modo válido na URL permite abrir claro/escuro explicitamente; o controle Modo alterna durante a sessão. Também registram a composição de Notícias inspirada no Yahoo Finance e o teste de fundo no Globo: no claro, Cinza suave `#ECEDEF`, Cinza original `#F1F2F4` e Branco; no escuro, Cinza suave `#25272D`, Cinza original `#1B1D22` e Preto `#08090B`. Os tons do fundo são experimentais; o preview não comprova implementação final ou integração. Os tokens e regras visuais abaixo permanecem válidos para as alternativas originais; seu comportamento comum é herdado salvo os deltas explícitos no par padrão. Esta escolha não encerra pendências históricas dessas alternativas.

**Delta financeiro em NOTÍCIAS.** Na família Artificial Analysis, a página reúne os dados financeiros existentes: 10 indicadores macro na faixa superior; na coluna lateral, 29 ações (seis Empresas em foco e outras 23 por Camada), amplitude/extremos, favoritos e 11 linhas mundiais em três regiões. A base atual do preview tem 35 Empresas/29 ações; a cobertura acompanha o Cadastro e é independente do filtro de manchetes, inclusive no estado zero. Abaixo de cada ação, “Conversar sobre {ticker}” abre um diálogo modal próprio do futuro especialista financeiro, separado do agente de LLMs, com contexto, pergunta/sugestões e respostas locais identificadas como demonstração. Nas principais Notícias, usar imagem verificada da própria matéria, com procedência/link original; sem URL/imagem ou em erro, placeholder sem foto. O preview reúne 78 Notícias: cinco matérias vinculadas ao Yahoo Finance no [manifesto estático](mockups/assets/news-original-sources.js), com URL/imagem/crédito do snapshot de 2026-10-12, e 73 demonstrativas. A QA local confirmou 29 ações/29 botões, 10 indicadores macro/11 linhas mundiais, imagens e Leitor correspondentes, favoritos compartilhados com MERCADOS e diálogo com contexto/foco/Escape, inclusive no celular e com zero Notícias. IA financeira real e ingestão automática permanecem futuras; a falha de carga usa o fallback contratado, sem teste de rede induzido nesta conferência.

## Brand & Style

Na **linha original de alternativas**, o Monitor Global é uma central de operações tática para o ecossistema de IA: o planeta inteiro como tela de radar, onde os Laboratórios brilham e o resto do ecossistema sustenta a cena em segundo plano. A postura vem do OSIRIS (Open Source Intelligence) — preto profundo, Globo de satélite realista, HUD de linhas finas, rótulos MAIÚSCULOS espaçados em fonte monoespaçada, barra de status com relógio UTC e trilhos laterais só de ícones. Nessas alternativas, tudo segue essa linguagem, inclusive a Tabela de modelos; Artificial Analysis é referência de conteúdo e densidade. A família padrão tem a linguagem editorial em claro/escuro definida em seu próprio contrato.

O **Terminal retrô** é a assinatura: texto que se digita, cursor em bloco piscando, moldura ASCII. O Globo é o protagonista visual; o HUD é instrumento, nunca enfeite.

A identidade se desdobra em **três famílias de tema**, cada uma com escuro e claro (6 temas): **OSIRIS fiel** (HUD preciso, dourado + ciano), **Fósforo âmbar** (CRT âmbar com varredura) e **Sala de controle noturna** (marinho, vidro, luzes das cidades). A direção 03 Terminal Bloomberg foi descartada. Termos de UX (Relação, Leitor de notícia, Fluxo de notícias, aba LABS, Agente especialista em LLMs, Painel MERCADOS, Legenda-filtro de Camadas, Busca global, Família de tema) estão definidos em [EXPERIENCE.md](<EXPERIENCE.md>) § Glossário UX; termos de produto seguem o Glossário do PRD.

> **Este DESIGN.md e o [EXPERIENCE.md](<EXPERIENCE.md>) vencem em caso de conflito** com mocks, protótipos, capturas ou imports das alternativas originais. Para o design padrão, os deltas explícitos do par Artificial Analysis têm precedência sobre esta linha original.

A marca usa um **emblema próprio** (favicon + símbolo na barra de status, junto à marca): íris concêntrica — três anéis que remetem à abertura de uma câmera/olho, coerente com o nome do produto (Íris Global). O desenho é distinto do losango ◆ que já marca Laboratórios no Globo. Ver [opções avaliadas](<.working/emblema-opcoes-2026-10-13.html>) (opção A escolhida) e § Components » Emblema da marca.

Referências: [ref-osiris-globo.webp](<imports/ref-osiris-globo.webp>) — captura do OSIRIS (osirisai.live) que originou a postura: Globo de satélite, HUD, alternância original 3D/2D/MAPA/SAT, leitura de cursor e ticker no rodapé; a alternância é referência histórica e foi supersedida pela projeção 3D fixa com bases MAPA/SAT. O confronto ideia a ideia está em [reconcile-ref-osiris-globo.md](<reconcile-ref-osiris-globo.md>). [ref-osiris-markets.webp](<imports/ref-osiris-markets.webp>) — painel MARKETS do OSIRIS, referência do Painel MERCADOS (cartões de índice, barra de amplitude, tabela por região com minigráfico 1M e favoritos); o confronto está em [reconcile-ref-osiris-markets.md](<reconcile-ref-osiris-markets.md>). [directions-1.html](<mockups/directions-1.html>) — as 4 direções visuais (01, 02, 04 viraram temas; 03 descartada), cada uma com escuro e claro e a solução do tema claro. [prototype-globe.html](<mockups/prototype-globe.html>) — protótipo v5 interativo (WebGL), fonte dos tokens abaixo; mostra o seletor antigo e não define o comportamento Cesium atualizado.

## Colors

Cada um dos seis temas originais define os mesmos 19 papéis; o YAML traz o hex completo de cada papel, na chave `<família>-<modo>-<papel>` de `colors` (ex.: `{colors.ambar-claro-acc}`). Os tokens do design padrão ficam no contrato Artificial Analysis.

| Papel | Uso | Não usar para |
|---|---|---|
| `bg` / `bar` | Fundo das vistas MODELOS/NOTÍCIAS; barra de status e Faixa de cotações | — |
| `s1` / `s2` | Painéis (Fluxo de notícias, Prévia, popovers, Leitor, Fila); cabeçalhos de tabela, dicas, hover | Fundo do palco do Globo (é `globe`) |
| `line` | Filetes de 1px, bordas, separadores tracejados | Ênfase |
| `tx` / `mu` | Texto principal / rótulos, datas, avisos, Rótulos geográficos, nome do ativo na Linha de cotação | `tx`/`mu` escuros do modo claro sobre a janela escura do Globo no OSIRIS claro (usar o texto claro de `osiris-escuro-*`) |
| `acc` | Marca, Emblema da marca, aba/base selecionada, botão ativo da Barra lateral de ações (❯_, $, ☰ com o painel aberto), títulos de painel, cabeçalhos de região do Painel MERCADOS, favorito ★ ligado, botão de resumo do Agente, Pulso, Relação de investimento, anel de seleção, Ponto fantasma, STATUS ATRASADO `[ASSUMPTION]` | Dados numéricos ou alta/baixa |
| `d1` / `d2` | Valores de dados (relógio, contadores, números, barra de inteligência, links, selos) / linha de ação do Agente, prompt da Tabela e do campo de busca do Painel MERCADOS | Marca |
| `up` / `dn` | Variação do dia, minigráfico (Terminal e Linha de cotação), Cartão de índice, Barra de amplitude, STATUS LIVE / STATUS OFFLINE `[ASSUMPTION]`, APROVAR / REJEITAR | Camadas |
| `camada-*` | Ponto, Monograma, filete do Rótulo de Laboratório, nome da Empresa no Fluxo, Relações | Estados de interface |
| `globe` / `atm` | Fundo ao redor do palco Cesium / cor da atmosfera; não determina a cartografia nem a imagem SAT | — |

**Bases do Globo Cesium.** O palco mantém geometria 3D em todas as famílias e modos. MAPA usa cartografia bem escura com detalhe OSM crescente ao aproximar. SAT usa imagem de satélite em zoom amplo e fotorealismo 3D automático em zoom próximo coberto. Cores de cromo, Pontos e rótulos continuam seguindo o tema da interface; como as imagens/provider SAT se compõem com os modos claro/escuro fica para Q6. Terreno acompanha ambas as bases; prédios só aparecem quando compatíveis e não duplicam a geometria fotorealística. Créditos das camadas ativas permanecem legíveis. Cor exata, estilo/provider, base inicial, composição e limiares seguem o gate Q6; nenhuma chave ou licença fica implícita.

**Camadas e Relações.** As cinco cores de Camada (Laboratórios, Chips, Nuvem, Energia, Software) foram escolhidas por família para nunca colidir com `up`/`dn`. A cor de cada tipo de Relação é derivada (confirmado):

| Tipo de Relação | Cor |
|---|---|
| Fabricação de chips | `camada-chips` |
| Nuvem e infraestrutura | `camada-nuvem` |
| Energia | `camada-energia` |
| Investimento | `acc` (dourado) |
| Parceria de modelos | `camada-laboratorios` |

**Famílias e modos.** Capturas dos 6 temas (versão anterior ao v5, sem abas e rótulos): [osiris-escuro](<mockups/shots/osiris-escuro.png>), [osiris-claro](<mockups/shots/osiris-claro.png>), [ambar-escuro](<mockups/shots/ambar-escuro.png>), [ambar-claro](<mockups/shots/ambar-claro.png>), [noturna-escuro](<mockups/shots/noturna-escuro.png>), [noturna-claro](<mockups/shots/noturna-claro.png>); v5 na Sala de controle noturna: [v5-globe-noturna](<mockups/shots/v5-globe-noturna.png>).

| Tema | Tratamento da interface | Relação com as bases do Globo |
|---|---|---|
| OSIRIS fiel | Claro = "console diurno": cromo `bg`/`bar` claros, painéis escuros e texto claro sobre o palco no modo claro (Regra AA abaixo) | MAPA permanece cartográfico e escuro; compatibilidade da imagem SAT com o modo segue Q6 |
| Fósforo âmbar | Escuro com scanlines + vinheta; claro = "papel térmico", réguas finas; painéis escuros nos dois modos (Regra AA abaixo) | As bases seguem MAPA/SAT; a paleta âmbar estiliza a interface, os Pontos e rótulos |
| Sala de controle noturna | Rótulos em sans (`hud-sans`); painéis de vidro; claro = "sala de controle diurna" | MAPA permanece cartográfico e escuro; compatibilidade da imagem SAT com o modo segue Q6 |

Fundo estrelado nos modos escuros, exceto Fósforo âmbar. Terreno é a camada de relevo para as duas bases quando disponível; provider e compatibilidade dependem de Q6. As regras antigas de textura do Globo e inversão dia/noite por família descrevem os protótipos anteriores e ficam supersedidas no Globo principal Cesium.

**Regra AA — painéis escuros (decidido).** No OSIRIS fiel e no Fósforo âmbar, os painéis **Terminal Fixado, Leitor de notícia, Console do Agente, Fila de revisão e Painel MERCADOS são sempre escuros**: no modo claro eles usam a paleta do modo escuro da mesma família (`osiris-escuro-*` / `ambar-escuro-*` para texto, acentos, dados e `up`/`dn`, sobre `terminal-osiris-*` / `terminal-ambar-*`), nunca `acc`/`d1`/`tx` do claro. No OSIRIS claro, os rótulos sobre o Globo (Rótulos de Laboratório e Rótulos geográficos) e a Leitura de cursor, que ficam sobre a janela escura do Globo, usam texto claro (`osiris-escuro-tx` / `-mu` / `-d1`). A Sala de controle noturna não segue a regra: seus painéis acompanham o modo.

**Contraste.** Alvo: **WCAG 2.2 AA** em todos os 6 temas — texto ≥ 4,5:1 (≥ 3:1 em texto grande) e elementos não textuais (Pontos, filetes de foco, minigráficos e Barra de amplitude) ≥ 3:1. Os 17 hex ajustados (marcados `# AA (antes …)` no YAML) mantêm o tom e passam de 4,5:1 contra `bg`, `s1`, `s2` e `bar` do próprio tema. Razões pela fórmula WCAG (luminância relativa, (L1 + 0,05) / (L2 + 0,05)) com os hex atuais:

| Tema | tx/bg | mu/bg | mu/s1 | acc/bg | d1/bg | up/bar | dn/bar | Pior par de texto (contra bg/s1/s2/bar) | Camada mais fraca/bg (não textual, ≥ 3:1) |
|---|---|---|---|---|---|---|---|---|---|
| osiris-escuro | 15,5 | 5,2 | 4,9 | 10,9 | 12,8 | 11,4 | 6,1 | 4,51 (`mu`/`s2`) | 7,5 (laboratorios) |
| osiris-claro | 15,0 | 5,0 | 5,9 | 5,0 | 5,0 | 5,7 | 5,6 | 4,52 (`mu`/`s2`) | 3,9 (energia) |
| ambar-escuro | 13,2 | 5,2 | 5,0 | 11,0 | 14,1 | 13,0 | 7,0 | 4,60 (`mu`/`s2`) | 7,8 (energia) |
| ambar-claro | 11,8 | 5,5 | 5,9 | 5,5 | 5,6 | 5,0 | 5,1 | 4,50 (`mu`/`s2`) | 3,8 (laboratorios) |
| noturna-escuro | 17,4 | 7,3 | 6,2 | 11,5 | 10,0 | 10,0 | 6,3 | 4,74 (`dn`/`s2`) | 9,2 (laboratorios) |
| noturna-claro | 14,0 | 5,0 | 6,0 | 5,0 | 5,0 | 5,7 | 5,6 | 4,50 (`d1`/`s2`) | 3,4 (energia/nuvem) |

Pares dos painéis escuros e do Globo, com a Regra AA: no OSIRIS claro, dentro dos painéis (`terminal-osiris-bg`), `acc` 10,9 · `d1` 12,8 · `tx` 15,5 · `mu` 5,2 (com `acc`/`d1` do claro seriam 3,4 e 3,5 ✗); sobre a janela `osiris-claro-globe`, `tx` 14,6 · `mu` 4,9 · `d1` 12,1 (o texto escuro do claro daria 1,1 ✗). No Fósforo âmbar claro, sobre `terminal-ambar-bg`, `d1` 13,5 · `tx` 12,6 · `acc` 10,5 · `mu` 5,0 (4,6 sobre `terminal-ambar-moldura`; o `d1` do claro daria 2,8 ✗).

As cores de Camada não foram ajustadas: passam de 3:1 como elementos não textuais em todos os temas, mas, usadas como texto pequeno (EMPRESA no Fluxo de notícias, sobre `s1`), ficam abaixo de 4,5:1 no Fósforo âmbar claro (laboratorios 4,1 ✗) e na Sala de controle noturna clara (nuvem 4,0 ✗ · energia 4,0 ✗) — ver Open Questions em EXPERIENCE.md.

**Contraste resolvido (gate Q3):** texto sobre a textura do Globo (Rótulo de Laboratório, Rótulo geográfico, Prévia sobre áreas claras) recebe halo/contorno escuro de 1px atrás do texto em todos os temas, garantindo contraste independente do que está por trás da camada MAPA/SAT. Painéis translúcidos sobre o Globo (Terminal, Leitor flutuante, Prévia) passam a usar opacidade mínima de 90% sempre que exibem texto, em vez da faixa anterior de 70–96%. O `text-shadow` do Fósforo âmbar é tratado como reforço de luminosidade apenas — nunca reduz o contraste da cor base — e não exige mudança visual.

## Typography

Mono primeiro: corpo, Terminal, Leitor, Agente, Tabela e números usam `{typography.mono}`. Rótulos de HUD são **MAIÚSCULOS com espaçamento largo** (`{typography.hud}`, 0,18em; abas 0,2em; títulos de vista 0,3em; marca 0,42em). Na Sala de controle noturna, os rótulos de HUD passam a sans (`{typography.hud-sans}`) para leitura prolongada; os números continuam em mono.

| Token | Onde |
|---|---|
| `marca` / `marca-sub` | "MONITOR GLOBAL" / "LABS DE LLM · ECOSSISTEMA DE IA" |
| `aba`, `hud`, `secao`, `titulo-vista` | Abas principais, barra de status, vistas, Legenda-filtro de Camadas, cabeçalhos de seção do Leitor, títulos das vistas MODELOS/NOTÍCIAS |
| `terminal`, `terminal-ascii` | Terminal Fixado e moldura ASCII do nome |
| `leitor-titulo`, `leitor-corpo` | Leitor de notícia |
| `fluxo-item`, `noticia-titulo` | Itens do Fluxo de notícias e da aba NOTÍCIAS |
| `tabela-*` | Estilos HÍBRIDO/TERMINAL (mono) e ANALÍTICO (sans, sem maiúsculas) |
| `chip`, `meta`, `micro` | Chips de filtro, dicas e datas, avisos da Faixa e selos, teclas da Ajuda de atalhos (`meta`), rótulos dos Cartões de índice e da Barra de amplitude (`micro`) |
| `tabela-celula`, `secao`, `tabela-cabecalho` | Painel MERCADOS: valores, tickers e variações (`tabela-celula`); cabeçalhos de região AMÉRICAS · EUROPA · ÁSIA (`secao`); cabeçalhos de coluna ATIVO · ÚLTIMO · VAR% · 1M (`tabela-cabecalho`) |
| `rotulo-laboratorio` | Rótulo fixo de 8px junto ao ◆ e Rótulos geográficos — o menor tamanho permitido no produto |

Regras: números tabulares; nomes de Modelos, Empresas e títulos originais de Notícias no idioma original (PRD §7); títulos originais aparecem entre aspas, com opacidade reduzida.

## Layout & Spacing

O **palco** é o viewport inteiro, com o Globo Cesium atrás de tudo. **Globo grande e imersivo:** maior que no protótipo v5, podendo ser cortado pelas bordas da tela, como no OSIRIS — substitui o enquadramento atual de Globo inteiro e menor (*spine-only (sem mock)*). Moldura fixa: barra de status no topo (`{spacing.barra-status}`), Faixa de cotações na base (`{spacing.faixa}`), Barra lateral de ações à direita (`{spacing.trilho}`, a `{spacing.trilho-margem}` da borda). Não há barra lateral à esquerda: a Legenda-filtro de Camadas, na base, faz o papel de filtro de Camadas. Painéis flutuam sobre o Globo: Fluxo de notícias (topo), Seletor de base e Leitura de cursor (embaixo) encostam na margem esquerda; Legenda-filtro de Camadas embaixo à direita, a `{spacing.margem-palco}` da borda; Controles de navegação na tela `[ASSUMPTION: canto inferior direito, junto à Legenda-filtro de Camadas, como na referência OSIRIS]`. As vistas MODELOS e NOTÍCIAS ocupam a área entre barra de status e Faixa, com margem lateral `{spacing.margem-vista}`.

Escala de espaçamento: 2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 22 · 28 px (`{spacing.1}`–`{spacing.10}`). Painéis: Terminal `{spacing.terminal}`, Leitor flutuante `{spacing.leitor-flutuante}` / lateral até `{spacing.leitor-lateral}`, Fila até `{spacing.fila}`, Painel MERCADOS até `{spacing.fila}` `[ASSUMPTION: mesma largura da Fila; largura não decidida — Open Questions]`, console do Agente até `{spacing.agente-altura}` (ou 46% da altura, o menor).

**Ordem de camadas (z):**

| z | Elemento |
|---|---|
| 0 | Globo Cesium em projeção 3D fixa (com Terminador quando compatível com a cena ativa) |
| 5 | Scanlines / réguas (Fósforo âmbar) |
| 20 | Barra de status, Barra lateral de ações, Seletor de base, Leitura de cursor, Legenda-filtro de Camadas, Controles de navegação |
| 21 | Fluxo de notícias / aba LABS |
| 22 | Vistas MODELOS e NOTÍCIAS |
| 25 | Faixa de cotações |
| 30 | Popovers (Relações, Tema, Som), Ajuda de atalhos `[ASSUMPTION]` |
| 35 | Prévia |
| 36 | Terminal Fixado |
| 37 | Leitor de notícia, Fila de revisão, Painel MERCADOS |
| 38 | Console do Agente |
| 40 | Dicas dos botões |

Quebras: abaixo de `{spacing.quebra-status-xl}` some "ATUALIZADO"; abaixo de `{spacing.quebra-status-lg}` some "LANÇAMENTOS 7D" e as dicas de tecla das abas; até `{spacing.quebra-celular}` vale o layout de celular (comportamento em EXPERIENCE.md § Responsive & Platform).

## Elevation & Depth

Profundidade vem de **brilho e transparência**, não de cartões elevados.

| Recurso | Regra |
|---|---|
| Brilho (`glow`) | OSIRIS escuro `0 0 8px rgba(54,226,240,.35)` (ciano) · Âmbar escuro `0 0 10px rgba(255,176,0,.45)` · Noturna escuro `0 0 14px rgba(124,196,255,.25)` · modos claros: nenhum. Aplicado em marca, valores da barra de status, aba selecionada, painéis, cabeçalho da Tabela TERMINAL |
| Painéis sobre o Globo | Superfície `s1` a 70–96% de opacidade; Sala de controle noturna com desfoque de fundo (vidro) |
| Sombras | Popover e Ajuda de atalhos `0 12px 32px rgba(0,0,0,.35)` · Prévia `0 8px 20px rgba(0,0,0,.35)` · Terminal, Leitor, Fila, Painel MERCADOS `0 18px 50px rgba(0,0,0,.5)` · Agente para cima `0 -18px 50px rgba(0,0,0,.45)` |
| CRT (Fósforo âmbar) | Escuro: scanlines de 1px a cada 3px + vinheta radial; texto do Terminal com brilho âmbar. Claro: réguas finas a cada 22px |
| Janela do Globo (OSIRIS claro) | Recorte com raio `{rounded.janela}`, aro interno `globe-aro`, sombra suave |
| Pontos | Brilho na própria cor da Camada; Laboratórios com halo duplo |

## Shapes

| Forma | Onde |
|---|---|
| `{rounded.xs}` + cantoneiras douradas de 14px | Terminal no OSIRIS fiel (assinatura "mira") |
| `{rounded.2xl}` | Terminal no Fósforo âmbar (tubo CRT com moldura `terminal-ambar-moldura`) e na Sala de controle noturna (vidro) |
| `{rounded.DEFAULT}` | Terminal (base), Leitor flutuante, Fluxo de notícias, cartões da Fila, Cartões de índice, itens da Legenda-filtro de Camadas, dicas |
| `{rounded.none}` | Leitor lateral, Fila e Painel MERCADOS (painéis presos à direita) |
| `{rounded.lg}` | Botões da Barra lateral de ações, Controles de navegação, popovers, Ajuda de atalhos, Seletor de base |
| `{rounded.full}` | Chips de filtro, sugestões do Agente, Empresas citadas, selos, Barra de amplitude |
| Losango ◆ | **Só** Laboratórios (Ponto, aba LABS, marcador no Fluxo) |
| Círculo | Pontos do ecossistema, Monogramas, indicador LIVE |
| Tracejado | Ponto fantasma e arco fantasma (proposta da Fila), bordas da Tabela TERMINAL |

## Components

**Regra AA — painéis escuros.** No OSIRIS fiel e no Fósforo âmbar, Terminal Fixado, Leitor de notícia, Console do Agente, Fila de revisão (com os Cartões de proposta) e Painel MERCADOS (com Cartões de índice, Linhas de cotação e Barra de amplitude) são sempre escuros: no modo claro, seus tokens trocam o prefixo para `<família>-escuro-*`, não `<família>-claro-*`. No OSIRIS claro, Rótulo de Laboratório, Rótulo geográfico e Leitura de cursor usam o texto claro de `osiris-escuro-*` sobre a janela escura do Globo. Razões em § Colors.

| Componente | Anatomia e visual | Tokens |
|---|---|---|
| Globo | CesiumJS no Globo principal, sempre em projeção 3D; bases selecionáveis MAPA ou SAT. MAPA tem cartografia escura e detalhe OSM progressivo. SAT exibe satélite em zoom amplo e fotorealismo 3D automaticamente em zoom próximo coberto; zoom-out, falta de cobertura ou falha fotorealística restaura a imagem SAT. Terreno acompanha as bases; prédios só onde compatíveis e sem duplicar fotorealismo. Trocar a base preserva câmera e estado; providers e disponibilidade seguem Q6. Globo grande e imersivo, podendo ser cortado pelas bordas (*spine-only (sem mock)*) | `{components.globo}` |
| Terminador | Linha dia/noite ao vivo no Globo principal, cuja projeção é sempre 3D; escurece o lado noturno conforme a cena ativa permitir. *spine-only (sem mock)*; forma e compatibilidade visual exatas seguem abertas | `{components.terminador}` |
| Rótulo geográfico | Nomes discretos de países e cidades principais e de polos de IA (Vale do Silício, Hsinchu, Shenzhen, Pequim, Hangzhou, Paris…) sobre o Globo, em MAIÚSCULAS `mu`, sem filete nem brilho; somem antes dos Rótulos de Laboratório na desobstrução; no OSIRIS claro, em `osiris-escuro-mu` (Regra AA). `[ASSUMPTION: países/cidades e polos de IA no mesmo estilo; diferença visual entre os dois a definir]`. *spine-only (sem mock)* | `{components.rotulo-geografico}` |
| Ponto | Ecossistema: círculo `{spacing.ponto-ecossistema}`, cor da Camada, opacidade 0,82, contorno escuro (claro nos modos claros fora do OSIRIS). Laboratório: ◆ `{spacing.ponto-laboratorio}` com halo; selecionado `{spacing.ponto-laboratorio-sel}` com anel `acc`; hover amplia. Fantasma: ◆ vazado tracejado em `acc`, piscando | `{components.ponto}`, `{components.ponto-laboratorio}` |
| Rótulo de Laboratório | Nome curto em MAIÚSCULAS ao lado do ◆, filete esquerdo na cor da Camada, sombra de texto para legibilidade; sufixo "◉ 5D"/"◉ HOJE" em `acc` durante o Pulso; fantasma com "NOVO?"; no OSIRIS claro, texto claro de `osiris-escuro-*` (Regra AA) | `{components.rotulo-laboratorio}` |
| Pulso | Anéis em `acc` que se propagam do Ponto; raio e opacidade decaem ao longo dos 7 dias | `{components.pulso}` |
| Relação (arco) | Arco fino entre duas Empresas na cor do tipo. Repouso: quase transparente, contínuo. Aceso (Empresa selecionada): opaco, mais grosso, tracejado animado; os demais apagam. Fantasma: tracejado `acc` | `{components.relacao-arco}` |
| Prévia | Cartão pequeno junto ao cursor: Monograma, nome em negrito, "Camada · cidade" em `micro`, linha "◉ LANÇAMENTO HÁ N DIAS" em `acc` | `{components.previa}` |
| Terminal Fixado | Cabeçalho "TERMINAL · <EMPRESA>" em `acc` + ✕; corpo `pre` com moldura ASCII do nome, linhas "> CAMPO: valor" (rótulo com opacidade 0,65), cotação com ▲/▼ e minigráfico de 30 dias em `up`/`dn` ou "PRIVADA", linha RELAÇÕES com a lista das Relações da Empresa ("→/← nome · tipo", como no protótipo aprovado), Notícias com título traduzido clicável, original entre aspas, ↗ e "marcar como irrelevante"; cursor em bloco piscando. Variantes por família (Shapes) | `{components.terminal-fixado}` |
| Leitor de notícia | Cabeçalho "▸ LEITOR · NOTÍCIA" + alternância "◫ FLUTUANTE · ▮ LATERAL" + ✕; meta (data · veículo · Empresa na cor da Camada); título; original entre aspas; seções RESUMO EM PORTUGUÊS · PONTOS-CHAVE · EMPRESAS CITADAS (pílulas com borda na cor da Camada); botão "↗ ABRIR MATÉRIA ORIGINAL (NOVA GUIA)" com borda `acc`; nota "Resumo gerado por IA a partir da fonte". Lateral entra deslizando da direita | `{components.leitor-de-noticia}` |
| Fluxo de notícias | Painel com cabeçalho de abas (◆ LABS · ▸ FLUXO), contagem e minimizar ▁; filtro em pílulas TODAS · ◆ SÓ LABORATÓRIOS; item = "[dd/mm hh:mm]" `mu` + "◆" em `camada-laboratorios` (Laboratórios) + EMPRESA em MAIÚSCULAS na cor da Camada + manchete; separador tracejado; item novo pisca com fundo `acc` a 30% que se dissolve | `{components.fluxo-de-noticias}` |
| aba LABS | Grupos "EUA · 8", "CHINA · 5", "EUROPA", "OUTROS"; linha = ◆ com brilho, NOME em negrito, "último Modelo · cidade", "▸ N notícias" em `d1`; à direita "◉ HÁ 5 DIAS" (`acc`) ou "3 MODELOS" (`mu`); Notícias expandidas recuadas sobre `s2` | `{components.aba-labs}` |
| Faixa de cotações | Barra `bar` na base; aviso fixo à esquerda "COTAÇÕES hh:mm ET · DADOS COM ATRASO · APENAS INFORMATIVO" em `micro`/`mu`; itens = Monograma `{spacing.monograma-faixa}` + TICKER `tx` + preço `mu` + "▲/▼ x,x%" em `up`/`dn`; Índices com Monograma "Σ" em `d1` | `{components.faixa-de-cotacoes}` |
| Barra de status | Emblema da marca + marca à esquerda, Abas principais, à direita "UTC hh:mm:ssZ", STATUS real "● STATUS: LIVE" · "● STATUS: ATRASADO" (com "última Atualização há X") · "● STATUS: OFFLINE", "35 EMPRESAS", "696 MODELOS", "2 LANÇAMENTOS 7D", "ATUALIZADO hh:mmZ" (valores em `d1`, LIVE em `d2`; `[ASSUMPTION: ATRASADO em acc, OFFLINE em dn]`; ATRASADO e OFFLINE são *spine-only (sem mock)*). Escuro: degradê `bar`→transparente; claro: sólido com filete | `{components.barra-de-status}` |
| Emblema da marca | Íris concêntrica — ver `{components.emblema-da-marca}` para anatomia. No favicon e na barra de status, junto a "MONITOR GLOBAL". Referência: [opções avaliadas](<.working/emblema-opcoes-2026-10-13.html>), opção A | `{components.emblema-da-marca}` |
| Abas principais | "◍ GLOBO 1 · ▤ MODELOS 2 · ≡ NOTÍCIAS 3"; selecionada com borda e texto `acc` + brilho; tecla em `kbd` com opacidade 0,5 | `{components.abas-principais}` |
| Barra lateral de ações | Única barra lateral, à direita: ⌕ Busca · ❯_ Agente · ⟡ Relações · $ MERCADOS · ◐ Tema · ☀/☾ claro/escuro · 🔇/🔊 Som com seta ‹ · ☰ Fila de revisão com selo (ordem do protótipo v5); separadores de 22px. **Ativo:** ❯_, $ e ☰ ficam acesos enquanto o painel correspondente está aberto — borda e ícone em `acc` + brilho do tema | `{components.barra-lateral}` |
| Busca global | Aberta pelo ⌕ da Barra lateral de ações; um só campo para Empresa, Modelo, ticker ou Notícia. Forma visual (campo, popover ou painel) não decidida. Destino Modelo destaca a linha na Tabela de modelos em `acc`, como o destaque do Agente. *spine-only (sem mock)* | `{components.busca-global}` |
| Popover Relações | Título "RELAÇÕES"; 5 caixas com amostra de cor de 22×3px; "Mostrar rede"; rodapé "sempre sutis · acendem na seleção" | `{components.popover}` |
| Popover Tema | 3 cartões de família (amostra 44×28px com `bg`/`acc`/`d1`, nome, descrição: "HUD preciso · dourado + ciano", "CRT âmbar · varredura", "Marinho · luzes das cidades"); selecionado com contorno `acc`; botões ESCURO · CLARO | `{components.popover}` |
| Popover Som | Linhas "⌨ Digitação" e "✳ Ambiente · espaço", cada uma com volume e alternância OFF/ON (ON em `acc`); rodapé "ambos começam desligados" | `{components.popover}` |
| Seletor de base | Grupo segmentado "MAPA · SAT" — duas bases sobre o Globo sempre 3D; a base selecionada usa `acc` e contorno interno. 3D não é uma opção do seletor | `{components.seletor-de-base}` |
| Leitura de cursor | "CURSOR lat, lng · EUA · CALIFÓRNIA · ZOOM x · ├──────┤ N KM" — o nome do lugar sob o cursor (país · estado/região) em `d1`; "—" fora da Terra; no OSIRIS claro, rótulo e valor em `osiris-escuro-mu` / `-d1` (Regra AA). Lugar: *spine-only (sem mock)* | `{components.leitura-de-cursor}` |
| Controles de navegação | Grupo de botões quadrados no estilo da Barra lateral de ações: "+" / "−" (zoom do Globo) e quatro setas (girar). Pressionado em `acc`. *spine-only (sem mock)* | `{components.controles-de-navegacao}` |
| Ajuda de atalhos | Painel aberto pela tecla `?`: título "ATALHOS" em `acc`; linhas tecla em `kbd` + ação — 1/2/3, /, Esc, F, R, setas, +/−. `[ASSUMPTION: visual de popover]`. *spine-only (sem mock)* | `{components.ajuda-de-atalhos}` |
| Legenda-filtro de Camadas | Legenda horizontal na base, embaixo à direita, que é o filtro de Camadas (substitui a antiga barra lateral esquerda de Camadas): um botão por Camada — ponto de 8px na cor da Camada com brilho + NOME em `hud`/`mu` + contagem de Empresas pela Camada principal em negrito `tx` ("● LABORATÓRIOS 14 · ● CHIPS 8 · ● NUVEM 6 · ● ENERGIA 5 · ● SOFTWARE 2"). Hover: borda `line` e texto `tx`. Desligado: item esmaecido (opacidade 0,35, ponto sem brilho). Celular: continua visível, em uma linha com rolagem horizontal | `{components.legenda-filtro-de-camadas}` |
| Tabela de modelos | Título "TABELA DE MODELOS" + "8 de 696 modelos · clique no cabeçalho para ordenar" + seletor de estilo. HÍBRIDO (padrão): TERMINAL + barra de inteligência de 5px em `d1`. TERMINAL: mono, filetes tracejados, cabeçalho `acc` com brilho, prompt "> SELECT * FROM modelos …" em `d2`. ANALÍTICO: sans, cabeçalho `s2` sem maiúsculas, zebra, moldura `{rounded.xl}`, barra de 6px arredondada. Etiqueta "raciocínio"; "≈" no custo; "—" sem dado; linhas destacadas pelo Agente com `acc` a 18%; atribuição no rodapé | `{components.tabela-de-modelos}` |
| aba NOTÍCIAS | Título "NOTÍCIAS" + contagem; chips de Camada + seletor "Todas as Empresas"; item em grade (data/hora · Monograma `{spacing.monograma-noticia}` · título traduzido, original, meta "EMPRESA · VEÍCULO ↗ matéria original ◍ ver no globo marcar como irrelevante") | `{components.aba-noticias}` |
| Console do Agente | Painel que sobe da base, acima da Faixa, até a Barra lateral de ações; borda superior de 2px em `acc`; cabeçalho "❯_ AGENTE · ESPECIALISTA EM LLMS" + "◷ Histórico", "⤢", "✕"; coluna de Histórico opcional; pergunta "❯ …" em `d1`; resposta digitada; linha de ação "⟶ …" em `d2`; "fontes: [1] … · [2] …" em `mu`; sugestões em pílulas; campo com prompt "❯" | `{components.agente-console}` |
| Fila de revisão | Painel preso à direita: "☰ FILA DE REVISÃO · N PENDENTES" + ✕; subtítulo "Nada muda no Cadastro sem a sua aprovação · ↗ = origem de cada dado"; vazia: "✓ NADA PARA REVISAR" centralizado | `{components.fila-de-revisao}` |
| Cartão de proposta | Tipo em `acc` (◆ LABORATÓRIO NOVO · ✎ CORREÇÃO DE DADOS · ⟡ RELAÇÃO NOVA · ⇄ PAR DE MODELOS INCERTO) + "quando · agente" em `mu`; motivo; linhas chave/valor (chave em `micro`) com ↗; botões ✓ APROVAR (`up`), ✎ EDITAR, ✕ REJEITAR (`dn`), ◍ VER NO GLOBO (`d1`, à direita). Edição: campos com borda `acc`. Resolvido: linha compacta "✓ Aprovado/✕ Rejeitado · rótulo · DESFAZER" + nota | `{components.cartao-de-proposta}` |
| Painel MERCADOS | Painel preso à direita (como a Fila): cabeçalho "$ MERCADOS" em `acc` + ponto de status ao vivo/atrasado (mesmas cores do STATUS da Barra de status: `up` · `acc` · `dn`) + ⤢ (abrir maior/tela cheia) + ✕; **topo fixo** com campo de busca por ticker (prompt ">" em `d2`), abas (VISÃO GERAL · WATCH, selecionada em `acc`), grade de Cartões de índice (índices e macro) e Barra de amplitude — só a lista abaixo rola; lista com cabeçalhos de coluna ATIVO · ÚLTIMO · VAR% · 1M em `tabela-cabecalho`/`mu`; ações do Cadastro agrupadas por Camada (cabeçalho com ponto da Camada) em Linhas de cotação; índices mundiais por região com cabeçalhos AMÉRICAS · EUROPA · ÁSIA em `secao`/`acc`, indicador "N DE M BOLSAS EM PREGÃO" em `micro` e estado aberto/fechado em cada índice (forma visual do estado não decidida); botão de resumo do Agente no rodapé, largura total, borda e texto em `acc`. `[ASSUMPTION: aviso "DADOS COM ATRASO · APENAS INFORMATIVO" com o horário, em micro/mu, como na Faixa (FR-19)]`. ⤢, cabeçalhos de coluna, topo fixo, pregão e ponto de status: *spine-only (sem mock)* | `{components.painel-mercados}` |
| Cartão de índice | Caixa `s1` com filete `line`: NOME em `micro`/`mu` (S&P 500, NASDAQ-100, NASDAQ COMPOSITE, SOX, VIX, US 10Y, DÓLAR, OURO, PETRÓLEO WTI, BITCOIN), valor em `tabela-celula`/`tx`, variação "▲/▼ x,xx%" em `up`/`dn`; em grade de 4 colunas como na referência | `{components.cartao-de-indice}` |
| Linha de cotação | ☆ (desligado, `mu`) / ★ (favorito, `acc`) · TICKER em negrito `tx` + nome em `mu` truncado · preço · "▲/▼ x,xx%" em `up`/`dn` · minigráfico 1M na cor da tendência; hover em `s2`; Dica com nome completo, símbolo e bolsa (*spine-only (sem mock)*). Usada nas ações do Cadastro, nos índices mundiais e na aba WATCH | `{components.linha-de-cotacao}` |
| Barra de amplitude | Rótulo "AMPLITUDE" em `micro` + "N▲" em `up` e "N▼" em `dn`; barra horizontal fina dividida na proporção sobem × caem (`up` / `dn`, trilho `s2`); abaixo, "▲ TICKER +x,x%" (maior alta, `up`) à esquerda e "▼ TICKER −x,x%" (maior queda, `dn`) à direita | `{components.barra-de-amplitude}` |
| Chip de filtro | Pílula MAIÚSCULA com ponto de Camada opcional; desligado a 40% | `{components.chip-filtro}` |
| Monograma | Círculo na cor da Camada com 2 letras em `bg`, negrito; tamanhos `monograma-*` | `{components.monograma}` |
| Dica | Rótulo MAIÚSCULO ao lado do botão da Barra lateral de ações, sobre `s2`; também na Linha de cotação do Painel MERCADOS | `{components.dica}` |
| Confirmação de ocultar | "Ocultar esta notícia? · OCULTAR · CANCELAR". `[ASSUMPTION: forma visual não prototipada — botões no estilo dos botões do Cartão de proposta, OCULTAR em dn]` | `{components.confirmacao-ocultar}` |

Referências visuais: [v5-globe-labs](<mockups/shots/v5-globe-labs.png>) — ◆ com Rótulos de Laboratório, aba LABS com Notícias expandidas e Faixa de cotações; [v5-labs-news](<mockups/shots/v5-labs-news.png>) — aba LABS com "▾ 3 notícias" aberta e Pulso "5D"; [v5-bay-area](<mockups/shots/v5-bay-area.png>) — espalhamento dos Pontos da Baía de SF e Relações sutis; [v5-feed-default](<mockups/shots/v5-feed-default.png>) — Fluxo de notícias padrão com marcadores ◆; [v4-fix-term-reader](<mockups/shots/v4-fix-term-reader.png>) — Terminal Fixado (OSIRIS) com Relações e Leitor de notícia LATERAL; [v5-chat-compare](<mockups/shots/v5-chat-compare.png>) — Console do Agente sobre a Tabela de modelos (HÍBRIDO) com linhas destacadas; [v5-chat-goto](<mockups/shots/v5-chat-goto.png>) — Agente agindo no painel (Terminal da Mistral aberto acima do console); [v5-queue-preview](<mockups/shots/v5-queue-preview.png>) — Fila de revisão com Cartões de proposta e Ponto fantasma "NOVO?"; [v5-queue-done](<mockups/shots/v5-queue-done.png>) — itens resolvidos com DESFAZER; [v5-markets](<mockups/shots/v5-markets.png>) — Painel MERCADOS no [prototype-globe.html](<mockups/prototype-globe.html>); [v5-markets-ai](<mockups/shots/v5-markets-ai.png>) — Resumo do Agente no Console com as maiores variações destacadas no Painel MERCADOS (captura anterior à remoção da barra lateral de Camadas); [v5-legend](<mockups/shots/v5-legend.png>) — Legenda-filtro de Camadas na base (CHIPS em hover), sem barra lateral à esquerda, Fluxo de notícias, seletor e Leitura de cursor na margem esquerda; [ref-osiris-markets.webp](<imports/ref-osiris-markets.webp>) — referência do Painel MERCADOS, Cartão de índice, Linha de cotação e Barra de amplitude. As capturas mostram protótipos anteriores ao Cesium e não fixam a imagem-base nem o seletor atuais.

Sem mock (*spine-only*): Terminador, Rótulo geográfico, Controles de navegação, Ajuda de atalhos, Busca global, STATUS ATRASADO/OFFLINE, lugar na Leitura de cursor, Globo grande cortado pelas bordas e, no Painel MERCADOS, ⤢, cabeçalhos de coluna, topo fixo, indicador de pregão, ponto de status e Dica com símbolo e bolsa. Emblema da marca tem referência visual em [.working/emblema-opcoes-2026-10-13.html](<.working/emblema-opcoes-2026-10-13.html>) (opção A).

## Do's and Don'ts

| Do | Don't |
|---|---|
| ◆ e Rótulo fixo só para Laboratórios; ecossistema discreto | Dar ao ecossistema o mesmo peso visual dos Laboratórios |
| `acc` para marca, seleção, Pulso e investimento | Usar `acc` para dados, alta/baixa ou Camadas |
| `up`/`dn` só para mercado (Faixa, Terminal, Painel MERCADOS), STATUS e aprovar/rejeitar | Pintar Camadas ou estados de interface de verde/vermelho |
| Manter a cartografia MAPA escura em todos os temas e a imagem SAT natural do provider ativo | Voltar à alternância 3D/2D/MAPA/SAT ou colorir a imagem-base pelo tema antes de resolver Q6 |
| Relações quase transparentes em repouso, acesas na seleção | Rede de arcos opaca o tempo todo |
| HUD MAIÚSCULO espaçado em mono (sans só nos rótulos da Sala de controle noturna) | Misturar maiúsculas e minúsculas nos rótulos de HUD; texto abaixo de 8px |
| "—" para dado ausente, "≈" em Modelos de raciocínio | "0" no lugar de dado ausente |
| Terminal com a personalidade da família (cantoneiras, tubo CRT, vidro) | Terminal genérico sem moldura; invertê-lo no Fósforo âmbar claro |
| Usar os hex AA do YAML; Terminal, Leitor, Agente, Fila e Painel MERCADOS sempre escuros no OSIRIS fiel e no Fósforo âmbar | Voltar aos hex anteriores (`# AA (antes …)`); usar `acc`/`d1`/`tx` do modo claro dentro desses painéis ou texto escuro sobre a janela do Globo no OSIRIS claro |
| Painéis de bordas finas `line`, translúcidos sobre o Globo | Cartões opacos com sombra pesada cobrindo o Globo |
| Rótulos geográficos discretos, sempre abaixo dos Rótulos de Laboratório | Rótulos geográficos competindo com os Laboratórios ou com cor de Camada |
| Variação no Painel MERCADOS sempre com ▲/▼ além da cor | Minigráfico ou variação só por cor |
| Faixa de cotações só com cotações | Manchetes ou eventos misturados na Faixa |
| Camadas filtradas pela Legenda-filtro de Camadas na base; item desligado esmaecido | Voltar a ter uma barra lateral esquerda de Camadas (eliminada); Camada desligada sem sinal visual |
