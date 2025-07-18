"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import { CategoriaDAO, type Categoria } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface Props {
  params: { id: string }
}

export default function AlterarCategoriaPage({ params }: Props) {
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [descricao, setDescricao] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const categoriaDAO = new CategoriaDAO()
  const id = Number.parseInt(params.id)

  useEffect(() => {
    carregarCategoria()
  }, [])

  const carregarCategoria = async () => {
    try {
      const dados = await categoriaDAO.selecionarUm(id)
      if (!dados) {
        toast({
          title: "Erro",
          description: "Categoria não encontrada",
          variant: "destructive",
        })
        router.push("/categorias")
        return
      }
      setCategoria(dados)
      setDescricao(dados.descricao)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar categoria",
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

    try {
      setSaving(true)
      const categoriaAtualizada: Categoria = {
        id,
        descricao: descricao.trim(),
      }

      await categoriaDAO.alterar(categoriaAtualizada)

      toast({
        title: "Sucesso",
        description: "Categoria alterada com sucesso",
      })

      router.push("/categorias")
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar categoria",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/categorias">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Alterar Categoria</h1>
        </div>

        {/* Formulário */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Editar Categoria #{id}</CardTitle>
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
                  placeholder="Digite a descrição da categoria"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Link href="/categorias">
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
