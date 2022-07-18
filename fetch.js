require('dotenv').config();
const axios = require("axios");

const baseUrlBotInfors = process.env.BASEURL_BOTINFORS;

const handleToBRL = (n) => {
    return n.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'}).trim();
}

async function getUserByEmail(id) {
    return axios.get(`${baseUrlBotInfors}/email/${id}`).then((res) => {
        return res.data;
    }).catch((err) => {
        console.log(`error: ${err}`);
        return {
            error: true,
            message: {
                code: err.response?.status || err,
                text: err.response?.statusText || ''
            }
        }
    });
}
exports.getUserByEmail = getUserByEmail;

async function getUser(id) {
    return axios.get(`${baseUrlBotInfors}/users/${id}`).then((res) => {
        return res.data;
    }).catch(async (err) => {
        if (err.response?.status === 404) {
            const user = {
                id: id,
                step: 's0',
                name: null,
                email: null
            }
            return await axios.post(`${baseUrlBotInfors}/users/`, user).then((res) => {
                console.log(`Usuário cadastrado!!!!!\n${res.data}`);
                return res.data;
            }).catch((err) => {
                console.log(`error: ${err}`);
                return {
                    error: true,
                    message: {
                        code: err.response?.status || err,
                        text: err.response?.statusText || ''
                    }
                }
            });

        } else {
            console.log(`error: ${err}`);
            return {
                error: true,
                message: {
                    code: err.response?.status || err,
                    text: err.response?.statusText || ''
                }
            }
        }
    });
}
exports.getUser = getUser

async function setNextStep(step, id) {
    return axios.patch(`${baseUrlBotInfors}/users/${id}`, { step: step }).then((res) => {
        console.log(`data saved: step -> ${step}`);
        return true;
    }).catch((err) => {
        console.log(`error: ${err}`);
        return {
            error: true,
            message: {
                code: err.response?.status || err,
                text: err.response?.statusText || ''
            }
        }
    });
}
exports.setNextStep = setNextStep;

async function alterData(key, value, id) {
    return axios.patch(`${baseUrlBotInfors}/users/${id}`, {
        [key]: value.toString()
    }).then((res) => {
        console.log(`data saved: ${key} -> ${value}`);
    }).catch((err) => {
        console.log(`error: ${err}`);
        return {
            error: true,
            message: {
                code: err.response?.status || err,
                text: err.response?.statusText || ''
            }
        }
    });
} exports.alterData = alterData;


async function getCart(id) {
    return axios.get(`${baseUrlBotInfors}/cart/?userId=${id}`).then((res) => {
        return res.data;
    }).catch((err) => {
        if (err.response?.status === 404) {
            return []; // cart is empty
        } else {
            console.log(`error: ${err}`);
            return {
                error: true,
                message: {
                    code: err.response?.status || err,
                    text: err.response?.statusText || ''
                }
            }
        }
    });
}
exports.getCart = getCart;

async function getCartList(id) {
    const cartItens = await getCart(id);
    if (cartItens.length > 0) {
        const _listItens = Promise.all(cartItens.map(async (item) => {
            console.log("item", item);
            const productName = await getProductName(item.productId);
            const productPrice = await getProductPrice(item.productId, item.quantity);

            return `*${productName}* x${item.quantity}\n${productPrice[0]} - ${productPrice[1]}`
        }))
        // ! FIZ GAMBIARRA. EU SEI
        const listItens = (await _listItens).toString().split(',').join("\n\n");
        console.log("listItens typeof", typeof await listItens);
        console.log("listItens", await listItens);

        return `Você possue ${cartItens.length} itens.\n${await listItens}`;
    } else {
        return `Seu carrinho está vazio.`;
    }
}
exports.getCartList = getCartList;

async function addToCart(productId, id, quantity) {
    return axios.post(`${baseUrlBotInfors}/cart`, { productId: productId, userId: id, quantity: quantity }).then((res) => {
        return res.data;
    }).catch((err) => {
        console.log(`error: ${err}`);
        return {
            error: true,
            message: {
                code: err.response?.status || err,
                text: err.response?.statusText || ''
            }
        }
    });
}
exports.addToCart = addToCart;

async function removeLastItemToCart(id) {
    return axios.get(`${baseUrlBotInfors}/cart/`).then(async (res) => {
        const cartItems = res.data.filter(item => item.userId === id);
        const idLastItem = cartItems[cartItems.length - 1].id;
        const removeToCart = await axios.delete(`${baseUrlBotInfors}/cart/${idLastItem}`);
        return removeToCart;
    }).catch((err) => {
        if (err.response?.status === 404) {
            return []; // cart is empty
        } else {
            console.log(`error: ${err}`);
            return {
                error: true,
                message: {
                    code: err.response?.status || err,
                    text: err.response?.statusText || ''
                }
            }
        }
    });
}
exports.removeLastItemToCart = removeLastItemToCart;

async function dropCart(id) {
    const cartItens = await getCart(id);
    if(cartItens.length > 0) {
        Promise.all(cartItens.map(async (item) => {
            return await axios.delete(`${baseUrlBotInfors}/cart/${item.id}`).then((res) => {
                return true;
            }).catch((err) => {
                console.log(`error: ${err}`);
                return {
                    error: true,
                    message: {
                        code: err.response?.status || err,
                        text: err.response?.statusText || ''
                    }
                }
            });
        }))
    }
}
exports.dropCart = dropCart;

async function getProduct(id) {
    return axios.get(`${baseUrlBotInfors}/menu/${id}`).then((res) => {
        return res.data;
    }).catch((err) => {
        if (err.response?.status === 404) {
            return {}; // inexistent product
        } else {
            console.log(`error: ${err}`);
            return {
                error: true,
                message: {
                    code: err.response?.status || err,
                    text: err.response?.statusText || ''
                }
            }
        }
    });
}
exports.getProduct = getProduct;

async function getProductName(id) {
    const product = await getProduct(id);
    console.log("name",product.name);
    return product.name;
}
exports.getProductName = getProductName;

async function getProductPrice(id, qtd) {
    const product = await getProduct(id);
    const price = product.price;
    console.log("price",price);
    if (qtd) {
        return [price, qtd * price];
    } else {
        return price;
    }
}
exports.getProductPrice = getProductPrice;