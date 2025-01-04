# idea连接docker
## 1. docker配置
### 1.1. 修改docker.service文件
```shell
vim /usr/lib/systemd/system/docker.service
```
### 1.2. 需要修改的部分：
```shell
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
```
修改为 ->
```shell
ExecStart=/usr/bin/dockerd -H tcp://0.0.0.0:2375 -H unix://var/run/docker.sock
```
### 1.3. 配置生效并重启docker
```shell
systemctl daemon-reload
systemctl restart docker
```
### 1.4. 开放2375端口
```shell
firewall-cmd --zone=public --add-port=2375/tcp --permanent
firewall-cmd --reload
```
## 2. idea配置
### 2.1 搜索安装docker插件
![search-docker.png](static/idea-connects-docker/search-docker.png)
### 2.2. 配置docker连接ip
![docker-ip.png](static/idea-connects-docker/docker-ip.png)
### 2.3. 查看docker镜像
![check-image.png](static/idea-connects-docker/check-image.png)
## 3. 配置SSL
### 3.1. 创建一个目录用于存储生成的证书和秘钥
```shell
mkdir /docker-ca && cd /docker-ca
```
### 3.2. 使用openssl创建CA证书私钥，期间需要输入两次密码，生成文件为ca-key.pem
```shell
openssl genrsa -aes256 -out ca-key.pem 4096
```
### 3.3. 根据私钥创建CA证书，期间需要输入上一步设置的私钥密码，然后依次输入国家是 CN，省例如是Guangdong、市Guangzhou、组织名称、组织单位、姓名或服务器名、邮件地址，都可以随意填写，生成文件为ca.pem（注意证书有效期）
```shell
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem
```
### 3.4. 创建服务端私钥，生成文件为server-key.pem
```shell
openssl genrsa -out server-key.pem 4096
```
### 3.5. 创建服务端证书签名请求文件，用于CA证书给服务端证书签名。IP需要换成自己服务器的IP地址，或者域名都可以。生成文件server.csr
```shell
openssl req -subj "/CN=你的服务器ip" -sha256 -new -key server-key.pem -out server.csr
```
### 3.6. 配置白名单，用多个用逗号隔开，例如： IP:192.168.0.1,IP:0.0.0.0，这里需要注意，虽然0.0.0.0可以匹配任意，但是仍然需要配置你的服务器IP，如果省略会造成错误
```shell
echo subjectAltName = IP:你的服务器ip,IP:0.0.0.0 >> extfile.cnf
```
### 3.7. 将Docker守护程序密钥的扩展使用属性设置为仅用于服务器身份验证
```shell
echo extendedKeyUsage = serverAuth >> extfile.cnf
```
### 3.8. 创建CA证书签名好的服务端证书，期间需要输入CA证书私钥密码，生成文件为server-cert.pem
```shell
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem \-CAcreateserial -out server-cert.pem -extfile extfile.cnf
```
### 3.9. 创建客户端私钥，生成文件为key.pem
```shell
openssl genrsa -out key.pem 4096
```
### 3.10. 创建客户端证书签名请求文件，用于CA证书给客户证书签名，生成文件client.csr
```shell
openssl req -subj '/CN=client' -new -key key.pem -out client.csr
```
### 3.11. 要使密钥适合客户端身份验证，请创建扩展配置文件
```shell
echo extendedKeyUsage = clientAuth >> extfile.cnf
```
### 3.12. 创建CA证书签名好的客户端证书，期间需要输入CA证书私钥密码，生成文件为cert.pem
```shell
openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem \-CAcreateserial -out cert.pem -extfile extfile.cnf
```
### 3.13. 删除不需要的文件，两个证书签名请求
```shell
rm -v client.csr server.csr
```
### 3.14. 修改证书为只读权限保证证书安全
```shell
chmod -v 0400 ca-key.pem key.pem server-key.pem
chmod -v 0444 ca.pem server-cert.pem cert.pem
```
### 3.15. 归集服务器证书
```shell
cp server-*.pem  /etc/docker/ && cp ca.pem /etc/docker/
```
### 3.16. 最终生成文件如下，有了它们我们就可以进行基于TLS的安全访问了
1. ca.pem CA证书
2. ca-key.pem CA证书私钥
3. server-cert.pem 服务端证书
4. server-key.pem 服务端证书私钥
5. cert.pem 客户端证书
6. key.pem 客户端证书私钥

### 3.17. 配置Docker支持TLS
```shell
vi /usr/lib/systemd/system/docker.service
```
### 3.18. 修改以ExecStart开头的配置，开启TLS认证，并配置好CA证书、服务端证书和服务端私钥
```shell
ExecStart=/usr/bin/dockerd --tlsverify --tlscacert=/etc/docker/ca.pem --tlscert=/etc/docker/server-cert.pem --tlskey=/etc/docker/server-key.pem -H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock
```
### 3.19. 重新加载让配置生效
```shell
systemctl daemon-reload && systemctl restart docker
```
### 3.20. 重启docker
```shell
service docker restart
```
### 3.21. 在客户端测试连接
保存相关客户端的pem文件到本地
![ssl-pem.png](static/idea-connects-docker/ssl-pem.png)
IDEA->Preferences->Bulild, Execution,Deployment->Docker->TCP socket
![idea-con-docker.png](static/idea-connects-docker/idea-con-docker.png)
到此，Docker对外开放2375端口再也不怕被攻击了！
