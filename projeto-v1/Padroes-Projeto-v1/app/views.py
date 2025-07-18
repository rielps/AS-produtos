from django.http import HttpResponseRedirect
from django.shortcuts import render
import sys

from django.urls import reverse
from utils import helper

import sqlite3

def obter_conexao():
    ''' Conecta com o Banco de Dados e retorna a objeto de conexão'''
    conexao = sqlite3.connect('arq_soft.sqlite3')
    helper.cprint1(f'Conectou com o BD')
    return conexao


def executar_sql(sql, commit=True):
    '''Executa um comando SQL no BD (geralmente um INSERT, UPDATE ou DELETE)'''
    # obtem conexao
    conexao = obter_conexao()
    # cria um cursor() e executa o SQL informado
    ret = conexao.cursor().execute(sql)
    # verifica se eh para efetivar as modificações no BD
    if commit:
        conexao.commit()
    # retorna o resultado do metodo execute()
    return ret 


def executar_select(sql):
    '''Executa um comando SELECT no BD e retorna os registros'''
    # obtem conexao
    conexao = obter_conexao()
    # cria um cursor(), executa o SELECT informado e traz os todos os registros
    ret = conexao.cursor().execute(sql).fetchall()
    # retorna os registros do BD
    return ret 


def obter_categorias():
    '''Retorna as categorias cadastradas na aplicação'''
    # seleciona as categorias
    sql = '''
        SELECT  id, 
                descricao
        FROM Categoria 
        ORDER BY descricao
    '''
    # obtem todos os registros retornados
    return executar_select(sql)


def home(request):
    '''Exibe a pagina inicial da aplicação'''
    # define a página HTML (template) que deverá será carregada
    template = 'home.html'
    return render(request, template)


def categorias(request, acao=None, id=None):
    '''
    Método responsavel por receber todas as rotas URL do cadastro de Categorias.
    
    De acordo com a "acao" e o "id" informados, esse metodo irá:
      - 'categorias/': Exibir a pagina de listagem
      - 'categorias/incluir/': Exibir a pagina de inclusão
      - 'categorias/alterar/<:id>/': Exibir a pagina de alteração
      - 'categorias/excluir/<:id>/': Exibir a pagina de exclusão
      - 'categorias/salvar/': insere, altera ou exclui um registro
    '''

    try:
        # listar registros 
        if acao is None:
            # define o comando SQL que será executado
            sql = '''
                SELECT  id, 
                        descricao
                FROM Categoria 
                ORDER BY descricao
            '''
            
            registros = executar_select(sql)

            # define a pagina a ser carregada, adicionando os registros das tabelas 
            return render(request, 'categorias_listar.html', context={'registros': registros})
        
        # salvar registro
        elif acao == 'salvar':
            form_data = request.POST

            acao_form = form_data['acao']

            if acao_form == 'Inclusão':
                sql = f"INSERT INTO Categoria(descricao) VALUES('{form_data['descricao']}')"

            elif acao_form == 'Exclusão':
                sql = f"DELETE FROM Categoria WHERE id = {form_data['id']}"

            else:
                sql = f'''
                    UPDATE Categoria 
                    SET descricao = '{form_data['descricao']}' 
                    WHERE id = {form_data['id']}
                '''

            executar_sql(sql)

            # Sempre retornar um HttpResponseRedirect após processar dados "POST". 
            # Isso evita que os dados sejam postados 2 vezes caso usuário clicar "Voltar".
            return HttpResponseRedirect( reverse("categorias") )
        
        # inserir registro
        elif acao == 'incluir':
            return render(request, 'categorias_editar.html', {'acao': 'Inclusão'})
        
        # alterar ou excluir
        elif acao in ['alterar', 'excluir']:
            # seleciona o registro pelo id informado
            sql = f'''
                SELECT  id, 
                        descricao 
                FROM Categoria 
                WHERE id={id}
            '''

            reg = executar_select(sql)[0]
            obj = {'id': reg[0], 'descricao': reg[1]}

            acao = 'Alteração' if acao == 'alterar' else 'Exclusão'

            return render(request, 'categorias_editar.html', {'acao': acao, 'obj': obj})
        
        # acao INVALIDA
        else:
            raise Exception('Ação inválida')

    # se ocorreu algunm erro, insere a mensagem para ser exibida no contexto da página 
    except Exception as err:
        return render(request, 'home.html', context={'ERRO': err})


