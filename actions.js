const axios = require("axios");
const { steps } = require("./steps");
require('dotenv').config();

const baseUrlBotInfors = process.env.BASEURL_BOTINFORS

const feedbackCTL = {
    next: "s0",
    menssages: [`Você escolheu sair...\n\nNão sei por que está saindo, mas espero que não demore voltar.\nSe precisar de ajuda entre no nosso discord bit.ly/PlaySADiscord.`],
}

function setNextStep(nextStep, id) {
    console.log('nextStep', nextStep);
    axios.patch(`${baseUrlBotInfors}/users/${id}`, {
        nextMassage: nextStep
    }).then((res) => {
        console.log('new nextStep saved');
    }).catch((err) => {
        console.log(err);
    });
}

async function start(client, message, data) {
    const { nextMassage } = data;
    
    const { chat, from } = message;
    // ? For add client.reply() add "id" in to above defragment
    let { body } = message;

    body = body.toLowerCase().trim();
    
    console.log('STEP	===>', nextMassage);
    if (body === 'sair') {
        if (nextMassage === 's0') {
            await client.sendText(from, 'Você já saiu...');
            console.log("mensagem enviada");
            return;
        }
        console.log("chose to leave");
        const feedback = feedbackCTL;
        const menssages = feedback.menssages;
        console.log("MENSSAGES	===>", menssages);
        menssages.forEach(async (menssage) => {
            await client.sendText(from, menssage);
            console.log("mensagem enviada");
        });
        setNextStep(feedback.next, chat.id);
    } else if (nextMassage === "") {
        const feedback = await steps["s0"]();
        const menssages = feedback.menssages;
        console.log("MENSSAGES	===>", menssages);
        menssages.forEach(async (menssage) => {
            await client.sendText(from, menssage);
            console.log("mensagem enviada");
        });
        setNextStep(feedback.next, chat.id);
    } else {
        const feedback = await steps[nextMassage](chat.id, body);
        const menssages = feedback.menssages;
        console.log("MENSSAGES	===>", menssages);
        menssages.forEach(async (menssage) => {
            await client.sendText(from, menssage);
            console.log("mensagem enviada");
        });
        setNextStep(feedback.next, chat.id);
    }
}

async function signup(client, message) {
    const { id, from, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg } = message;

    axios.post(`${baseUrlBotInfors}/users`, {
        id: chat.id,
        userId: null,
        nextMassage: "",
        selected_plan: null,
        name: '',
        from: from,
    }).then(function (response) {
        const { data } = response;
        console.log(data);
        console.log("CADASTRO REALIZADO");
        start(client, message, data);
    }).catch(function (error) {
        console.log(error);
    });
}

const actions = {
    start: (client, message, data) => start(client, message, data),
    signup: (client, message) => signup(client, message),
}

module.exports = actions;