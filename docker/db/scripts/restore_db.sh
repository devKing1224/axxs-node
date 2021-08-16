 gunzip -c /opt/db_data/tbone_axxs.sql.gz | mysql -u root -p'supersecretpass'
 mysqlcheck -o tbone_axxs -u root -p'supersecretpass'