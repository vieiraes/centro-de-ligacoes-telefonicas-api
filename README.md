# Centro de Ligações 

Uma API para gerenciar pessoas e seus números de telefone, utilizando Fastify e Prisma com um banco de dados PostgreSQL. Esta API permite criar, listar e gerenciar telefones associados a cada pessoa, além de suportar a exclusão lógica.

## Funcionalidades

- Cadastro de pessoas com informações de nome, CPF e telefones.
- Listagem de todas as pessoas com seus respectivos telefones.
- Adição de telefones a uma pessoa específica.
- Exclusão lógica de pessoas (os registros permanecem no banco, mas são marcados como deletados).
- Validação de dados de entrada usando Zod.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução para a aplicação.
- **Fastify**: Framework web rápido e eficiente para Node.js.
- **Prisma**: ORM (Object Relational Mapping) para interagir com o banco de dados PostgreSQL.
- **Zod**: Biblioteca para validação e esquema de tipos em TypeScript.

## Pré-requisitos

Antes de executar o projeto, você precisa ter:

- Node.js instalado. (Recomenda-se versão 14 ou superior)
- PostgreSQL instalado e funcionando.
- Docker (opcional, para facilitar a configuração do banco de dados)

## Instalação

1. Clone o repositório para sua máquina local:

   ```bash
   git clone <URL-DO-REPOSITORIO>
   cd <NOME-DO-REPOSITORIO>
   ```

2. Instale as dependências do projeto:

```bash
npm install
```
3. Configure o banco de dados:

-   Crie um banco de dados no PostgreSQL.
- Copie o arquivo .env.example para .env e configure suas variáveis de ambiente:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
PORT=3355
```

4. Execute as migrações para criar as tabelas no banco de dados:

```
npx prisma migrate dev --name init
```

## Uso

1. Inicie o servidor:

```
npm run dev
```

2. Acesse a API:

A API estará disponível em ```http://localhost:3355```


## Endpoints

Documentação do produto [**Collection Postman**](https://documenter.getpostman.com/view/20418848/2sAXxP9CH6)

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.
