/* Conteúdo público da apresentação.
   Fonte: copy da proposta "Sprint Visual de Lançamento — M3L" enviada pelo Nil (2026-10-30).
   "menu" = rótulo curto do menu (null = cena sem item no menu). */
window.PROPOSTA = {
  scenes: [
    {
      id: "inicio", menu: "Início", type: "cover", theme: "light",
      identifier: "M3L · Mentoria Três Liberdades · Thays Assis",
      title: "Sprint Visual de Lançamento.",
      support: "Proposta comercial · Pixel Rain Studio"
    },
    {
      id: "projeto", menu: "O projeto", type: "list", stage: true, theme: "light",
      identifier: "O projeto",
      title: "Pessoas que compartilham uma mesma visão de crescimento e liberdade.",
      items: [
        "Financeira.",
        "Geográfica.",
        "De tempo."
      ]
    },
    {
      id: "lancamento", menu: "Lançamento", type: "text", theme: "dark",
      identifier: "Lançamento · 09 de novembro",
      title: "Comunidade e pertencimento.",
      paragraphs: [
        "Para o lançamento de 09 de novembro, vamos desenvolver uma direção visual que traduza essa proposta, fortaleça a identidade da mentoria e construa uma percepção de comunidade e pertencimento.",
        "O projeto será realizado em formato Sprint Visual, com desenvolvimento intensivo e entregas direcionadas às necessidades imediatas do lançamento."
      ]
    },
    {
      id: "escopo", menu: "O que vamos desenvolver", type: "steps", stage: true, theme: "light",
      panels: [
        {
          anchor: "conceito", theme: "light",
          number: "01", name: "Conceito",
          title: "Conceito e direção criativa.",
          items: [
            "Conceito visual central da M3L.",
            "Direção estética, paleta de cores e tipografia.",
            "Definição de um elemento simbólico para representar a comunidade."
          ]
        },
        {
          anchor: "identidade", theme: "dark",
          number: "02", name: "Identidade",
          title: "Identidade visual de lançamento.",
          items: [
            "Refinamento da assinatura visual M3L.",
            "Desenvolvimento de um símbolo de pertencimento.",
            "Sistema gráfico para aplicação nos materiais."
          ]
        },
        {
          anchor: "aplicacoes", theme: "light",
          number: "03", name: "Aplicações",
          title: "Aplicações essenciais.",
          items: [
            "Arte principal da mentoria.",
            "Template visual para posts e Stories.",
            "Capa da comunidade.",
            "Direção visual para materiais das aulas.",
            "Arte-base para placas de premiação."
          ]
        },
        {
          anchor: "entrega", theme: "dark",
          number: "04", name: "Entrega",
          title: "Pronto para o lançamento.",
          items: [
            "Mini guia visual.",
            "Arquivos finais organizados para utilização no lançamento."
          ]
        }
      ]
    },
    {
      id: "cronograma", menu: "Cronograma", type: "process", stage: true, theme: "light",
      title: "Cinco dias de desenvolvimento.",
      items: [
        { date: "Seg · 02/11", name: "Imersão e direção.", desc: "Reunião de alinhamento, entendimento da mentoria, definição de prioridades, referências e conceito central." },
        { date: "Ter · 03/11", name: "Construção visual.", desc: "Desenvolvimento da direção criativa, símbolo de comunidade e proposta visual da M3L." },
        { date: "Qua · 04/11", name: "Apresentação e refinamento.", desc: "Apresentação do conceito desenvolvido, alinhamento com a Thays e aplicação dos ajustes acordados." },
        { date: "Qui · 05/11", name: "Desdobramentos.", desc: "Desenvolvimento das aplicações essenciais para o lançamento, seguindo a direção visual aprovada." },
        { date: "Sex · 06/11", name: "Finalização e entrega.", desc: "Revisão final, organização dos arquivos, entrega do mini guia e disponibilização dos materiais." }
      ]
    },
    {
      id: "investimento", menu: "Investimento", type: "investment", stage: true, theme: "light",
      identifier: "Sprint Visual de Lançamento",
      title: "Investimento.",
      price: "R$ 4.500,00",
      condition: ["50% na contratação: R$ 2.250,00.", "50% na entrega final: R$ 2.250,00."]
    },
    {
      id: "condicoes", menu: "Condições", type: "text", theme: "light",
      identifier: "Condições do projeto",
      title: "Uma direção criativa principal, uma rodada de ajustes de conceito e refinamentos finais nas aplicações contratadas.",
      paragraphs: [
        "Por se tratar de um desenvolvimento acelerado, o cronograma depende da disponibilização dos materiais necessários e das aprovações da cliente nas datas previstas.",
        "O escopo contempla exclusivamente os materiais descritos nesta proposta. Novas aplicações ou alterações estruturais após a aprovação da direção visual poderão ser orçadas separadamente."
      ]
    },
    {
      id: "proximo-passo", menu: "Próximo passo", type: "closing", theme: "dark",
      title: "Próximo passo: iniciar a imersão em 02/11.",
      items: [
        "Aprovação da proposta.",
        "Confirmação da entrada.",
        "Reserva da agenda de produção e imersão na segunda-feira, 02/11."
      ],
      signature: "Direção criativa e identidade para marcas, negócios e experiências."
    }
  ]
};
