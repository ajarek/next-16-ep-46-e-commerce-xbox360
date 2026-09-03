import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Product } from "@/types/game-types"

type CartState = {
  items: Product[]
  addItemToCart: (item: Product) => void
  removeItemFromCart: (id: string) => void
  total: () => number
  increment: (id: string) => void
  decrement: (id: string) => void
  removeAllFromCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItemToCart: (item: Product) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: (i.quantity ?? 1) + 1 }
                  : i,
              ),
            }
          }
          return {
            items: [{ ...item, quantity: 1 }, ...state.items],
          }
        }),

      removeItemFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      removeAllFromCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((acc, item) => {
          const finalPrice =
            item.discount && item.discount > 0
              ? item.price * (1 - item.discount / 100)
              : item.price
          return acc + finalPrice * (item.quantity ?? 1)
        }, 0),

      increment: (id: string) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: (item.quantity ?? 1) + 1 }
              : item,
          ),
        })),
      decrement: (id: string) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity:
                    item.quantity && item.quantity > 1 ? item.quantity - 1 : 1,
                }
              : item,
          ),
        })),
    }),

    { name: "cartStore", storage: createJSONStorage(() => localStorage) },
  ),
)
