#!/bin/bash
docker-compose down --rmi all
rm -Rf docker/db/mysql_data 
