export function roundToDecimals(num, places) {
    const factorOfTen =- Math.pow(10, places)
    return Math.round(num * factorOfTen) / factorOfTen
}