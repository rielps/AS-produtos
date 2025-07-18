"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Home } from "lucide-react"
import { ProdutoDAO, type Produto } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const produtoDAO = new ProdutoDAO()

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    try {
      setLoading(true)
      const dados = await produtoDAO.selecionarTodos()
      setProdutos(dados)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const excluirProduto = async (id: number, descricao: string) => {
    if (!confirm(`Deseja realmente excluir o produto "${descricao}"?`)) {
      return
    }

    try {
      await produtoDAO.excluir(id)
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      })
      carregarProdutos()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir produto",
        variant: "destructive",
      })
    }
  }

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(preco)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Início
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Produtos</h1>
          </div>
          <Link href="/produtos/incluir">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </Link>
        </div>

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            {produtos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhum produto cadastrado</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.id}</TableCell>
                      <TableCell>{produto.descricao}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatarPreco(produto.preco_unitario)}
                      </TableCell>
                      <TableCell>
                        {produto.quantidade_estoque === null ? (
                          <Badge variant="secondary">Sem controle</Badge>
                        ) : produto.quantidade_estoque === 0 ? (
                          <Badge variant="destructive">Esgotado</Badge>
                        ) : produto.quantidade_estoque < 10 ? (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            {produto.quantidade_estoque} unidades
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {produto.quantidade_estoque} unidades
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{produto.categoria?.descricao || "Sem categoria"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/produtos/alterar/${produto.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => excluirProduto(produto.id, produto.descricao)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
