FROM docker.io/denoland/deno:1.37.2

WORKDIR /app
USER deno

COPY . .
RUN deno cache src/main.ts

EXPOSE 8000
CMD ["run", "--allow-net", "--allow-env", "--allow-read", "src/main.ts"]
