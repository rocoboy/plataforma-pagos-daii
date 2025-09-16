import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirigir automáticamente a la documentación de Swagger
  redirect('/api/docs/swagger')
}
