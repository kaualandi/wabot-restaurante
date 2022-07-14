const {setNextStep, getUser} = require('../fetch');

const messages = {
    hi: (time) => `Olá, ${time}.`,
    welcome: (name) => `Certo, já te encontrei aqui, ${name}.`,
    howCanIHelp: () => `Escolha uma das opções.\nUse apenas números.\n\n*1*: Olhar cardápio (PDF);\n*2*: Pedir produto;\n*3*: Ver carrinho;\n*4*: Alterar email;\n*5*: Fechar carrinho;\n*6*: Desistir.`,
    whatIsYourEmail: () => `Diga-me, por favor, o seu e-mail cadastrado:`,
};

module.exports = async (client, message) => {
    const { from } = message;

    const stamp = new Date();
    const hours = stamp.getHours();
    let time;
    if (hours >= 18 && hours < 24) {
        time = "boa noite"
    } else if (hours >= 12 && hours < 18) {
        time = "boa tarde"
    } else if (hours >= 0 && hours < 12) {
        time = "bom dia"
    }

    console.log('Cheguei aqui, linha 24');
    await client.sendText(from, messages.hi(time));
    console.log("Mensagem enviada");
    
    const user = await getUser(from);
    
    console.log(`User: ${user.id}`);

    if(user) {
        const { email, name } = user;
        if (email) {
            await client.sendText(from, messages.welcome(name));
            await setNextStep('s2', from);
            await client.sendText(from, messages.howCanIHelp());
            console.log("Mensagem enviada");
        } else {
            await setNextStep('s1', from);
            await client.sendText(from, messages.whatIsYourEmail());
            console.log("Mensagem enviada");
        }
    } else {
        await setNextStep('s1', from);
        await client.sendText(from, messages.whatIsYourEmail());
        console.log("Mensagem enviada");
    }
}