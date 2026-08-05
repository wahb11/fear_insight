import { redirect } from 'next/navigation'

/** Legacy /products → Fear (full catalog). */
export default function ProductsPage() {
  redirect('/fear')
}
