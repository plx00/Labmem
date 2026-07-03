---
title: 云服务器各类服务配置
published: 2024-08-21
updated: 2026-04-23
description: 汇总轻量服务器端口、FRP、Nginx、自动化工具、网盘、博客部署步骤与完整脚本，动态更新，用于配置备份复用。
image: /assets/bolg_cover/cloud-server.webp
tags: [服务器, frp, nginx, OpenList, ...]
category: 技术碎片
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言
>主要在云服务器上设置各种配置，主要最开始是用来内王穿透的，后来增设了许多东西，比如一键脚本这部分，后续考虑移植到Github上去



整理云服务器 FRP、Nginx、一键部署工具、私有网盘、静态博客的完整配置教程，包含端口放行、开机自启、文件同步、WebDAV 挂载等实操脚本，持续更新维护，方便配置迁移与复盘。

- 使用过的云服务器
  - 腾讯云：`124.222.30.44`（已过期）
  - 阿里云：`39.96.162.149`



- **开放的端口**
  ![1779784864279-5352c9f3-4b37-4313-88f2-db1976493eee](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625115833905.webp)



# 1. Frp

Frp（Fast Reverse Proxy）一个轻量级、开源的**内网穿透反向代理工具**。把内网服务通过**公网服务器**暴露出来，支持 TCP/UDP、HTTP/HTTPS，配置一条 YAML 即可上线。 

