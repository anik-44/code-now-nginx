export const encodeBase64 = (data) => {
    return Buffer.from(data, "utf-8").toString("base64");
}

export const decodeBase64 = (data) => {
    return Buffer.from(data, "base64").toString("utf-8");

}
