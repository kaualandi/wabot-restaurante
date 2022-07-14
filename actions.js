const axios = require("axios");
const steps = require("./steps");
require('dotenv').config();

const baseUrlBotInfors = process.env.BASEURL_BOTINFORS

const feedbackCTL = {
    next: "s0",
    menssages: [`Você escolheu sair...\n\nNão sei por que está saindo, mas espero que não demore voltar.\nSe precisar de ajuda entre no nosso discord bit.ly/PlaySADiscord.`],
}

async function start(client, message) {
    const { from } = message;
    // ? For add client.reply() add "id" in to above defragment

    const step = await axios.get(`${baseUrlBotInfors}/users/${from}`).then((res) => {
        const { data } = res;
        console.log("USER	===> JÁ CADASTRADO");
        return data.step;
    }).catch((err) => {
        if (err?.response?.status === 404) {
            console.log("USER	===> NÃO CADASTRADO");
            return 's0';
        } else {
            client.sendText(from, `Algo não se saiu bem, não consegui recuperar suas informações.\n${err}`);
        }
    });

    console.log('STEP	===>', step);
    if (steps[step]) {
        await steps[step](client, message);
    } else {
        console.log(`PASSO INEXISTENTE`);
    }
}

const actions = {
    start: (client, message, data) => start(client, message, data)
}

module.exports = actions;