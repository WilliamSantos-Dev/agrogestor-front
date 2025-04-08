import axios from "axios";
import { Group } from "../models/group";
import { Member } from "../models/member";
import { ProductPrice } from "../models/productPrice";
import { mapToSale, Sale } from "../models/sale";
import { NewSale } from "../pages/(protected)/pages/sales/new";
import { ProductionLogPayload } from "../pages/(protected)/pages/production/new";
import { ProductionLog } from "../models/productionLog";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export async function login(username: string, password: string) {
  return (await api.post("auth/login", { username, password })).data
    .access_token as string;
}

export async function getMembers(token: string) {
  return (
    await api.get("members", { headers: { Authorization: `Bearer ${token}` } })
  ).data as (Member & { group: Group })[];
}

export async function getGroups(token: string) {
  return (
    await api.get("groups", {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data as Group[];
}

export async function getSales(
  token: string,
  params: {
    memberId?: number;
    groupId?: number;
    startDate?: Date;
    endDate?: Date;
  },
) {
  return (
    await api.get("sales", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
  ).data.map((e: Sale) => mapToSale(e)) as Sale[];
}

export async function getProducts(token: string) {
  return (
    await api.get("products", { headers: { Authorization: `Bearer ${token}` } })
  ).data as string[];
}

export async function getProductPrice(
  token: string,
  params: { product: string; date: Date; memberName: string },
) {
  return (
    await api.get("prices", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
  ).data as ProductPrice;
}

export async function postSale(token: string, sale: NewSale) {
  return api.post("sales", sale, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getProductionLogs(
  token: string,
  params: {
    memberId?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<ProductionLog[]> {
  return (
    await api.get("productionLog", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        ...params,
        startDate: params.startDate?.toISOString(),
        endDate: params.endDate?.toISOString(),
      },
    })
  ).data;
}


export async function postProductionLog(token: string, log: ProductionLogPayload) {
  return api.post("productionLog", log, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteProductionLog(token: string, id: number) {
  return api.delete(`productionLog/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
