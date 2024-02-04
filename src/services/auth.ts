import { getToday } from "../util/getToday"

export const validatePassword = (password: string): boolean => {
     const currentPassaword = getToday().split('/').join('');
     return password === currentPassaword;
}

export const createToken = () => {
    const currentPassaword = getToday().split('/').join('');
    return `${process.env.DEFAULT_TOKEN}${currentPassaword}`
}

export const validateToken = (token: string) => {
    const currentToken = createToken();
    return token === currentToken;
}