const { getUserByEmail, setWppById, alterData, getBotData, getListPlans, getPlans, getPaymentLink, premiumStatus } = require('./fetch')
require('dotenv').config();

function handleToBRL(currency) {
    if (isNaN(currency)) {
        return currency;
    } else {
        return parseFloat(currency).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }
}
function reformatDate(dateStr) {
    const dateArr = dateStr.split('-')
    const [ano, mes, dia] = dateArr;
    const date = new Date(ano, mes - 1, dia);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return {
        date: date.toLocaleDateString('pt-br'),
        alreadyPassed: date < now,
        isNow: date == now
    };
}

const allMenssages = {
    'hi': (time) => `Olá, ${time}.`,
    'bye': (firtName) => `Obrigado e volte sempre, ${firtName}!\n\nNão se esqueça de participar de nossa comunidade no discord: bit.ly/PlaySADiscord.`,
    'welcome': () => `Sou o robô assistente do *Play Series, Filmes e Animes*, posso te ajudar com sua assinatura.`,
    'register': () => `Caso não tenha cadastro se cadastre pelo app: bit.ly/PlaySA_DownloadApp e depois volte aqui para prosseguirmos.`,
    'talkToSomeone': () => `Se quiser conversar com alguém, isso é pelo nosso discord: bit.ly/PlaySADiscord.`,
    'whatIsYourEmail': () => `Diga-me, por favor, o seu e-mail cadastrado:`,
    'invalidEmail': () => `Ops, parece que você não digitou um e-mail válido.`,
    'ok': (firtName) => `Perfeito, ${firtName}!`,
    'howCanIHelp': () => `Escolha em que posso te ajudar:\n\n*1*: Fazer recarga.\n*2*: Consultar status premium.\n\nUtilize apenas números, por favor.`,
    'inexistentEmail': () => `Esse e-mail não pertence a ninguém. Caso não tenha uma conta, se cadastre pelo app: bit.ly/PlaySA_DownloadApp e depois volte aqui para prosseguirmos.`,
    'errorAxios': () => `Ops, algo deu errado, não consegui recuperar informações.\n`,
    'plans': async () => `Quantos dias de PREMIUM você deseja adicionar?\n\n${await getListPlans()}\nUtilize apenas números, por favor.`,
    'expirePremium': () => `Seu premium expirou, faça uma recarga. Caso precise de ajuda entre em contato pelo discord: bit.ly/PlaySADiscord.`,
    'invalidOption': () => `Ops, parece que você não digitou uma opção válida.\nCertifique-se de utilizar apenas números, por favor.`,
    'premiumDaysRemaining': (date) => `Você é membro PREMIUM até ${date}.`,
    'premiumNoDaysRemaining': () => `Você é membro PREMIUM mas não consegui descobrir até quando. Se isso parece confuso, entre em contato pelo discord: bit.ly/PlaySADiscord.`,
    'selectedPremium': (name) => `Você escolheu ${name}.`,
    'selectPayMethod': (payMethods) => `Qual método de pagamento você deseja utilizar?\n\n*1*: PIX (${payMethods.PIX}).\n*2*: Cartão de crédito (${payMethods.creditCard}).\n*3*: Boleto (${payMethods.bankSlip}).\n\n*0*: Voltar.\n\nUtilize apenas números, por favor.`,
    'paymentUrl': (url) => `Para finalizar o pagamento, clique no link abaixo:\n\n${url}`,
    'whileIWait': () => `Enquanto aguardo o pagamento, você pode continuar navegando dentre as opções.`,
    'paymentSuccess': () => `Obrigado! Pagamento efetuado com sucesso!`,
    'alertPay': () => `Não se esqueça de pagar a renovação de sua assinatura com o link acima!`,
};

const steps = {};

steps.s0 = async function s0() {
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
    return {
        next: "s1",
        menssages: [allMenssages.hi(time), allMenssages.welcome(), allMenssages.talkToSomeone(), allMenssages.whatIsYourEmail()]
    };
}

steps.s1 = async function s1(chatId, body) {
    const email = body.toLowerCase().trim();
    const emailRegex = /\S+@\S+\.\S+/;
    const emailValid = emailRegex.test(email);
    if (!emailValid) {
        return {
            next: "s1",
            menssages: [allMenssages.invalidEmail(), allMenssages.whatIsYourEmail()]
        };
    } else {
        const data = await getUserByEmail(email);
        if (data) {
            const { name, id } = data;
            const firtName = name.split(' ')[0];
            alterData('name', firtName, chatId);
            alterData('userId', id, chatId);
            const number = chatId.replace('@c.us', '')
            await setWppById(id, number);
            return {
                next: "s2",
                menssages: [allMenssages.ok(firtName), allMenssages.howCanIHelp()]
            };
        } else {
            return {
                next: "s1",
                menssages: [allMenssages.inexistentEmail(), allMenssages.whatIsYourEmail()]
            };
        }
    }
}

