# My Render Mongo Project

Este projeto é uma aplicação que utiliza o MongoDB como banco de dados e é estruturada em TypeScript. Abaixo estão as informações sobre os principais arquivos e suas funcionalidades.

## Estrutura do Projeto

- **src/index.ts**: Ponto de entrada da aplicação. Inicializa o servidor e configura as rotas.
- **src/controllers/index.ts**: Exporta a classe `IndexController`, que gerencia as requisições relacionadas aos usuários.
- **src/models/user.model.ts**: Define o modelo `User`, representando a estrutura dos dados do usuário no MongoDB.
- **src/routes/index.ts**: Exporta a função `setRoutes`, que configura as rotas da aplicação.
- **src/services/db.service.ts**: Exporta a classe `DBService`, que interage com o banco de dados MongoDB.
- **src/config/default.ts**: Contém as configurações padrão da aplicação, como a URL do banco de dados.
- **scripts/start.sh**: Script de shell que inicia a aplicação.
- **.env.example**: Exemplo de variáveis de ambiente necessárias para a aplicação.
- **package.json**: Configuração do npm, listando dependências e scripts.
- **tsconfig.json**: Configuração do TypeScript.
- **Dockerfile**: Instruções para construir a imagem Docker da aplicação.
- **render.yaml**: Configuração para implantar a aplicação na plataforma Render.

## Como Executar

1. Clone o repositório:
   ```
   git clone <url-do-repositorio>
   cd my-render-mongo-project
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente copiando o arquivo `.env.example` para `.env` e ajustando os valores conforme necessário.

4. Inicie a aplicação:
   ```
   ./scripts/start.sh
   ```

## Contribuição

Sinta-se à vontade para contribuir com melhorias ou correções. Abra um pull request ou crie uma issue para discutir mudanças.

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.