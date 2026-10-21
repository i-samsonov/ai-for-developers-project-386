import { Button } from '@/components/ui/button'

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg space-y-5 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Календарь звонков</h1>
        <p className="text-muted-foreground">
          Здесь появится сервис для выбора времени и бронирования звонков.
        </p>
        <Button disabled>Забронировать звонок</Button>
      </div>
    </main>
  )
}

export default App
