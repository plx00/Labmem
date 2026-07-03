---
title: Ubuntu 镜像
published: 2026-04-08
updated: 2026-04-08
description: 各种 Ubuntu 镜像下载地址
image: /assets/bolg_cover/ubuntu-mirror.webp
tags: [Ubuntu, 镜像, 多平台]
category: ubuntu
draft: false
author: larry
password: ""
passwordHint: ""
---



# 国内镜像站

# 1. Amd

|    镜像站     |                         地址                          |         特点         |
| :-----------: | :---------------------------------------------------: | :------------------: |
| 清华大学 TUNA | https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/ | 速度极快，教育网首选 |
|  中科大 USTC  |     https://mirrors.ustc.edu.cn/ubuntu-releases/      |    稳定，同步及时    |
|    阿里云     |      https://mirrors.aliyun.com/ubuntu-releases/      | 商业带宽，全国覆盖好 |
|    腾讯云     |  https://mirrors.cloud.tencent.com/ubuntu-releases/   |    华南地区速度快    |
|    华为云     |     https://repo.huaweicloud.com/ubuntu-releases/     |      企业级带宽      |
|   网易 163    |       https://mirrors.163.com/ubuntu-releases/        |    老牌镜像，稳定    |

# 2. Arm

|  [Ubuntu for ARM ](https://ubuntu.com/download/server/arm)   |
| :----------------------------------------------------------: |
| **[Index of /releases](https://cdimage.ubuntu.com/releases/?_gl=1*1v8o5uc*_gcl_au*MTIxOTQ5MDg1MC4xNzczOTczMDc1)** |
| **[Install Ubuntu on the Raspberry Pi](https://canonical-ubuntu-hardware-support.readthedocs-hosted.com/boards/how-to/ubuntu_supported/raspberry-pi/)** |

# 3. 引导修复盘

[启动修复磁盘 | 一个包含引导修复工具的救援磁盘](https://sourceforge.net/projects/boot-repair-cd/files/boot-repair-disk-64bit.iso)



# 4. SSH

查 SSH 是否开启，最直接用：

```bash
systemctl status ssh
```

## a. 查看服务状态

```bash
sudo systemctl status ssh
```

- 看到：**`active (running)`** → 已开启并运行
- 看到：**`inactive (dead)`** → 已安装但未启动
- 提示：**`Unit ssh.service could not be found`** → 没安装 OpenSSH 服务端

## b. 检查是否安装了 SSH server

```bash
dpkg -l | grep openssh-server
```

- 有输出且开头是 **`ii`** → 已安装
- 无输出 → 未安装，需执行：bash运行

```bash
sudo apt update
sudo apt install openssh-server
```

## c. 查看 22 端口是否在监听

```bash
ss -tulpn | grep ssh
```

或（旧版工具）

```bash
netstat -tulpn | grep ssh
```

- 出现 LISTEN → SSH 正在监听（已开启）

## d. 常用启停命令

```bash
sudo systemctl start ssh    # 启动
sudo systemctl stop ssh     # 停止
sudo systemctl enable ssh   # 开机自启
sudo systemctl disable ssh  # 禁止开机自启
```

