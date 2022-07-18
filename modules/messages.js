module.exports = {
    hi: (time) => `Olá, ${time}.`,
    welcome: (name) => `Certo, já te encontrei aqui, ${name}.`,
    howCanIHelp: () => `Escolha uma das opções.\nUse apenas números.\n\n*1*: Olhar cardápio (PDF);\n*2*: Pedir produto;\n*3*: Ver carrinho;\n*4*: Alterar email;\n*5*: Fechar carrinho;\n*6*: Esvaziar carrinho;\n*7*: Desistir.`,
    whatIsYourEmail: () => `Diga-me, por favor, o seu e-mail cadastrado:`,
    invalidEmail: () => `Ops, parece que você não digitou um e-mail válido.`,
    inexistentEmail: () => `Esse e-mail não possue cadastro.`,
    whatIsproductId: () => `Diga-me, por favor, o ID do produto e, separando por um espaço, a quantidade:\nExemplo: \`\`\`01 3\`\`\`\nSendo 01 o produto e 3 a quantidade\n\n_O ID do produto pode ser encontrado no cardápio. Se quiser ver o cardápio digite "voltar"_`,
    invalidOption: () => `Ops, parece que você não digitou uma opção válida.\nCertifique-se de utilizar apenas números, por favor.`,
    clt: () => `Você escolheu sair...\n\nNão sei por que está saindo, mas espero que não demore voltar.`,
    invalidProduct: () => `O produto que você escolheu não existe.`,
    invalidProductQuantity: () => `A quantidade que você escolheu não é valida.`,
    heChooseProduct: (name, qtd) => `Você escolheu ${qtd} ${name}.`,
    confirmProduct: () => `Isso está correto?\nUse apenas números.\n*1*: Sim.\n*2*: Não, voltar.`,
    whatElse: () => `Escolha uma das opções.\nUse apenas números.\n\n*1*: Escolher mais itens;\n*2*: Verificar carrinho;\n*3*: Esvaziar carrinho;\n*4*: Finalizar pedido;\n*5*: Desistir.`,
    dropedCart: () => `Esvaziamos o seu carrinho.`,
}