# CalculadoraRedis
Microservicio de práctica, calculadora utilizando Redis





# Para implementar Redis

Antes de ejecutar el despliegue en docker ejecutar:
~~~
docker run --publish 6379:6379 --name some-redis -d redis redis-server --appendonly yes
~~~

Luego para levantar docker ejecutar:
~~~
docker build -t calculadoraredis ./
docker run --publish 3005:3001 --detach --name calculadoraredis calculadoraredis
~~~