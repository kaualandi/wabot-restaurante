require('dotenv').config();
const axios = require("axios");

const baseUrlBotInfors = process.env.BASEURL_BOTINFORS;

const handleToBRL = (n) => {
    return n.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }).trim();
}

function handleError(error) {
    console.log("ERROR 	===>", error);
    return {
        error: true,
        message: {
            code: error.response?.status || error,
            text: error.response?.statusText || ''
        }
    }
}

async function getUserByEmail(id) {
    return axios.get(`${baseUrlBotInfors}/email/${id}`).then((res) => {
        return res.data;
    }).catch((err) => {
        return handleError(err);
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
                return res.data;
            }).catch((err) => {
                return handleError(err);
            });

        } else {
            return handleError(err);
        }
    });
}
exports.getUser = getUser

async function setNextStep(step, id) {
    return axios.patch(`${baseUrlBotInfors}/users/${id}`, { step: step }).then((res) => {
        console.log(`data saved: step -> ${step}`);
        return true;
    }).catch((err) => {
        return handleError(err);
    });
}
exports.setNextStep = setNextStep;

async function alterData(key, value, id) {
    return axios.patch(`${baseUrlBotInfors}/users/${id}`, {
        [key]: value.toString()
    }).then((res) => {
        console.log(`data saved: ${key} -> ${value}`);
    }).catch((err) => {
        return handleError(err);
    });
} exports.alterData = alterData;


async function getCart(id) {
    return axios.get(`${baseUrlBotInfors}/cart/?userId=${id}`).then((res) => {
        return res.data;
    }).catch((err) => {
        if (err.response?.status === 404) {
            return []; // cart is empty
        } else {
            return handleError(err);
        }
    });
}
exports.getCart = getCart;

async function getCartList(id) {
    const cartItens = await getCart(id);
    if (cartItens.length > 0) {
        const _listItens = Promise.all(cartItens.map(async (item) => {
            const productName = await getProductName(item.productId);
            const productPrice = await getProductPrice(item.productId, item.quantity);

            return `*${productName}* x${item.quantity}\n${productPrice[0]} - ${productPrice[1]}`
        }))
        // ! FIZ GAMBIARRA. EU SEI
        const listItens = (await _listItens).toString().split(',').join("\n\n");

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
        return handleError(err);
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
            return handleError(err);
        }
    });
}
exports.removeLastItemToCart = removeLastItemToCart;

async function dropCart(id) {
    const cartItens = await getCart(id);
    if (cartItens.length > 0) {
        Promise.all(cartItens.map(async (item) => {
            return await axios.delete(`${baseUrlBotInfors}/cart/${item.id}`).then((res) => {
                return true;
            }).catch((err) => {
                return handleError(err);
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
            return handleError(err);
        }
    });
}
exports.getProduct = getProduct;

async function getProductName(id) {
    const product = await getProduct(id);
    return product.name;
}
exports.getProductName = getProductName;

async function getProductPrice(id, qtd) {
    const product = await getProduct(id);
    const price = product.price;
    if (qtd) {
        return [price, qtd * price];
    } else {
        return price;
    }
}
exports.getProductPrice = getProductPrice;

async function getAddress(id) {
    const user = await getUser(id);

    return axios.get(`${baseUrlBotInfors}/email/${user.email}`).then((res) => {
        return res.data.address;
    }).catch((err) => {
        if (err.response?.status === 404) {
            return false; // inexistent email
        } else {
            return handleError(err);
        }
    });
}
exports.getAddress = getAddress;

async function finishCart(id) {
    const cart = await getCart(id);

    const request = {
        userId: id,
        cart
    }

    return axios.post(`${baseUrlBotInfors}/request/`, request).then((res) => {
        return true;
    }).catch((err) => {
        return handleError(err);
    });
}
exports.finishCart = finishCart;