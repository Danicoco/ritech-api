import { createHash } from "crypto";
import { AES, enc } from "crypto-js";
import { configs } from "../utils/config";
import { compareSync, genSaltSync, hashSync } from "bcrypt"


export const createHash215 = (value: string) => {
  const Hash = createHash("sha512");
  return Hash.update(value, "utf-8").digest("hex");
};

export const decrytData = (message: string) => {
  const enMessage = AES.decrypt(message, String(configs.ENCRYPTIONIV));
  return enMessage.toString(enc.Utf8);
}

export const encryptData = (message: string) => {
  const bytes  = AES.encrypt(message, String(configs.ENCRYPTIONIV));
  return bytes.toString();
}

export const hashPassword = (password: string) => {
  const salt = genSaltSync(10)
  return hashSync(password, salt)
}

export const matchPassword = (password: string, hash: string) =>
  compareSync(password, hash)