def produtos(request, acao=None, id=None):
    '''
    Método responsavel por receber todas as rotas URL do cadastro de Produtos.
    
    De acordo com a "acao" e o "id" informados, esse metodo irá:
      - 'produtos/': Exibir a pagina de listagem
      - 'produtos/incluir/': Exibir a pagina de inclusão
      - 'produtos/alterar/<:id>/': Exibir a pagina de alteração
      - 'produtos/excluir/<:id>/': Exibir a pagina de exclusão
      - 'produtos/salvar/': insere, altera ou exclui um registro
    '''

    try:
        # listar registros 
        if acao is None:
            # define o comando SQL que será executado
            sql = '''
                SELECT  pro.id,
                        pro.descricao, 
                        pro.preco_unitario,
                        pro.quantidade_estoque,
                        pro.categoria_id,
                        cat.descricao as 'categoria'
                        
                FROM Produto pro
                INNER JOIN Categoria cat ON cat.id = pro.categoria_id

                ORDER BY pro.descricao
            '''
            
            registros = executar_select(sql)

            # define a pagina a ser carregada, adicionando os registros das tabelas 
            return render(request, 'produtos_listar.html', context={'registros': registros})
        
        # salvar registro
        elif acao == 'salvar':
            form_data = request.POST

            acao_form = form_data['acao']

            if acao_form == 'Inclusão':
                qtd_estoque = 'NULL' if form_data['quantidade_estoque'] == '' else form_data['quantidade_estoque']

                sql = f'''
                            INSERT INTO Produto (
                                descricao, 
                                preco_unitario, 
                                quantidade_estoque, 
                                categoria_id
                            )
                            VALUES(
                                '{form_data['descricao']}', 
                                {form_data['preco_unitario']}, 
                                {qtd_estoque}, 
                                {form_data['categoria_id']}
                            );
                        '''
            
            elif acao_form == 'Exclusão':
                sql = f"DELETE FROM Produto WHERE id = {form_data['id']}"
            
            else:
                qtd_estoque = 'NULL' if form_data['quantidade_estoque'] == '' else form_data['quantidade_estoque']

                sql = f''' 
                    UPDATE Produto
                    SET descricao          = '{form_data['descricao']}', 
                        preco_unitario     = {form_data['preco_unitario']}, 
                        quantidade_estoque = {qtd_estoque}, 
                        categoria_id       = {form_data['categoria_id']}
                    WHERE id = {form_data['id']};
                '''

            executar_sql(sql)

            # Sempre retornar um HttpResponseRedirect após processar dados "POST". 
            # Isso evita que os dados sejam postados 2 vezes caso usuário clicar "Voltar".
            return HttpResponseRedirect( reverse("produtos") )
        
        # inserir registro
        elif acao == 'incluir':
            return render(request, 'produtos_editar.html', {'acao': 'Inclusão', 'categorias': obter_categorias()})
        
        # alterar ou excluir
        elif acao in ['alterar', 'excluir']:
            # seleciona o registro pelo id informado
            sql = f'''
                SELECT  pro.id,
                        pro.descricao, 
                        pro.preco_unitario,
                        pro.quantidade_estoque,
                        pro.categoria_id,
                        cat.descricao as 'categoria'
                        
                FROM Produto pro
                INNER JOIN Categoria cat ON cat.id = pro.categoria_id

                WHERE pro.id={id}    
            '''

            reg = executar_select(sql)[0]
            obj = {
                'id': reg[0], 
                'descricao': reg[1],
                'preco_unitario': reg[2],
                'quantidade_estoque': reg[3],
                'categoria_id': reg[4],
                'categoria': reg[5],
            }

            acao = 'Alteração' if acao == 'alterar' else 'Exclusão'

            return render(request, 'produtos_editar.html', 
                          {'acao': acao, 'obj': obj, 'categorias': obter_categorias()})
        
        # acao INVALIDA
        else:
            raise Exception('Ação inválida')

    # se ocorreu algunm erro, insere a mensagem para ser exibida no contexto da página 
    except Exception as err:
        return render(request, 'home.html', context={'ERRO': err})
