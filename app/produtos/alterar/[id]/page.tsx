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

interface Props {
  params: { id: string }
}

export default function AlterarProdutoPage({ params }: Props) {
  const [produto, setProduto] = useState<Produto | null>(null)
  const [descricao, setDescricao] = useState("")
  const [precoUnitario, setPrecoUnitario] = useState("")
  const [quantidadeEstoque, setQuantidadeEstoque] = useState("")
  const [categoriaId, setCategoriaId] = useState("")
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const produtoDAO = new ProdutoDAO()
  const categoriaDAO = new CategoriaDAO()
  const id = Number.parseInt(params.id)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [produtoData, categoriasData] = await Promise.all([
        produtoDAO.selecionarUm(id),
        categoriaDAO.selecionarTodos(),
      ])

      if (!produtoData) {
        toast({
          title: "Erro",
          description: "Produto não encontrado",
          variant: "destructive",
        })
        router.push("/produtos")
        return
      }

      setProduto(produtoData)
      setDescricao(produtoData.descricao)
      setPrecoUnitario(produtoData.preco_unitario.toString())
      setQuantidadeEstoque(produtoData.quantidade_estoque?.toString() || "")
      setCategoriaId(produtoData.categoria_id.toString())
      setCategorias(categoriasData)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
      setSaving(true)

      const categoria = categorias.find((c) => c.id === Number.parseInt(categoriaId))
      if (!categoria) {
        throw new Error("Categoria não encontrada")
      }

      const produtoAtualizado: Produto = {
        id,
        descricao: descricao.trim(),
        preco_unitario: Number.parseFloat(precoUnitario),
        quantidade_estoque: quantidadeEstoque ? Number.parseInt(quantidadeEstoque) : null,
        categoria_id: Number.parseInt(categoriaId),
        categoria,
      }

      await produtoDAO.alterar(produtoAtualizado)

      toast({
        title: "Sucesso",
        description: "Produto alterado com sucesso",
      })

      router.push("/produtos")
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar produto",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/produtos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Alterar Produto</h1>
        </div>

        {/* Formulário */}
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Editar Produto #{id}</CardTitle>
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
                <Button type="submit" disabled={saving} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar"}
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
