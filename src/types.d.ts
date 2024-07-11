/** @format */

import { Request } from "express"
import { Socket } from "socket.io"
import { number } from "./swaggerTypes"

interface DefaultAttributes {
    id?: string
    deletedAt?: string
    createdAt?: string
    updatedAt?: string
}

interface IUser extends DefaultAttributes {
    otp: string
    email: string
    lastName: string
    password?: string
    firstName: string
    phoneNumber: string
    hasMFA: boolean
    isAdmin: boolean
    meta: Record<string, string>
}

type ITradeCopierAccount = {
    name: string
    broker: "mt4" | "mt4" | "mt5" | "ctrader" | "lmax" | "fxcm_fc"
    login: string
    password: string
    server:
        | "IG-DEMO"
        | "FxPro.com-Real02"
        | "Ava-Real 1"
        | "ActivTrades-Server"
        | "Binary.com-Server"
        | "FxPro-MT5"
        | ""
        | "https://web-order.london-demo.lmax.com"
        | "https://api.lmaxtrader.com"
        | "http://www.fxcorporate.com/Hosts.jsp"
    environment: "Demo" | "Real"
    status: "0" | "1" //The account is 0=disabled, 1=enabled
    group?: string
    subscription: string
    pending: "0" | "1" //0=disabled, 1=enabled
    stop_loss: "0" | "1" //0=disabled, 1=enabled
    take_profit: "0" | "1" //0=disabled, 1=enabled
    comment: string //Custom comment that appears in MT4 terminal trade comment. Only for MT4.
    alert_email: "1" | "0" //0=disabled, 1=enabled
    alert_sms: "1" | "0" //0=disabled, 1=enabled
}

type ITradeCopierSettings = {
    id_master: string
    id_slave: string
    id_group?: string
    risk_factor_value: number
    risk_factor_type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
    order_side: -1 | 1
    max_order_size: number
    min_order_size: number
    copier_status: -1 | 0 | 1 | 2
    symbol_master: string
    symbol: string
    pending_order: 0 | 1
    stop_loss: 0 | 1 | 2
    stop_loss_fixed_value: number
    stop_loss_fixed_format: 0 | 1 | 2 | 3
    stop_loss_min_value: number
    stop_loss_min_format: 0 | 1 | 2 | 3
    stop_loss_max_value: number
    stop_loss_max_format: 0 | 1 | 2 | 3
    take_profit: 0 | 1 | 2
    take_profit_fixed_value: number
    take_profit_fixed_format: 0 | 1 | 2 | 3
    take_profit_min_value: number
    take_profit_min_format: 0 | 1 | 2 | 3
    take_profit_max_value: number
    take_profit_max_format: 0 | 1 | 2 | 3
    trailing_stop_value: number
    trailing_stop_format: 0 | 1 | 2 | 3
    max_risk_value: number
    max_risk_format: 0 | 1 | 2 | 3
    comment: string
    max_slippage: number
    "max delay": number
    force_min_round_up: number
    round_down: number
    split_order: number
    price_improvement: number
    max_position_size_a: number
    max_position_size_s: number
    max_position_size_a_m: number
    max_position_size_s_m: number
    max_open_count_a: number
    max_open_count_s: number
    max_open_count_a_m: number
    max_open_count_s_m: number
    max_daily_order_count_a: number
    max_daily_order_count_s: number
    max_daily_order_count_a_m: number
    max_daily_order_count_s_m: number
    global_stop_loss: 0 | 1
    global_stop_loss_value: number
    global_stop_loss_type: 0 | 1 | 2
    global_take_profit: 0
    1
    global_take_profit_value: number
    global_take_profit_type: 0 | 1 | 2
}

type ITradeCopierMapping = {
    id_master: string
    id_slave?: string
    id_group?: string
    symbol: string
    symbol_master: string
}

type ITradeCopierEditMapping = {
    id_master: string
    id_slave?: string
    id_group?: string
    old_symbol: string
    old_symbol_master: string
    symbol: string
    symbol_master: string
}

type ITradeCopierGlobalProtection = {
    slave_id: string
    stop_loss?: 1 | 0
    stop_loss_type?: 0 | 1 | 2
    stop_loss_value?: number
    take_profit?: 1 | 0
    take_profit_type?: 0 | 1 | 2
    take_profit_value?: number
}

type ITradeCopierFilters = {
    user_id: string
    symbol: string
    status: 1 | 0 // 1=On, 0=Off
    type: 0 | 1 //0= Whitelist, 1=Blacklist
}

interface PaginateResponse<T> {
    totalCount: number
    edges: T[]
    pageInfo: {
        endCursor: string
        startCursor: string
        hasNextPage: boolean
        hasPreviousPage: boolean
    }
}

interface IPaginator<T> {
    query?: T
    next?: string
    prev?: string
    order?: string[][]
    limit?: number
    attributes?: {
        exclude: string[]
    }
    populate?: string
}


type CreateErr = (message: string, code?: number, validations?: object) => Error

declare module "express-serve-static-core" {
    export interface Request {
        user: IUser
    }
}

type AppError = Error & {
    code: number
    name?: string
    message: string
    validations?: object | null
}

type Fix = any
