const path = require('path');
const { setNextStep, getCartList } = require('../fetch');

const messages = {
    howCanIHelp: () => `Escolha uma das opções.\nUse apenas números.\n\n*1*: Olhar cardápio (PDF);\n*2*: Pedir produto;\n*3*: Ver carrinho;\n*4*: Alterar email;\n*5*: Fechar carrinho;\n*6*: Desistir.`,
    whatIsYourEmail: () => `Diga-me, por favor, o seu e-mail cadastrado:`,
    whatIsproductId: () => `Diga-me, por favor, o ID do produto:\n_Pode ser encontrado no cardápio._`,
    invalidOption: () => `Ops, parece que você não digitou uma opção válida.\nCertifique-se de utilizar apenas números, por favor.`,
    clt: () => `Você escolheu sair...\n\nNão sei por que está saindo, mas espero que não demore voltar.`,
};

const options = {
    1: async (client, message) => {
        const { from } = message;
        const menu = path.resolve(__dirname, '../media/menu.pdf');
        // await client.sendFile(from, menu);
        await client.sendText(from, `Não encontrei um cardápio, desculpe.`);
        await setNextStep('s2', from);
        await client.sendText(from, messages.howCanIHelp());
        console.log("Mensagem enviada");
    },
    2: async (client, message) => {
        const { from } = message;
        await setNextStep('s3', from);
        await client.sendText(from, messages.whatIsproductId());
        console.log("Mensagem enviada");
    },
    3: async (client, message) => {
        const { from } = message;
        await client.sendText(from, `Carrinho está vazio.`);
        await setNextStep('s2', from);
        await client.sendText(from, messages.howCanIHelp());
        console.log("Mensagem enviada");
    },
    4: async (client, message) => {
        const { from } = message;
        await setNextStep('s1', from);
        await client.sendText(from, messages.whatIsYourEmail());
        console.log("Mensagem enviada");
    },
    5: async (client, message) => {
        const { from } = message;
        await client.sendText(from, `Em desenvolvimento.`);
        await setNextStep('s2', from);
        await client.sendText(from, messages.howCanIHelp());
    },
    6: async (client, message) => {
        const { from } = message;
        await setNextStep('s0', from);
        await client.sendText(from, messages.clt());
    }
}

module.exports = async (client, message) => {
    const { from, body } = message;

    if (options[body]) {
        await options[body](client, message);
    } else {
        await client.sendText(from, messages.invalidOption());
        await setNextStep('s2', from);
        await client.sendText(from, messages.howCanIHelp());
    }
}