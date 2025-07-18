"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { ProdutoDAO, CategoriaDAO, type Produto, type Categoria } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

export default function IncluirProdutoPage() {
  const [descricao, setDescricao] = useState("")
  const [precoUnitario, setPrecoUnitario] = useState("")
  const [quantidadeEstoque, setQuantidadeEstoque] = useState("")
  const [categoriaId, setCategoriaId] = useState("")
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const produtoDAO = new ProdutoDAO()
  const categoriaDAO = new CategoriaDAO()

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    try {
      const dados = await categoriaDAO.selecionarTodos()
      setCategorias(dados)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      })
    } finally {
      setLoadingCategorias(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!descricao.trim()) {
      toast({
        title: "Erro",
        description: "Descrição é obrigatória",
        variant: "destructive",
      })
      return
    }

    if (!precoUnitario || Number.parseFloat(precoUnitario) <= 0) {
      toast({
        title: "Erro",
        description: "Preço unitário deve ser maior que zero",
        variant: "destructive",
      })
      return
    }

    if (!categoriaId) {
      toast({
        title: "Erro",
        description: "Categoria é obrigatória",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const categoria = categorias.find((c) => c.id === Number.parseInt(categoriaId))
      if (!categoria) {
        throw new Error("Categoria não encontrada")
      }

      const novoProduto: Produto = {
        id: 0, // Será definido pelo DAO
        descricao: descricao.trim(),
        preco_unitario: Number.parseFloat(precoUnitario),
        quantidade_estoque: quantidadeEstoque ? Number.parseInt(quantidadeEstoque) : null,
        categoria_id: Number.parseInt(categoriaId),
        categoria,
      }

      await produtoDAO.incluir(novoProduto)

      toast({
        title: "Sucesso",
        description: "Produto incluído com sucesso",
      })

      router.push("/produtos")
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao incluir produto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingCategorias) {
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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/produtos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Incluir Produto</h1>
        </div>

        {/* Formulário */}
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Novo Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Digite a descrição do produto"
                  required
                />
              </div>

              <div>
                <Label htmlFor="preco">Preço Unitário</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={precoUnitario}
                  onChange={(e) => setPrecoUnitario(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="estoque">Quantidade em Estoque</Label>
                <Input
                  id="estoque"
                  type="number"
                  min="0"
                  value={quantidadeEstoque}
                  onChange={(e) => setQuantidadeEstoque(e.target.value)}
                  placeholder="Deixe vazio para sem controle de estoque"
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id.toString()}>
                        {categoria.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
                <Link href="/produtos">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
