export interface StoredCartItem {
  id: string
  title: string
  price: number
  image: string
  quantity: number
}

const CART_STORAGE_KEY = 'msc-cart'

export function getCart(): StoredCartItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function setCart(items: StoredCartItem[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error)
  }
}

export function clearCart(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(CART_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear cart from localStorage:', error)
  }
}