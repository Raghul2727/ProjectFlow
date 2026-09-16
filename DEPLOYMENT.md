# ProjectFlow free full-stack deployment

ProjectFlow uses this deployment layout:

- React/Vite frontend: GitHub Pages
- Spring Boot API: Koyeb free Web Service
- PostgreSQL database: Neon free plan

## 1. Create the PostgreSQL database

Create a Neon project and copy its JDBC connection details. The JDBC URL must
start with `jdbc:postgresql://` and should include `sslmode=require`.

## 2. Deploy the API on Koyeb

Create a Web Service from this GitHub repository with these settings:

- Builder: Dockerfile
- Work directory: `backend`
- Dockerfile: `backend/Dockerfile`
- Port: `8080`
- Health check path: `/api/health`
- Instance: Free

Configure these environment variables:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

## 3. Deploy the frontend on GitHub Pages

In the repository settings:

1. Add an Actions variable named `VITE_API_URL` containing the Koyeb service
   URL, without a trailing slash.
2. Under **Pages**, select **GitHub Actions** as the source.
3. Run the `Deploy ProjectFlow frontend` workflow.

The frontend will be available at:

`https://raghul2727.github.io/ProjectFlow/`

## Local development

Start PostgreSQL and set the same three Spring datasource variables before
running the backend. The frontend defaults to `http://localhost:8080` when
`VITE_API_URL` is not set.
