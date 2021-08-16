# cpc-axxs-api
node js api application for AXXS

node v12.13.0

sequelize v5

hapi v18.4.0

run npm install 

Then run the index.js in the root

the axxs_api plugin default route prefix is /api/v1

working example route:

```http://localhost:3000/api/v1/foo```

Docker

For convenience, a docker-compose for adding the MySQL 5.7 DB is included.  To use, ensure your db backup is in ./docker/data/tbone_axxs.sql.gz and perform:

docker-compose up

If you want to destroy and recreate this, then perform:

docker-compose down --rmi all
rm -Rf docker/db/mysql_data
docker-compose up

The DB will be available on localhost:13306