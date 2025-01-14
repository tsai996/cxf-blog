# Docker安装mysql
## 1. 搜索mysql镜像
```shell
docker search mysql
```
## 2. 拉取mysql镜像
```shell
docker pull mysql:5.7
```
## 3. 创建容器，设置端口映射、目录映射
```shell
docker run -id 
-p 3306:3306 
--name=cxf_mysql  
--restart always 
--net net-test 
-e MYSQL_ROOT_PASSWORD="#123456" 
mysql
```
### 数据映射
在/root目录下创建mysql目录用于存储mysql数据信息
```shell
mkdir ~/mysql
cd ~/mysql
docker run -id 
-p 3306:3306 
--name=c_mysql 
-v $PWD/conf:/etc/mysql/conf.d 
-v $PWD/logs:/logs 
-v $PWD/data:/var/lib/mysql 
-e MYSQL_ROOT_PASSWORD=root 
mysql:5.7
```
参数说明：
- -p 3307:3306：将容器的 3306 端口映射到宿主机的 3307 端口。
- -v $PWD/conf:/etc/mysql/conf.d：将主机当前目录下的 conf/my.cnf 挂载到容器的 /etc/mysql/my.cnf。配置目录
- -v $PWD/logs:/logs：将主机当前目录下的 logs 目录挂载到容器的 /logs。日志目录
- -v $PWD/data:/var/lib/mysql ：将主机当前目录下的data目录挂载到容器的 /var/lib/mysql 。数据目录
- -e MYSQL_ROOT_PASSWORD=root：初始化 root 用户的密码。

3.5.开放3306端口
```shell
firewall-cmd --zone=public --add-port=3306/tcp --permanent
```
命令含义：
--zone #作用域
--add-port=1935/tcp  #添加端口，格式为：端口/通讯协议
--permanent #永久生效，没有此参数重启后失效

4.进入容器，操作mysql
```shell
docker exec -it c_mysql /bin/bash
``` 