import React from 'react';
import './App.css';

function App() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Desarrollo de Apps II - Grupo 7</h1>
          <p className="text-gray-600 font-normal mt-2">Sistema de gestión de pagos</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Color Palette Test */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Paleta de Colores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="w-full h-20 bg-blue-600 rounded-lg mb-3"></div>
              <h3 className="font-medium text-gray-900">Azul Primario</h3>
              <p className="text-sm text-gray-600">#507BD8</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="w-full h-20 bg-gray-900 rounded-lg mb-3"></div>
              <h3 className="font-medium text-gray-900">Negro/Gris Oscuro</h3>
              <p className="text-sm text-gray-600">#222222</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="w-full h-20 bg-white border-2 border-gray-300 rounded-lg mb-3"></div>
              <h3 className="font-medium text-gray-900">Blanco</h3>
              <p className="text-sm text-gray-600">#FFFFFF</p>
            </div>
          </div>
        </section>

        {/* Typography Test */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Tipografía</h2>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Título Principal (Roboto Bold)</h1>
            <h2 className="text-2xl font-medium mb-3 text-gray-900">Subtítulo (Roboto Medium)</h2>
            <h3 className="text-xl font-medium mb-3 text-gray-900">Encabezado (Roboto Medium)</h3>
            <p className="text-base font-normal mb-3 text-gray-900">
              Este es un párrafo de ejemplo usando Roboto Regular. Es el peso de fuente estándar 
              para el contenido general y texto de párrafo en nuestra plataforma.
            </p>
            <p className="text-sm font-normal text-gray-600">
              Texto secundario más pequeño para información adicional o notas.
            </p>
          </div>
        </section>

        {/* Component Test */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Componentes</h2>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-medium mb-4 text-gray-900">Botones</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Botón Primario
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors">
                Botón Secundario
              </button>
            </div>

            <h3 className="text-xl font-medium mb-4 text-gray-900">Campos de Entrada</h3>
            <div className="space-y-4 mb-6">
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Número de tarjeta"
              />
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Nombre del titular"
              />
            </div>

            <h3 className="text-xl font-medium mb-4 text-gray-900">Tarjeta de Pago</h3>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Tarjeta de Crédito</p>
                  <p className="text-lg font-medium">**** **** **** 1234</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Válida hasta</p>
                  <p className="font-medium">12/25</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Layout Test */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Layout y Espaciado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-medium mb-3 text-gray-900">Columna 1</h3>
              <p className="text-gray-600">Esta es la primera columna del grid de ejemplo.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-medium mb-3 text-gray-900">Columna 2</h3>
              <p className="text-gray-600">Esta es la segunda columna del grid de ejemplo.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="font-medium">Plataforma de Pagos DAII - 2C2025</p>
          <p className="text-sm opacity-80 mt-2">Sistema de gestión de pagos para la asignatura</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