steps.s2 = async function s2(chatId, body) {
    if (body === "1") {
        return {
            next: "s3",
            menssages: [await allMenssages.plans()]
        };
    } else if (body === "2") {
        const userId = await getBotData(chatId, "userId");
        const premium = await premiumStatus(userId);
        if (premium.premuim == 0) {
            return {
                next: "s2",
                 menssages: [allMenssages.expirePremium(), allMenssages.howCanIHelp()]
            }
        } else {
            if (premium.expired_in == null) {
                return {
                    next: "s2",
                    menssages: [allMenssages.premiumNoDaysRemaining(), allMenssages.howCanIHelp()]
                }
            } else {
                const date = reformatDate(premium.expired_in);
                if (date.alreadyPassed) {
                    return {
                    next: "s2",
                     menssages: [allMenssages.expirePremium(), allMenssages.howCanIHelp()]
                }
                } else {
                    return {
                        next: "s2",
                        menssages: [allMenssages.premiumDaysRemaining(date.date), allMenssages.howCanIHelp()]
                    }
                }
            }
        }
    } else if (body === "3") {
        const name = await getBotData(chatId, 'name');
        console.log(name);
        if (name.error) {
            return {
                next: "s2",
                menssages: [`ERROR ${name.message.code}: ${name.message.text}`, await allMenssages.plans()]
            }
        } else {
            return {
                next: "s0",
                menssages: [allMenssages.bye(name)]
            }
        }
    } else {
        return {
            next: "s2",
            menssages: [allMenssages.invalidOption(), allMenssages.howCanIHelp()]
        };
    }
}

steps.s3 = async function s3(chatId, body) {
    const plans = await getPlans();
    if (plans.error) {
        return {
            next: "s3",
            menssages: [`ERROR ${plans.message.code}: ${plans.message.text}`, await allMenssages.plans()]
        }
    }
    const isValid = plans.filter((plan) => plan.id == body);
    if (!!isValid.length) {
        const plan = isValid[0];
        alterData("selected_plan", plan.id, chatId);
        const payMethods = {
            "PIX": handleToBRL(plan.pix_price),
            "bankSlip": handleToBRL(plan.billet_price),
            "creditCard": handleToBRL(plan.price),
        }
        return {
            next: "s4",
            menssages: [allMenssages.selectedPremium(plan.name), allMenssages.selectPayMethod(payMethods)]
        };
    } else {
        return {
            next: "s3",
            menssages: [allMenssages.invalidOption(), await allMenssages.plans()]
        }
    };
}

steps.s4 = async function s4(chatId, body) {
    if (body === "0") {
        return {
            next: "s3",
            menssages: [await allMenssages.plans()]
        };
    } else {
        const selectedPaymentMethod = body == "1" ? "pix" : (body == "2" ? "boleto" : "normal");
        const selectedPlan = await getBotData(chatId, "selected_plan");
        const userId = await getBotData(chatId, "userId");

        const data = [userId, selectedPlan, selectedPaymentMethod]
        const paymentLink = await getPaymentLink(...data);
        
        if (paymentLink.error) {
            return {
                next: "s3",
                menssages: [`ERROR ${paymentLink.message.code}: ${paymentLink.message.text}`, await allMenssages.plans()]
            }
        } else {
            // const url = paymentLink.sandbox_url;
            const url = paymentLink.url;
            console.log(url.substring(0, 20)+"...");

            // ! O CÓDIGO COMENTADO ABAIXO NÃO FOI TESTADO !
            // let intervalTotalTime = 0;
            // const checkPayment = setInterval(async () => {
            //     const premium = await premiumStatus(userId);
            //     const startAt = reformatDate(premium.start_at);
            //     if(startAt.isNow) {
            //         clearInterval(checkPayment);
            //         const expiredIn = reformatDate(premium.expired_in);
            //         return {
            //             next: "s2",
            //             menssages: [allMenssages.paymentSuccess(), allMenssages.premiumDaysRemaining(expiredIn.date), await allMenssages.plans()]
            //         }
            //     } else {
            //         intervalTotalTime += 180000; //? 3 min
            //         console.log('+3 min');
            //         if (intervalTotalTime == 3600000) { //? 1 hour
            //             return {
            //                 next: "s2",
            //                 menssages: [allMenssages.alertPay(), await allMenssages.plans()]
            //             }
            //         } else if (intervalTotalTime == 21600000) { //? 6 hours
            //             return {
            //                 next: "s2",
            //                 menssages: [allMenssages.alertPay(), await allMenssages.plans()]
            //             }
            //         } else if (intervalTotalTime >= 86400000) { //? 1 day
            //             clearInterval(checkPayment);
            //             return {
            //                 next: "s2",
            //                 menssages: [allMenssages.alertPay(), await allMenssages.plans()]
            //             }
            //         }
            //     }
            // }, 9000); //? 180000 // 3 min // 9 sec

            const name = await getBotData(chatId, 'name');
            return {
                next: "s0",
                menssages: [allMenssages.paymentUrl(url), allMenssages.bye(name)]
            };
        }
    }
}

exports.steps = steps;