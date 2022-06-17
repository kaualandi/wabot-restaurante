const actions = require("./actions.js");
const axios = require("axios");
require('dotenv').config();

const baseUrlBotInfors = process.env.BASEURL_BOTINFORS;
const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

module.exports = msgHandler = async (client, message) => {
    try {
        const { id, from, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg } = message;
        let { body } = message;
        const { formattedTitle } = chat;
        let { pushname, verifiedName } = sender;
        pushname = pushname || verifiedName;
        const commands = caption || body || "";
        const falas = commands.toLowerCase();
        const command = commands.toLowerCase().split(" ")[0] || "";
        const args = commands.split(" ");

        const msgs = (message) => {
            if (command.startsWith("/")) {
                if (message.length >= 10) {
                    return `${message.substr(0, 15)}`;
                } else {
                    return `${message}`;
                }
            }
        };

        console.log("---------------------------------------");
        console.log('DATE TIME	===>', new Date().toLocaleString('pt-br'));
        if (isGroupMsg) {
            return console.log("\x1b[1;31mMENSSAGE GROUP. IGNORING\x1b[0m");
        }

        console.log("FROM 	===>", pushname);
        console.log("FROM_ID 	===>", chat.id);
        console.log("ARGUMENTS	===>", isMedia ? `[${mimetype}]` :args);
        console.log("BODY	===>", isMedia ? `[${mimetype}]` : body);

        if (isMaintenanceMode) {
            console.log("\x1b[1;31mMAINTENANCE_MODE ON! IGNORING\x1b[0m");
            return client.sendText(from, "🚧️ *Estou em manutenção.* 🚧️\n\nEstão trabalhando para que eu fique melhor,\nou para que algum problema seja resolvido. 😁\nVolte mais tarde, e tente novamente. 😉");
        }

        axios.get(`${baseUrlBotInfors}/users/${chat.id}`).then((res) => {
            const { data } = res;
            console.log("USER	===> JÁ CADASTRADO");
            actions.start(client, message, data);
        }).catch((err) => {
            if (err?.response?.status === 404) {
                console.log("USER	===> NÃO CADASTRADO");
                actions.signup(client, message);
            } else {
                client.sendText(from, `Algo não se saiu bem, não consegui recuperar suas informações.\n${err}`);
            }
        });

    } catch (err) {
        console.log("\x1b[1;31m[ERROR]\x1b[0m", err);
    }
};
