# Proposta comercial | Sprint Visual de Lançamento M3L

Mentoria Três Liberdades, para Thays Assis. Apresentação em página única (HTML/CSS/JS estático, sem build e sem CDN), com o mesmo template visual da proposta Pedro Sousa: Rizoma + Geist, palcos com rolagem e navegação por teclado.

## Como abrir

```
cd "D:\Projetos ClaudeCode\PIXEL-RAIN\proposta-comercial\Proposta comercial - Sprint Visual M3L"
python -m http.server 4173
```

http://localhost:4173/ · sem animação: `?static=1` · imprimir/PDF: Ctrl+P.

Âncoras: `#inicio`, `#projeto`, `#lancamento`, `#escopo` (`#conceito`, `#identidade`, `#aplicacoes`, `#entrega`), `#cronograma`, `#investimento`, `#condicoes`, `#proximo-passo`.

Navegação: ↓/→/Espaço avançam, ↑/← voltam, botão Menu pula para uma seção (igual à proposta Pedro Sousa).

## Conteúdo

A copy está só em `js/content.js`, tirada da copy enviada pelo Nil em 2026-10-30.

| Cena | Tipo | Notas |
|---|---|---|
| Início | cover | |
| O projeto | list (palco, 3 estados) | as três liberdades: financeira, geográfica, de tempo |
| Lançamento | text (escuro) | parágrafos 2 e 3 de "O projeto" |
| O que vamos desenvolver | steps (palco, 4 painéis) | Conceito · Identidade · Aplicações · Entrega |
| Cronograma | process (palco, 5 dias) | a descrição aparece no dia em destaque |
| Investimento | investment (1 estado) | R$ 4.500,00 em 50% + 50% |
| Condições | text | |
| Próximo passo | closing (escuro) | assinatura Pixel Rain Studio |

## Diferenças em relação ao template Pedro Sousa

- Saíram o motion das marcas (`brand-motion.*`), os cases e as cenas de página, papéis, cartão e síntese.
- `render.js` ganhou o tipo `text`, eyebrow opcional em `list`, itens com data/nome/descrição em `process`, alternativa e equivalência opcionais em `investment`, número variável de colunas e assinatura em `closing`.
- A proteção contra órfãs passou a ligar "·" e "|" às palavras vizinhas.
- `qa/screens/` guarda as capturas de cada parada em 1920×1080 e 1366×768, mais a página inteira em 390×844.