- **版本兼容说明**
  - FRP 版本兼容规则：客户端版本建议低于服务端 2 个小版本，连接稳定性更佳
  - 服务端 frps：选用 [v0.59.0](https://github.com/fatedier/frp/releases/tag/v0.59.0)，配置文件格式为 .toml
  - 内网客户端 frpc（NX 被控主机）：选用 [v0.57.0](https://github.com/fatedier/frp/releases/tag/v0.57.0)，配置文件格式为 .toml
  - 重要提示：下载时必须根据服务器 / 内网主机系统架构，选择对应平台的安装包
- **FRP 官方下载地址**
  -  [frp下载地址（Github）](https://github.com/fatedier/frp/releases) 
  - [frp下载地址（Gitcode）](https://gitcode.com/gh_mirrors/fr/frp/releases?utm_source=csdn_github_accelerator&isLogin=1) 

- **参考网址**
  - [FRP + NoMachine远程桌面开发指南](https://blog.csdn.net/qq_42688495/article/details/124210168) 
  - [frp内网穿透实现远程桌面控制（保姆级教程）](https://gitcode.csdn.net/65eeddae1a836825ed7a08e2.html?dp_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MzQ3MzY3LCJleHAiOjE3MjExODg3MTcsImlhdCI6MTcyMDU4MzkxNywidXNlcm5hbWUiOiJjeTEwMDEwIn0.vxRxXoxtbzW2kOb0qR94U41pFrY5rHqacq1SYvBGVMI) 
  - [frp+nomachine部署](https://www.cnblogs.com/amorfati/p/17929033.html) 
  - [FRP 内网穿透 | 实现远程访问与安全管理](https://blog.csdn.net/qq_39517117/article/details/139639530?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522172110828616800186539653%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=172110828616800186539653&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-2-139639530-null-null.142^v100^pc_search_result_base6&utm_term=frp%E5%86%85%E7%BD%91%E7%A9%BF%E9%80%8F&spm=1018.2226.3001.4187)  
- **配置好的**
  - [frp.zip(11.3 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-psryv)


## a. 文件配置

这里统一配置一下服务端与客户端的文件方便移植。

### i. 创建统一配置文件夹

先下载对应文件，这里对应的是**服务端（X86_64 Linux服务器）**| **客户端（Jetson Xavier NX Linux ）**

![image-20260625140337403](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625140337524.webp)

在压缩包所在目录打开终端，按顺序执行如下操作：`解压安装包` → `新建统一配置目录` → `创建服务分类文件夹` → `将对应程序文件迁移至对应服务目录` → `编写开机自启服务文件`

```bash
tar -xzvf frp_0.59.0_linux_amd64.tar.gz && tar -xzvf frp_0.57.0_linux_arm.tar.gz

mkdir frp && cd  frp

mkdir frps_0.59.0_linux_amd64 && mkdir frpc_0.57.0_linux_arm 

cd ..

cp ./frp_0.57.0_linux_arm/frpc ./frp_0.57.0_linux_arm/frpc.toml ./frp_0.57.0_linux_arm/LICENSE ./frp/frpc_0.57.0_linux_arm

cp ./frp_0.59.0_linux_amd64/frps ./frp_0.59.0_linux_amd64/frps.toml ./frp_0.59.0_linux_amd64/LICENSE ./frp/frps_0.59.0_linux_amd64
```

### ii. 服务端文件配置

**`压缩包目录下`**,打开终端,依次执行以下命令

#### 1. frps.toml 配置

```bash
cat <<EOL > ./frp/frps_0.59.0_linux_amd64/frps.toml
[common]
bind_port = 7000
bind_addr = 0.0.0.0

# 设置更频繁的心跳
heartbeat_interval = 10   # 每10秒发送一次心跳包
heartbeat_timeout = 30    # 30秒无心跳则认为连接断开并重新连接

# 设置允许最大并发连接数
max_pool_count = 50   # 增加并发连接池的大小，避免因大量连接时被拒绝

dashboard_port = 7500
dashboard_user = p
dashboard_pwd = p
EOL
```

#### 2. frps.sh 配置

```bash
cat <<EOL > ./frp/frps_0.59.0_linux_amd64/frps.sh
#!/bin/bash

# 创建 frps.service 文件
echo -e "\n创建 frps.service 文件\n"
cat <<EOY > ./frp/frps_0.59.0_linux_amd64/frps.service
[Unit]
Description=frps service 
After=network.target syslog.target 
Wants=network.target

[Service]
Type=simple

# 启动服务的命令
ExecStart=\$HOME/frp/frps_0.59.0_linux_amd64/frps -c \$HOME/frp/frps_0.59.0_linux_amd64/frps.toml

[Install] 

WantedBy=multi-user.target
EOY

# 复制 frps.service 到 /lib/systemd/system
echo -e "\n复制 frps.service 到 /lib/systemd/system\n"
sudo cp ./frp/frps_0.59.0_linux_amd64/frps.service /lib/systemd/system/

# 启动 frps 服务
echo -e "\n启动 frps 服务\n"
sudo systemctl start frps

# 设置服务开机自启动
echo -e "\n设置服务开机自启动\n"
sudo systemctl enable frps.service

# 查询服务状态
echo -e "\n查询服务状态\n"
sudo systemctl status frps.service

# 重新加载 systemd 守护进程
echo -e "\n重新加载 systemd 守护进程\n"
sudo systemctl daemon-reload

EOL
```

### iii. 客户端文件配置

**`压缩包目录下`**,打开终端,依次执行以下命令

#### 1. frpc.toml 配置

```bash
cat <<EOL > ./frp/frpc_0.57.0_linux_arm/frpc.toml
[common]
# 服务端 公网IP(依据实际IP更改)
server_addr = "124.222.30.44"  
# 服务端 端口
server_port = 7000   

# 设置更频繁的心跳
heartbeat_interval = 10  # 每10秒发送一次心跳包
heartbeat_timeout = 30   # 30秒无心跳则认为连接断开并重新连接

# 设置重连机制
reconnect_interval = 5   # 每5秒尝试重连一次
max_retries = 0          # 最大重试次数为0，表示无限重试

# 如果使用同一个服务器，不同客户端需要修改名称Auto_nomachine_ssh与remote_port
# 例如	[Demo_nomachine_ssh]
#			  type = "tcp"
# 			  local_ip = "127.0.0.1"
# 			  local_port = 22                                
# 			  remote_port = 2077 

[Auto_nomachine_ssh]
type = "tcp"
local_ip = "127.0.0.1"
  # 客户端 本地映射端口     
local_port = 22                                
# 服务端 远程映射端口
remote_port = 2022                             

[Auto_nomachine_tcp]
type = "tcp"
local_ip = "127.0.0.1"           
local_port = 4000                              
remote_port = 4050              

[Auto_nomachine_udp]
type = "udp"
local_ip = "127.0.0.1"              
local_port = 4000                                   
remote_port = 4295

EOL
```

#### 2. frpc.sh

```bash
cat <<EOL > ./frp/frpc_0.57.0_linux_arm/frpc.sh
#!/bin/bash

# 创建 frpc.service 文件
echo -e "\n创建 frpc.service 文件\n"
cat <<EOY > ./frp/frpc_0.57.0_linux_arm/frpc.service
[Unit]
Description=frpc service 
After=network.target syslog.target 
Wants=network.target

[Service]

Type=simple

# 启动服务的命令
ExecStart=\$HOME/frp/frpc_0.57.0_linux_arm/frpc -c \$HOME/frp/frpc_0.57.0_linux_arm/frpc.toml

Restart=always

RestartSec=30s
  
[Install] 

WantedBy=multi-user.target
EOY

# 复制 frpc.service 到 /lib/systemd/system
echo -e "\n复制 frpc.service 到 /lib/systemd/system\n"
sudo cp ./frp/frpc_0.57.0_linux_arm/frpc.service /lib/systemd/system/

# 启动 frpc 服务
echo -e "\n启动 frpc 服务\n"
sudo systemctl start frpc

# 设置服务开机自启动
echo -e "\n设置服务开机自启动\n"
sudo systemctl enable frpc.service

# 查询服务状态
echo -e "\n查询服务状态\n"
sudo systemctl status frpc.service

# 重新加载 systemd 守护进程
echo -e "\n重新加载 systemd 守护进程\n"
sudo systemctl daemon-reload

EOL
```

### iv. 将 frp目录压缩

**`压缩包目录下`**,打开终端,执行以下命令

```bash
zip -r frp.zip frp
```

## b. 服务器部署

### i. 验证

开放 `frps.toml` 文件提到的 `bind_port` 对应端口`7000/7500` 端口，类型是`TCP`

![image-20260625141426135](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625141426313.webp)

将 `frp.zip` 压缩包复制到服务器主目录并解压缩

```bash
# 主目录下,打开终端,执行以下命令
unzip -O GBK frp.zip

# 启动frps服务
./frp/frps_0.59.0_linux_amd64/frps -c ./frp/frps_0.59.0_linux_amd64/frps.toml
```

![image-20260625141645110](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625141645282.webp)

测试服务：`打开浏览器` -> `输入124.222.30.44:7500 (公网IP + 端口)` -> `输入设置的密码` -> `成功进入`

![image-20260625141658408](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625141658667.webp)

### ii. 设置开机自启动服务

```bash
# 主目录下,打开终端,执行以下命令
chmod +x ./frp/frps_0.59.0_linux_amd64/frps.sh && chmod +x ./frp/frps_0.59.0_linux_amd64/frps
./frp/frps_0.59.0_linux_amd64/frps.sh

# 设置文件夹只读
sudo chmod -R a-w ./frp
```

## c. 客户器部署

### i. 开放端口

开放`frpc.toml` 文件提到的 服务端对应端口 `4050 /4295/2022` 端口，类型分别是 `TCP/UDP/TCP`（端口号以实际为主）

![image-20260625142134122](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625142134302.webp)

### ii. 设置开机自启动服务

将 frp.zip 压缩包复制到客户端（工控机）主目录并解压缩。

```bash
# 主目录下,打开终端,执行以下命令
unzip -O GBK frp.zip
chmod +x ./frp/frpc_0.57.0_linux_arm/frpc.sh && chmod +x ./frp/frpc_0.57.0_linux_arm/frpc

./frp/frpc_0.57.0_linux_arm/frpc.sh
```

**成功运行**

![image-20260625142255521](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625142255756.webp)

```bash
# 设置文件夹只读
sudo chmod -R a-w ./frp
```

## d. 使用

随意在一台电脑上打开 `Nomachine`，必须有网络，添加 `Host（IP）：124.222.30.44`/`Port(端口): 4050` 点击连接即可

[grid]
![image-20260625142525519](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625142525722.webp)
![image-20260625142634953](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625142635401.webp)
[/grid]

## e. 优化

2024-11-26 总是网络断开后，重连速度慢，导致Nomachine远程连接彻底掉线，优化了一下服务端与客户端参数，前面的内容也一样更新了。

### i. 增加心跳包与重连机制

- **服务端**

  ```bash
  [common]
  bind_port = 7000
  bind_addr = 0.0.0.0
  
  # 设置更频繁的心跳
  heartbeat_interval = 10   # 每10秒发送一次心跳包
  heartbeat_timeout = 30    # 30秒无心跳则认为连接断开并重新连接
  
  # 设置允许最大并发连接数
  max_pool_count = 50   # 增加并发连接池的大小，避免因大量连接时被拒绝
  
  dashboard_port = 7500
  dashboard_user = p
  dashboard_pwd = p
  ```

- **客户端**

  ```bash
  [common]
  # 以实际服务器公网IP为主
  server_addr = "124.222.30.44"
  server_port = 7000
  
  # 设置更频繁的心跳
  heartbeat_interval = 10  # 每10秒发送一次心跳包
  heartbeat_timeout = 30   # 30秒无心跳则认为连接断开并重新连接
  
  # 设置重连机制
  reconnect_interval = 5   # 每5秒尝试重连一次
  max_retries = 0          # 最大重试次数为0，表示无限重试
  
  [Nano_nomachine_ssh]
  type = "tcp"
  local_ip = "127.0.0.1"
  local_port = 22
  remote_port = 2044
  
  [Nano_nomachine_tcp]
  type = "tcp"
  local_ip = "127.0.0.1"
  local_port = 4000
  remote_port = 4100
  
  [Nano_nomachine_udp]
  type = "udp"
  local_ip = "127.0.0.1"
  local_port = 4000
  remote_port = 4345
  ```

### ii. 一键配置
> 暂时未设置，想法是配置到下面的一键脚本中去，所有的已完成配置都放到`123云盘`，通过  Webdav服务进行下载，在通过设置好的脚本文件，进行一键安装配置。

# 2. Nginx

Nginx（读作“engine-x”）是一款轻量级、高性能的 HTTP 和反向代理服务器，也支持 IMAP/POP3/SMTP 等邮件代理功能。它因 事件驱动、异步非阻塞 的架构而著称，能在高并发场景下保持极低内存占用。

## a. 配置

### i. 安装并验证

```bash
# 更新系统包列表
sudo apt update -y

# 安装Nginx
sudo apt install nginx -y

# 启动Nginx服务
sudo systemctl start nginx

# 设置开机自启动
sudo systemctl enable nginx

# 验证服务是否运行（关键步骤：无界面服务器必做）
sudo systemctl status nginx
```

- 成功标志：输出中包含 `active (running)` 字样，例如：


```bash
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2025-10-22 15:31:27 CST; 2 days ago
       Docs: man:nginx(8)
    Process: 48643 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
    Process: 48655 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
   Main PID: 48656 (nginx)
      Tasks: 3 (limit: 2167)
     Memory: 3.7M
     CGroup: /system.slice/nginx.service
             ├─48656 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
             ├─48657 nginx: worker process
             └─48658 nginx: worker process

Oct 22 15:31:27 iZ2ze0t6sor8s4qwqh5gwsZ systemd[1]: Starting A high performance web server and a reverse proxy server...
Oct 22 15:31:27 iZ2ze0t6sor8s4qwqh5gwsZ systemd[1]: Started A high performance web server and a reverse proxy server.● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2025-10-22 15:31:27 CST; 2 days ago
       Docs: man:nginx(8)
    Process: 48643 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
    Process: 48655 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
   Main PID: 48656 (nginx)
      Tasks: 3 (limit: 2167)
     Memory: 3.7M
     CGroup: /system.slice/nginx.service
             ├─48656 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
             ├─48657 nginx: worker process
             └─48658 nginx: worker process

Oct 22 15:31:27 iZ2ze0t6sor8s4qwqh5gwsZ systemd[1]: Starting A high performance web server and a reverse proxy server...
Oct 22 15:31:27 iZ2ze0t6sor8s4qwqh5gwsZ systemd[1]: Started A high performance web server and a reverse proxy server.
```

### ii. 配置脚本

```bash
# 1. 创建目录（无需 sudo，直接用当前用户权限），# 同时创建 tools 和 config 子目录
mkdir -p ~/nginx_os/{tools,config}  

# 2. 设置权限（当前用户可写，其他用户可读可执行，符合 Nginx 访问需求）
chmod -R 755 ~/nginx_os  # 无需 sudo，因为目录归属是当前用户

# 3. 验证目录结构（确认目录存在且权限正确）
ls -ld ~/nginx_os/tools ~/nginx_os/config
# 正确输出示例：
# drwxr-xr-x 2 admin admin 4096 May 20 12:00 /home/admin/nginx_os/tools
# drwxr-xr-x 2 admin admin 4096 May 20 12:00 /home/admin/nginx_os/config

# 4. 配置 Nginx 指向实际路径（替换为你的真实用户目录）
sudo nano /etc/nginx/sites-available/default
# 找到 root 行，修改为：
root /home/你的用户名/nginx_os;  # 例如：root /home/admin/nginx_os;

# 5. 检查 Nginx 配置是否有误（重要！避免重启失败）
sudo nginx -t
# 若输出 "nginx: configuration file /etc/nginx/nginx.conf test is successful" 则正常

# 6. 重启 Nginx 生效
sudo systemctl restart nginx
```

### iii. 验证配置

```bash
# 在 ~/nginx_os 目录下创建一个测试文件
echo "Hello Nginx" > ~/nginx_os/test.txt


# 在服务器本地测试 Nginx 是否能访问文件
curl http://localhost/test.txt        # 若输出 "Hello Nginx" 则配置成功
# 在本地电脑浏览器访问（需服务器开放 80 端口）
http://39.96.162.149/test.txt         # 网页显示输出 "Hello Nginx" 则配置成功
```

## b. nginx_os

> 后续想的是放到 Github上去，然后通过 Cloudflare 进行托管，这样每次修改也都有迹可循。

配置一个一键安装工具或者说一键配置工具，类似于鱼香ROS那样，存在自己的服务器上，通过链接拉取脚本然后依据选择执行对应的服务。
之后可依据以下命令条调用：

```bash
source <(wget -qO- http://39.96.162.149/install)
```

### i. 整体设计

#### 1. 整体架构设计

1. **服务器端：** 通过 Nginx 提供脚本文件下载服务，存储菜单配置和功能脚本。
2. **客户端：** 用户通过一行命令拉取并运行主脚本，主脚本动态加载菜单和功能脚本（临时文件，运行后自动清理）。

#### 2. 服务器端文件

以 `ysd_info.sh` 脚本为例子

1. 创建核心文件结构
  在之前配置的 `~/nginx_os` 目录下创建以下文件：
  ```bash
  # 进入Nginx根目录
  cd ~/nginx_os
  
  # 创建主脚本（入口程序）
  touch install.py
  
  # 创建菜单配置文件
  touch config/menu.txt
  
  # 创建功能脚本目录（存放津南华大模组相关脚本）
  mkdir -p tools/huada/
  touch tools/huada/ysd_info.sh  # 你的版本信息脚本
  ```
2. 编写功能脚本（`tools/huada/ysd_info.sh`）

   将 `ysd_info.sh` 脚本内容直接保存到文件
3. 编写菜单配置（`config/menu.json`）

   定义二级菜单结构（类似 `“津南华大模组 -> 版本信息”`）
4. 编写主脚本（`install.py`）

   实现动态加载菜单、临时下载脚本、运行后清理的功能
5. 安装脚本（`install`）

#### 3. 权限与验证

```bash
# 设置文件权限。确保所有文件可被Nginx读取
chmod -R 755 ~/nginx_os

#验证文件可访问，测试主脚本是否可下载
curl http://localhost/install.py

# 测试菜单配置是否可下载
curl http://localhost/config/menu.txt
```

#### 4. 客户端使用流程

用户在目标机器上执行以下命令，即可启动一键安装工具：

```bash
# 拉取主脚本并临时运行（不保存本地文件）
source <(wget -qO- http://39.96.162.149/install)
```

交互流程示例：

```bash
====== 一键安装工具 ======

请选择模块：
1. 津南模组
2. 其他模块（预留）
输入编号：1

===== 津南模组 功能 =====
1. 版本信息
输入功能编号：1

开始执行：版本信息
[✓] 创建工厂信息文件 /etc/.ysd_factory_info
[✓] 命令 ysd_info 已安装，可通过 'ysd_info' 查看工厂信息。
```

### ii. 整体内容

示例目录结构，最新的以项目为主

- nginx_os/
  - config/ 
    - menu.json 			   # 菜单配置文件
  - tools/
    - huada/
         - module_cam_test.py    # 华大模组测试文件
         - nx_burn.sh                     # NX烧录自动化脚本
         - ysd_info.sh                     # 英赛迪出厂信息
   - install                                             # 执行的脚本
   - install.py                                        # 执行的python文件
   - test.txt                                            # 测试文件

菜单配置文件 `menu.json`，后续可以依据这个添加新功能与对应的脚本模块。

```json
{
    "level1": {
        "1": {
            "name": "津南模组",
            "desc": "设备核心功能模块"
        },
        "2": {
            "name": "其他模块（预留）",
            "desc": "扩展功能备用"
        }
    },
    "level2": {
        "1_1": {
            "name": "英赛迪日志",
            "script": "tools/huada/ysd_info.sh",
            "type": "shell",
            "desc": "英赛迪_NX镜像烧录时间日期",
            "need_sudo": false  
        },
        "1_2": {
            "name": "模组全测程",
            "script": "tools/huada/module_cam_test.py",
            "type": "python",
            "desc": "模组大/小模块与摄像头测试",
            "need_sudo": true  
        },
        "1_3": {
            "name": "NX烧录",
            "script": "tools/huada/nx_burn.sh",
            "type": "shell",
            "desc": "NX的镜像/开机动画烧录",
            "need_sudo": false  
        },
        "2_1": {
            "name": "网络测试",
            "script": "scripts/net_test.sh",
            "type": "shell",
            "desc": "测试网络连接稳定性",
            "need_sudo": false   
        }
    }
}
```

后续如果更换服务器的话可一次更改 `install/install.py` 中的 IP 地址。

```bash
# install
wget http://39.96.162.149/install.py -O /tmp/nginxinstall/install.py 2>>/dev/null 

# install.py
# ==============================================================================
# 配置常量定义
# ==============================================================================
SERVER_URL = "http://39.96.162.149"
LOG_FILE = "/tmp/oneclick_install.log"
```

并且修改对应的调用命令（因为没有买域名，所以先这样吧）

```bash
source <(wget -qO- http://39.96.162.149/install)
```

### iii. 主要功能

1. **津南模组**
   - 英赛迪日志管理：记录和查询 NX 镜像烧录的时间、版本等信息，通过ysd_info命令可直接查看。
   - 模组全测程：通过module_cam_test.py对模组大小模块及摄像头进行自动化测试，包含串口通信和摄像头预览功能。
   - NX 烧录工具：通过nx_burn.sh实现 NX 设备的镜像烧录、开机动画更换、固态盘信息管理等功能，支持不同容量固态盘配置。

2. ...
3. ...

### iv. 域名

可能以后需要使用域名，先定了一个名称。

- konakb.top/xyz/xin
  - K-ON + AKB（放学后茶时间也算“轻音偶像”）双关，top 级乐队。
- 26-06-02 
  - **阿里云 - xkon.xyz （20260602-20270603）一年期**

### v. 跳转某个网站

借助 Nginx 实现**公网 IP + 路径访问**，自动跳转至指定网址。

示例：访问 `http://39.96.162.149/yuque`，跳转至语雀库 `https://www.yuque.com/k-on123/12`。

#### 1. 配置步骤

```bash
1. 编辑 Nginx 主配置文件，运行
sudo nano /etc/nginx/sites-available/default

2. 在 http{} 区块内添加如下配置
location /yuque {
return 302 https://www.yuque.com/k-on123/12;
```

```bash
##
# You should look at the following URL's in order to grasp a solid understanding
# of Nginx configuration files in order to fully unleash the power of Nginx.
# https://www.nginx.com/resources/wiki/start/
# https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/
# https://wiki.debian.org/Nginx/DirectoryStructure
#
# In most cases, administrators will remove this file from sites-enabled/ and
# leave it as reference inside of sites-available where it will continue to be
# updated by the nginx packaging team.
#
# This file will automatically load configuration files provided by other
# applications, such as Drupal or Wordpress. These applications will be made
# available underneath a path with that package name, such as /drupal8.
#
# Please see /usr/share/doc/nginx-doc/examples/ for more detailed examples.
##

# Default server configuration
#
server {
	listen 80 default_server;
	listen [::]:80 default_server;

	# SSL configuration
	#
	# listen 443 ssl default_server;
	# listen [::]:443 ssl default_server;
	#
	# Note: You should disable gzip for SSL traffic.
	# See: https://bugs.debian.org/773332
	#
	# Read up on ssl_ciphers to ensure a secure configuration.
	# See: https://bugs.debian.org/765782
	#
	# Self signed certs generated by the ssl-cert package
	# Don't use them in a production server!
	#
	# include snippets/snakeoil.conf;

        root /home/admin/nginx_os;

	# Add index.php to the list if you are using PHP
	index index.html index.htm index.nginx-debian.html;

	server_name _;

	location / {
		# First attempt to serve request as file, then
		# as directory, then fall back to displaying a 404.
		try_files $uri $uri/ =404;
	}

  # 语雀个人文档跳转（新添加）
  location /yuque {
      return 302 https://www.yuque.com/k-on123/12;
  }  
	# pass PHP scripts to FastCGI server
	#
	#location ~ \.php$ {
	#	include snippets/fastcgi-php.conf;
	#
	#	# With php-fpm (or other unix sockets):
	#	fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
	#	# With php-cgi (or other tcp sockets):
	#	fastcgi_pass 127.0.0.1:9000;
	#}

	# deny access to .htaccess files, if Apache's document root
	# concurs with nginx's one
	#
	#location ~ /\.ht {
	#	deny all;
	#}
}


# Virtual Host configuration for example.com
#
# You can move that to a different file under sites-available/ and symlink that
# to sites-enabled/ to enable it.
#
#server {
#	listen 80;
#	listen [::]:80;
#
#	server_name example.com;
#
#	root /var/www/example.com;
#	index index.html;
#
#	location / {
#		try_files $uri $uri/ =404;
#	}
#}
```

```bash
# 保存退出，校验并生效配置，运行
sudo nginx -t
sudo systemctl restart nginx
```

#### 2. 补充说明

- 302 代表临时重定向，日常使用首选；需永久跳转可改为 301。
- 若访问报 404，执行 sudo rm /etc/nginx/sites-enabled/default 再重启 Nginx 即可。
- **这个只是记录一下方式，没啥大用。**

### vi. 配置文件同步

可能有些配置文件需要同步 所以开放了一个8080端口配合 python 文件实现同步

#### 1. 📦服务端完整代码

支持多文件映射，将以下内容保存为 `/home/admin/nginx_os/config/upload_server.py`

```python
#!/usr/bin/env python3
"""
多文件上传服务
- 监听 0.0.0.0:8080
- 仅接受 POST /upload
- 需要 token 验证
- 根据上传文件的原始文件名，保存到预设的路径
"""

import os
import cgi
from http.server import HTTPServer, BaseHTTPRequestHandler

# ========== 配置区域 ==========
TOKEN = "your_simple_token_2026"   # 请修改为复杂字符串，与客户端一致

# 文件名 -> 服务器保存路径 的映射表
FILE_MAP = {
    "connections.conf": "/home/admin/nginx_os/tools/ssh/connections.conf",
    # 以后需要同步新文件，只需在这里添加一行
}
# ==============================

class UploadHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 只处理 /upload 路径
        if self.path != '/upload':
            self.send_response(404)
            self.end_headers()
            return

        # 解析 multipart/form-data
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD': 'POST',
                     'CONTENT_TYPE': self.headers.get('Content-Type', '')}
        )

        # 验证 token
        token = form.getvalue('token')
        if token != TOKEN:
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b'Invalid token')
            return

        # 检查是否包含文件字段
        if 'file' not in form:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing file field')
            return

        file_item = form['file']
        original_filename = os.path.basename(file_item.filename)  # 只取文件名，防路径穿越

        # 查找映射表
        if original_filename not in FILE_MAP:
            self.send_response(403)
            self.end_headers()
            self.wfile.write(f'Filename "{original_filename}" not allowed'.encode())
            return

        target_path = FILE_MAP[original_filename]

        # 确保目标目录存在
        os.makedirs(os.path.dirname(target_path), exist_ok=True)

        # 保存文件
        try:
            with open(target_path, 'wb') as f:
                f.write(file_item.file.read())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f'Write error: {str(e)}'.encode())
            return

        # 成功响应
        self.send_response(200)
        self.end_headers()
        self.wfile.write(f'Upload success -> {target_path}'.encode())

    def log_message(self, format, *args):
        # 关闭访问日志（减少噪音）
        pass

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8080), UploadHandler)
    print("Multi-file upload server running on port 8080...")
    print(f"Allowed files: {', '.join(FILE_MAP.keys())}")
    server.serve_forever()
```

#### 2. 🚀 启动并保活服务

- 方法一：手动启动（测试用）

  ```bash
  cd /home/admin/nginx_os
  python3 upload_server.py
  ```

- 方法二：后台运行（使用 nohup）

  ```bash
  nohup python3 /home/admin/nginx_os/upload_server.py > /tmp/upload_server.log 2>&1 &
  ```

- 方法三：systemd 服务（推荐，开机自启）
  
  创建 `/etc/systemd/system/upload-server.service`
  
  ```bash
  [Unit]
  Description=Multi-file Upload Server
  After=network.target
  
  [Service]
  ExecStart=/usr/bin/python3 /home/admin/nginx_os/upload_server.py
  Restart=always
  User=admin
  WorkingDirectory=/home/admin/nginx_os
  
  [Install]
  WantedBy=multi-user.target
  ```
  
  最后
  
  ```bash
  sudo systemctl daemon-reload
  sudo systemctl enable upload-server
  sudo systemctl start upload-server
  ```

开放防火墙端口（如果云安全组也需放行）

```bash
sudo ufw allow 8080/tcp
```

![image-20260625150927578](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625150927778.webp)

#### 3. 🔧客户端使用案例

1. 案例 A：SSH 管理器同步 connections.conf

   在你的 ssh_manager.sh 中修改同步函数（使用 curl 上传到新服务）：

   ```bash
   # 远程同步配置（HTTP 上传方式）
   REMOTE_CONFIG_URL="http://39.96.162.149/ssh_configs/connections.conf"
   UPLOAD_URL="http://39.96.162.149:8080/upload"
   UPLOAD_TOKEN="your_simple_token_2026"
   
   sync_download() {
       wget -q -O "$CONFIG_FILE" "$REMOTE_CONFIG_URL" 2>/dev/null && \
           echo -e "${GREEN}✓ 已同步服务器最新配置${NC}" || \
           echo -e "${YELLOW}⚠ 使用本地配置${NC}"
   }
   
   sync_upload() {
       if [ -f "$CONFIG_FILE" ]; then
           curl -s -F "token=$UPLOAD_TOKEN" -F "file=@$CONFIG_FILE" "$UPLOAD_URL" && \
               echo -e "${GREEN}✓ 配置已自动同步到服务器${NC}" || \
               echo -e "${YELLOW}⚠ 同步失败${NC}"
       fi
   }
   ```

   注意：下载仍然通过 Nginx 提供的静态文件路径 `http://39.96.162.149/ssh_configs/connections.conf`，所以你需要确保 Nginx 能访问该目录（之前已经配置过 `root /home/admin/nginx_os`）。

2. 案例 B：其他脚本（例如同步 `settings.ini`）

   假设你有一个脚本需要同步` /etc/myapp/settings.ini`，你可以：

   在服务器的 FILE_MAP 中添加一行：

   `"settings.ini": "/home/admin/nginx_os/ssh_configs/settings.ini"`,

   在客户端的任意 bash 脚本中执行：

   `curl -F "token=your_simple_token_2026" -F "file=@/etc/myapp/settings.ini" http://39.96.162.149:8080/upload`

   如果要下载该文件，同样通过 Nginx 访问：

   `wget http://39.96.162.149/ssh_configs/settings.ini -O /etc/myapp/settings.ini`

# 3. Blog

- 看到了一个有意思的个人博客私有化部署

  - [不用服务器，无需备案，零成本搭建一个自己的个人博客](https://www.bilibili.com/video/BV1hX9XBKEhm/?spm_id_from=888.80997.embed_other.whitelist&t=109&bvid=BV1hX9XBKEhm&vd_source=44174cb9e1b481198e2339e3ef279079) 
  - [Firefly 博客搭建教程 - Fqzlr](http://fqzlr.com/posts/firefly-set/windows-firefly/) 
  - [ip优选 - Fqzlr](http://fqzlr.com/posts/blog/ip/) 
  - [GitHub - CuteLeaf/Firefly: 流萤，清新美观的 Astro 静态博客主题模板 ](https://github.com/CuteLeaf/Firefly) 
  - [Hyde - 人心中的成见是一座大山](https://seasir.top/) 
  - [Firefly 本地管理器 - 星遐蝶梦](https://blog.casto.top/posts/firefly-config-manager/) 
- [书签目录](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625151750590.html)

# 4. openlist/联通云盘

- [飞牛私有云论坛 fnOS](https://club.fnnas.com/forum.php?mod=viewthread&tid=39680&extra=page%3D3) 
- [从 AList 到 OpenList：文件列表新选择 + 联通云盘接入指南 - 如有乐享](https://51.ruyo.net/18956.html) 
- [ruyo | 如有乐享 ： 从 AList 到 OpenList：文件列表新选择 + 联通云盘接入指南 – 好文收藏](https://shoucang.zyzhang.com/ruyo-%e5%a6%82%e6%9c%89%e4%b9%90%e4%ba%ab-%ef%bc%9a-%e4%bb%8e-alist-%e5%88%b0-openlist%ef%bc%9a%e6%96%87%e4%bb%b6%e5%88%97%e8%a1%a8%e6%96%b0%e9%80%89%e6%8b%a9-%e8%81%94%e9%80%9a%e4%ba%91%e7%9b%98/#site-content) 
- [GitHub - OpenListTeam/OpenList: A new AList Fork to Anti Trust Crisis](https://github.com/OpenListTeam/OpenList) 

服务器需开放端口 **`5244`**

```bash
39.96.162.149:5244
```

在云服务商控制台操作（阿里云、腾讯云、华为云等）：

|  配置项  |                          填写内容                           |
| :------: | :---------------------------------------------------------: |
| 规则方向 |                      入方向（Inbound）                      |
| 协议类型 |                             TCP                             |
| 端口范围 |                            5244                             |
| 授权对象 | `0.0.0.0/0`（允许所有IP访问）或填写你本地的公网IP（更安全） |
|   策略   |                        允许（Allow）                        |

**刷新令牌与恢复令牌**

```java
{STATUS: "200", MSG: "服务调用成功！", LOGID: "7ad1de2ecbd4408dbdf3a7a2e4c3d92d",…}
LOGID
: 
"7ad1de2ecbd4408dbdf3a7a2e4c3d92d"
MSG
: 
"服务调用成功！"
RSP
: 
{RSP_CODE: "0000", RSP_DESC: "成功", DATA: {
    access_token: "c23de967-63b4-4c7b-8541-8df010fbeb53",…}}
DATA
: 
{access_token: "c23de967-63b4-4c7b-8541-8df010fbeb53",…}
access_token
: 
"c23de967-63b4-4c7b-8541-8df010fbeb53"
expires_in
: 
604799
isSetIdInfo
: 
"1"
is_new_register
: 
"0"
refresh_token
: 
"8d8f9623-4511-4ac1-b7ad-87e8458fedaa"
RSP_CODE
: 
"0000"
RSP_DESC
: 
"成功"
STATUS
: 
"200"
```

![image-20260625152523005](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625152523298.webp)

## a. 部署

博客长图片，防止原文章失效

![image-20260625152708139](https://vip.123pan.cn/1831996731/a_PicBed/devbits/cloud-server/20260625152709990.webp)

## b. 挂载

设置的并不顺利，暂未使用，若需要查询相关内容，可以到语雀的这部分文档去查看。





----



























