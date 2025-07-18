import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Tag } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <img
              src="/projeto-v1/Padroes-Projeto-v1/app/static/imagens/bach-header.png"
              alt="WebStore Header"
              className="h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">WebStore</h1>
          <p className="text-xl text-gray-600">Sistema de Gerenciamento com Padrão DAO</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/categorias">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Tag className="h-16 w-16 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Categorias</CardTitle>
                <CardDescription className="text-lg">Gerenciar categorias de produtos</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Cadastrar, editar e excluir categorias do sistema</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/produtos">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Package className="h-16 w-16 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Produtos</CardTitle>
                <CardDescription className="text-lg">Gerenciar produtos do estoque</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Cadastrar, editar e excluir produtos com suas categorias</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Design Patterns Info */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Padrões de Projeto Implementados</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-purple-200">
              <CardHeader className="text-center">
                <img
                  src="/projeto-v1/Padroes-Projeto-v1/app/static/imagens/dao.png"
                  alt="DAO Pattern"
                  className="h-16 mx-auto mb-4"
                />
                <CardTitle className="text-xl text-purple-700">DAO Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Data Access Object para separar a lógica de acesso aos dados
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200">
              <CardHeader className="text-center">
                <img
                  src="/projeto-v1/Padroes-Projeto-v1/app/static/imagens/singleton.png"
                  alt="Singleton Pattern"
                  className="h-16 mx-auto mb-4"
                />
                <CardTitle className="text-xl text-orange-700">Singleton</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Garantir uma única instância da conexão com banco de dados</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200">
              <CardHeader className="text-center">
                <img
                  src="/projeto-v1/Padroes-Projeto-v1/app/static/imagens/template_method.png"
                  alt="Template Method Pattern"
                  className="h-16 mx-auto mb-4"
                />
                <CardTitle className="text-xl text-red-700">Template Method</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Definir estrutura comum para operações CRUD</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
