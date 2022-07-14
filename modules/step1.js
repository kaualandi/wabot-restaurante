const { setNextStep, getUserByEmail, alterData } = require('../fetch');

const messages = {
    welcome: (name) => `Certo, já te encontrei aqui, ${name}.`,
    howCanIHelp: () => `Escolha uma das opções.\nUse apenas números.\n\n*1*: Olhar cardápio (PDF);\n*2*: Pedir produto;\n*3*: Ver carrinho;\n*4*: Alterar email;\n*5*: Fechar carrinho;\n*6*: Desistir.`,
    whatIsYourEmail: () => `Diga-me, por favor, o seu e-mail cadastrado:`,
    invalidEmail: () => `Ops, parece que você não digitou um e-mail válido.`,
    inexistentEmail: () => `Esse e-mail não possue cadastro.`,

};

module.exports = async (client, message) => {
    const { from, body } = message;

    const email = body.toLowerCase().trim();
    const emailRegex = /\S+@\S+\.\S+/;
    const emailValid = emailRegex.test(email);

    if (!emailValid) {
        await client.sendText(from, messages.invalidEmail());
        await setNextStep('s1', from);
        await client.sendText(from, messages.whatIsYourEmail());
        console.log("Mensagem enviada");
    } else {
        const data = await getUserByEmail(email);
        if (data) {
            const { name } = data;
            const firtName = name.split(' ')[0];
            await alterData('name', firtName, from);
            await alterData('email', email, from);
            await client.sendText(from, messages.welcome(name));
            console.log("tentando setar s2");
            await setNextStep('s2', from);
            await client.sendText(from, messages.howCanIHelp());
            console.log("Mensagem enviada");
        } else {
            await client.sendText(from, messages.invalidEmail());
            await setNextStep('s1', from);
            await client.sendText(from, messages.whatIsYourEmail());
            console.log("Mensagem enviada");
        }
    }
}