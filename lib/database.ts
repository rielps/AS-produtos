// Simulação de banco de dados em memória para demonstração
// Em produção, seria substituído por conexão real com banco

export interface Categoria {
  id: number
  descricao: string
}

export interface Produto {
  id: number
  descricao: string
  preco_unitario: number
  quantidade_estoque: number | null
  categoria_id: number
  categoria?: Categoria
}

// Dados iniciais
const categorias: Categoria[] = [
  { id: 1, descricao: "Eletrônicos" },
  { id: 2, descricao: "Roupas" },
  { id: 3, descricao: "Livros" },
  { id: 4, descricao: "Casa e Jardim" },
]

const produtos: Produto[] = [
  { id: 1, descricao: "Smartphone Samsung", preco_unitario: 1200.0, quantidade_estoque: 15, categoria_id: 1 },
  { id: 2, descricao: "Notebook Dell", preco_unitario: 2500.0, quantidade_estoque: 8, categoria_id: 1 },
  { id: 3, descricao: "Camiseta Polo", preco_unitario: 89.9, quantidade_estoque: 25, categoria_id: 2 },
  { id: 4, descricao: "Livro JavaScript", preco_unitario: 45.0, quantidade_estoque: null, categoria_id: 3 },
]

let nextCategoriaId = 5
let nextProdutoId = 5

// Singleton para conexão (simulado)
class DatabaseConnection {
  private static instance: DatabaseConnection
  private connected = false

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  public connect(): void {
    if (!this.connected) {
      console.log("Conectando ao banco de dados...")
      this.connected = true
    }
  }

  public isConnected(): boolean {
    return this.connected
  }
}

// Classe abstrata DAO (Template Method Pattern)
export abstract class DAO<T> {
  protected connection: DatabaseConnection

  constructor() {
    this.connection = DatabaseConnection.getInstance()
    this.connection.connect()
  }

  // Template Method - define o fluxo padrão
  public async executarOperacao(operacao: () => Promise<T>): Promise<T> {
    try {
      this.validarConexao()
      const resultado = await operacao()
      this.logOperacao("Operação executada com sucesso")
      return resultado
    } catch (error) {
      this.logOperacao(`Erro na operação: ${error}`)
      throw error
    }
  }

  private validarConexao(): void {
    if (!this.connection.isConnected()) {
      throw new Error("Conexão com banco não estabelecida")
    }
  }

  private logOperacao(mensagem: string): void {
    console.log(`[${new Date().toISOString()}] ${mensagem}`)
  }

  // Métodos abstratos que devem ser implementados
  abstract incluir(obj: T): Promise<void>
  abstract alterar(obj: T): Promise<void>
  abstract excluir(id: number): Promise<void>
  abstract selecionarTodos(): Promise<T[]>
  abstract selecionarUm(id: number): Promise<T | null>
}

// DAO para Categorias
export class CategoriaDAO extends DAO<Categoria> {
  async incluir(categoria: Categoria): Promise<void> {
    return this.executarOperacao(async () => {
      const novaCategoria = {
        ...categoria,
        id: nextCategoriaId++,
      }
      categorias.push(novaCategoria)
    })
  }

  async alterar(categoria: Categoria): Promise<void> {
    return this.executarOperacao(async () => {
      const index = categorias.findIndex((c) => c.id === categoria.id)
      if (index === -1) {
        throw new Error("Categoria não encontrada")
      }
      categorias[index] = categoria
    })
  }

  async excluir(id: number): Promise<void> {
    return this.executarOperacao(async () => {
      const index = categorias.findIndex((c) => c.id === id)
      if (index === -1) {
        throw new Error("Categoria não encontrada")
      }

      // Verificar se há produtos usando esta categoria
      const produtosComCategoria = produtos.filter((p) => p.categoria_id === id)
      if (produtosComCategoria.length > 0) {
        throw new Error("Não é possível excluir categoria que possui produtos")
      }

      categorias.splice(index, 1)
    })
  }

  async selecionarTodos(): Promise<Categoria[]> {
    return this.executarOperacao(async () => {
      return [...categorias].sort((a, b) => a.descricao.localeCompare(b.descricao))
    })
  }

  async selecionarUm(id: number): Promise<Categoria | null> {
    return this.executarOperacao(async () => {
      return categorias.find((c) => c.id === id) || null
    })
  }
}

// DAO para Produtos
export class ProdutoDAO extends DAO<Produto> {
  async incluir(produto: Produto): Promise<void> {
    return this.executarOperacao(async () => {
      const novoProduto = {
        ...produto,
        id: nextProdutoId++,
      }
      produtos.push(novoProduto)
    })
  }

  async alterar(produto: Produto): Promise<void> {
    return this.executarOperacao(async () => {
      const index = produtos.findIndex((p) => p.id === produto.id)
      if (index === -1) {
        throw new Error("Produto não encontrado")
      }
      produtos[index] = produto
    })
  }

  async excluir(id: number): Promise<void> {
    return this.executarOperacao(async () => {
      const index = produtos.findIndex((p) => p.id === id)
      if (index === -1) {
        throw new Error("Produto não encontrado")
      }
      produtos.splice(index, 1)
    })
  }

  async selecionarTodos(): Promise<Produto[]> {
    return this.executarOperacao(async () => {
      const categoriaDAO = new CategoriaDAO()
      const todasCategorias = await categoriaDAO.selecionarTodos()

      return produtos
        .map((produto) => ({
          ...produto,
          categoria: todasCategorias.find((c) => c.id === produto.categoria_id),
        }))
        .sort((a, b) => a.descricao.localeCompare(b.descricao))
    })
  }

  async selecionarUm(id: number): Promise<Produto | null> {
    return this.executarOperacao(async () => {
      const produto = produtos.find((p) => p.id === id)
      if (!produto) return null

      const categoriaDAO = new CategoriaDAO()
      const categoria = await categoriaDAO.selecionarUm(produto.categoria_id)

      return {
        ...produto,
        categoria: categoria || undefined,
      }
    })
  }
}
