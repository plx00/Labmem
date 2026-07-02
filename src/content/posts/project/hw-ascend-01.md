---
title: 华为昇腾系列-Atlas_200I_DK_A2
published: 2024-07-06
updated: 2026-07-02
description: Atlas 200I DK A2使用 Ubuntu20.04 使用
image: /assets/bolg_cover/hw-ascend-01.webp
tags: [昇腾计算, 大模型, 人工智能]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

----

# 前言

> 本文档内容或存在滞后，仅作参考；完整详尽说明请查阅华为昇腾社区官方文档。
>
> **[ 快速开始（课程）](https://developer.hiascend.cn/videoready/%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B_1.mp4)**   `|`   **[ 快速开始（文档）](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/qs/qs_0018.html)**

- **说明**
  - 项目需运行 ROS1 程序，但 Atlas 200I DK A2 官方桌面镜像搭载 Ubuntu 22.04，原生不兼容 ROS1。为此我选用社区适配的 Ubuntu 20.04 基础镜像完成环境部署，下文完整记录该开发板从烧录到 ROS1 代码成功运行的全流程，所有操作均在 Windows 10 系统下完成测试。
- **官方文档**
  - **[内容介绍--昇腾社区](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/Hardware%20Interfaces/hiug/hiug_0001.html)**
  - **[查询帮助 - Atlas A2 智能边缘硬件 23.0.RC3 npu-smi 命令参考 02 - 华为 (huawei.com)](https://support.huawei.com/enterprise/zh/doc/EDOC1100333079/12ec6e1b)**
  - **[使用流程-快速开始-Atlas 200I DK A2开发者套件23.0.RC3开发文档-昇腾社区 (hiascend.com)](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/qs/qs_0018.html)**
  - **[40Pin接口介绍-Atlas 200I DK A2开发者套件23.0.RC3-昇腾社区](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/Hardware%20Interfaces/hiug/hiug_0024.html)**
  - **[产品简介-产品介绍-Atlas 200I DK A2开发者套件23.0.RC3开发文档-昇腾社区 (hiascend.com)](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/pd/pd_0001.html)**
- **默认管理员密码**
  - `Mind@123`

以下内容基本基于官方文档

# 1. U20 镜像烧录

## a. 下载镜像

本次烧录使用昇腾社区适配的 **Ubuntu 20.04 基础镜像**（无桌面环境，仅服务器极简版本）。

- **镜像资源**
  1. ~~文件在目录**file**下的 [Atlas200I-DK-A2_base-image_ubuntu20.04-aarch64.img.xz](file\Atlas200I-DK-A2_base-image_ubuntu20.04-aarch64.img.xz)~~ 
  2. 百度网盘备份：[下载链接](https://pan.baidu.com/s/1vUUgRybY1DcHXu2Wo1fPgg?pwd=af2a)
  3. 社区原文帖子地址：[ubuntu 20.04镜像链接 (hiascend.com)](https://www.hiascend.com/app-forum/topic-detail/0255149276305229084)
     ```ini
     原文解释
     “原20.04 华为云仓库链接已失效，新的不清楚，以下是个人备份的ubuntu 20.04镜像链接，两个网盘下载速度都比较慢，如果需要最新的华为云仓库链接请找版主，另外强调一下这个镜像是基础镜像，没有桌面功能”
     ```

## b. 烧录镜像

### i. 准备工作

- 准备一个 空的 32/64GB 的TF卡
- 一个 读卡器
- 树莓派镜像烧录官方软件（Raspberry Pi OS） 
  - [Raspberry Pi OS – Raspberry Pi](https://www.raspberrypi.com/software/)
  - **Win32 烧录镜像不怎么行**

### ii. 烧录


将TF卡插入读卡器，打开 `Raspberry Pi OS` 软件

1. 依次选择 **no filtering** -> **社区下载的镜像** -> **TF卡 设备** -> **下一项**
2. 选择 **“不”**
3. 选择 **“是”**
4. 等待 **写入完成** 与 **验证完成**
5. 烧录成功，点击继续，拔掉读卡器

[grid]
![image-20260701234726452](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260701234726833.webp)
![image-20260701234735995](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260701234736121.webp)
![image-20260701234743990](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260701234744115.webp)
[/grid]

[grid]
![image-20260701234754628](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260701234754737.webp)
![image-20260701234801109](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260701234801225.webp)
[/grid]

# 2. 远程连接

因为只是基础镜像，没有桌面，所以需要**MobaXterm(SSH)**远程连接，通过**命令行**来进行控制，后续使用 **nomachine** 进行桌面控制

官方提供了两种方式远程连接（只试验了 Type-C）：

- **通过Type-C接口连接**

- **通过以太网口连接**
- **使用串口登录**
- **使用VNC登录**

## a. 硬件连接

[远程登录模式-连接启动开发者套件-快速开始-Atlas 200I DK A2开发者套件23.0.RC3开发文档-昇腾社区 (hiascend.com)](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/qs/qs_0011.html)

依据以上链接，准备好硬件方面，然后进行上电

> [!TIP]
>
> **这里上电后会出现上电一段时间后自动重启，官方有解释**
> ![image-20260701235022428](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260701235022512.webp)

## b. Type-C接口远程登录（SSH方式）

- **MobaXterm下载地址**
  1. ~~或者本目录下（解压安装）： [MobaXterm_Portable_v22.2.zip](file\MobaXterm_Portable_v22.2.zip)~~ 
  2. **百度网盘：**[下载地址](https://pan.baidu.com/s/1EQFEPEW_QYvjIV26KzPpTw?pwd=e29t)
  3. **官方地址：**[MobaXterm Xserver with SSH, telnet, RDP, VNC and X11 - Home Edition (mobatek.net)](https://mobaxterm.mobatek.net/download-home-edition.html)
- **参考文章**
  - [Type-C接口远程登录（SSH方式）-远程登录模式（Windows系统）](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/qs/qs_0016.html)
  - 依据以上链接，进行使用 **MobaXterm** 远程登陆到系统，文章有详细的步骤解释，细心操作

![image-20260701235157931](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260701235400586.webp)

- **登录相关**

  ```bash
  # 账号
  root
  # 密码
  Mind@123
  # 登录IP
  192.168.0.101
  ```

  **登陆成功，查询内核，版本**

  ![image-20260701235632374](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260701235632490.webp)

## c. 登录 HwHiAiUser 用户

上面登陆成功是以`root`管理员账号登录，但日常程序运行建议使用普通用户以规避权限风险，开发板预置普通用户`HwHiAiUser`，登录时仅需将用户名替换为`HwHiAiUser`即可。

```bash
# 账号
HwHiAiUser
# 密码
Mind@123
# 登录IP
192.168.0.101
```
[grid]
![image-20260702000015363](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702000015474.webp)
![image-20260702000056986](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702000057114.webp)
[/grid]

# 3. 网络连接

官方提供了[三种方式的网络连接](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/qs/qs_0008.html)

- （非常好用，推荐）参见 [通过PC共享网络联网（Windows）](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/Hardware%20Interfaces/hiug/hiug_0010.html)，将PC的外部网络共享给连接PC的开发者套件，此方法不需要路由器，但是开发者套件接口（连接PC的接口）IP网段只支持配置 `192.168.137.xxx`。
  - **只试验了 第一种的直连-Type-C，网口没有试验，没有网卡与路由器**
- 参见[通过USB WiFi网卡联网](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/Hardware%20Interfaces/hiug/hiug_0059.html)，此方法需要准备USB WiFi网卡，但IP网段无限制。
- 参见[通过路由器联网](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/Hardware%20Interfaces/hiug/hiug_0011.html)，此方法需要准备路由器，但IP网段无限制。

## a. 配置接口IP

[修改接口IP地址-Atlas 200I DK A2开发者套件23.0.RC3-昇腾社区](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/Hardware%20Interfaces/hiug/hiug_0009.html)

依次文档依次操作，选择 `Ubuntu系统操作` 栏，注意需以 **root** 用户登录。

修改`01-netcfg.yaml`文件内容可以使用以下的，不使用官方提供的，否则会出现错误

![image-20260702001016903](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702001016993.webp)

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: yes
      nameservers:
        addresses: [8.8.8.8, 114.114.114.114]  # 合并为一个列表

    eth1:
      dhcp4: no
      addresses: [192.168.0.100/24]
      routes: 
        - to: 0.0.0.0/0  # 指定默认路由
          via: 192.168.137.1  # 网关地址

    usb0:
      dhcp4: no
      addresses: [192.168.137.2/24]
      routes: 
        - to: 0.0.0.0/0
          via: 192.168.137.1
      nameservers:
        addresses: [8.8.8.8, 114.114.114.114]  # 合并为一个列表
```

> [!TIP]
>
> ```bash
> /etc/netplan/01-netcfg.yaml:1:1: Invalid YAML: invalid leading UTF-8 octet:
> network:
> ^
> ```
>
> 若提示这样的错误，删除文本中的中文 即可

然后依据提示，输入命令，更新网络配置

```bash
netplan apply
```

当前会话会**断开连接**，依据文档操作，**打开网络共享后**，两种方式查看网络是否连通

## b. 连通网络

1. 重新建立对话窗口，以 **192.168.137.2** （host） **root**（usr）登录成功，网络也Ping通了！

   其实只要登录成功，就代表网络连接成功了

[grid]
![image-20260702001249397](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702001249509.webp)
![image-20260702001257015](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702001257179.webp)
[/grid]

2. 也可以依据文档，在 `Windows`上操作验证

   按下键盘的`Win + R`，在运行窗口输入cmd进入命令行窗口。

   使用`ping 192.168.137.2`命令测试PC和开发者套件是否正常连通，窗口如果显示类似如下输出，说明PC与开发者套件已连通。

   ![image-20260702001408645](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702001408732.webp)

> [!IMPORTANT]
>
> 这里有一个值得注意的点，执行命令 netplan apply 并打开网络共享之后，只能使用192.168.137.2 （host）进行连接，如果这时 **Atlas 200I DK A2 断电重新启动**，那么会发现192.168.137.2（host）连接不上，而192.168.0.2（host）也连接不上
>
> 1. 那是192.168.0.2（host） 能连接的情况在与没有执行 netplan apply 命令并且没有打开网络共享，才可以ping通
>
> 2. 而192.168.137.2（host）的连接情况是执行 netplan apply 命令并且打开了网络共享，才可以ping通
>
> **关键点就在于 netplan apply 命令执行 只作用于 启动的本次连接，若断电重启那么相当于下一次连接了，就是没有执行netplan apply 命令的环境，所以如果需要网络，那么必须执行netplan apply，也可以写一个开机自启动脚本来执行 netplan apply这个命令** 

# 4. 系统设置

### a. 关闭风扇手动调节

发现问题的社区文章地址：[Atlas_200I_DK_A2可以烧录ubuntu20.04吗](https://www.hiascend.com/forum/thread-0248140231073282062-1-1.html)

官网文章说明：[设置风扇模式 - Atlas A2 智能边缘硬件 23.0.RC3 npu-smi 命令参考 02 - 华为 (huawei.com)](https://support.huawei.com/enterprise/zh/doc/EDOC1100333079/8a275596)

```bash
# 输入命令
npu-smi set -t pwm-mode -d 1
```

## b. HwHiAiUser sudo 权限

社区文章地址：[【必看】小藤论坛首页_Atlas 200I DK A2_昇腾论坛 (hiascend.com)](https://www.hiascend.com/forum/thread-0254121060048461012-1-1.html)

问题解决位于楼主的 `4. faq` -> `12.其他问题` -> `4. HwHiAiUser使用sudo提示不允许使用`

> **HwHiAiUser没添加sudo权限，建议使用root安装系统软件，如果希望给HwHiAiUser增加sudo权限，切换到root用户，"vim /etc/sudoers"，把最后一行注释掉，增加一行 "HwHiAiUser ALL=(ALL:ALL) ALL"，使用 vim 打开 "/var/davinci/scripts/minirc_sys_init.sh"，注释掉第656-661行**

注意别注释错误了行数！

## c. USB摄像头设置

在普通用户下，使用opencv-python打开摄像头，会出现`打开摄像头失败`,需要添加权限或者使用**root**用户运行程序，但是执行 sudo python cam.py 也会出错！设备权限问题！

这里使用了 **`2. 添加用户到视频组`** 第二种方法作为使用！

> [!TIP]
>
> **解决：**
>
> ```bash
> -- 查看是否有摄像头设备连接
> ls -l /dev/video0
> ```
>
> **1. 临时方案（不重启电脑的就可以用，重启的话失效）**
>
> ```
> sudo chmod 666 /dev/video0
> ```
>
> **2. 添加用户到视频组**
>
> 检查摄像头设备的当前权限：
>
> ```bash
> ls -l /dev/video0
> ```
>
> 你会看到类似`crw-rw----+ 1 root video ... /dev/video0`的输出，表示`video`组拥有访问权限。
>
> 将当前用户添加到`video`组：
>
> ```bash
> sudo usermod -aG video $USER
> ```
>
> 重新登录或重启计算机，使更改生效。
>
> **3. 修改系统配置文件**
>
> 编辑或创建设备的`udev`规则文件：
>
> ```
> sudo nano /etc/udev/rules.d/99-persistent-camera.rules
> ```
>
> 在文件中指定设备的唯一标识符（如设备ID或序列号）和设备节点名称：
>
> ```bash
> SUBSYSTEM=="video4linux", ATTR{idVendor}=="abcd", ATTR{idProduct}=="1234", SYMLINK+="video_camera"
> ```
>
> 这样，每次系统检测到这个设备时，都会创建一个符号链接`/dev/video_camera`。
>
> **4. 修改`udev`规则**
>
> 创建或编辑`udev`规则文件（文件名可以自定义）：
>
> ```bash
> sudo nano /etc/udev/rules.d/99-camera.rules
> ```
>
> 在文件中添加以下内容（假设你要为`/dev/video0`设备设置权限）：
>
> ```bash
> KERNEL=="video0", MODE="0666"
> ```
>
> 这行规则指定了设备节点`/dev/video0`的权限为`0666`，即所有用户都有读写权限。
>
> 保存并退出文件编辑器，然后重新加载`udev`规则：
>
> ```bash
> sudo udevadm control --reload-rules
> sudo udevadm trigger
> ```
>
> 这样，每次系统启动或摄像头连接时，`/dev/video0`设备都会自动拥有`0666`权限。

# 5. 安装ROS1

**以root用户执行，必须连接网络！！！**

## a. 安装

使用鱼香ROS安装，官网地址：[小鱼的一键安装系列 | 鱼香ROS (fishros.org.cn)](https://fishros.org.cn/forum/topic/20/小鱼的一键安装系列)

```bash
wget http://fishros.com/install -O fishros && . fishros
```

依据提示依次选择（按顺序选择） 

- **[1] 一键安装** 
- **[1] 更换系统源再继续安装** 
- **[2] 更换系统源并清理第三方源** (大概时间5分钟)
- **[3] noetic(ROS1)**
- **[1] noetic(ROS1)桌面版**(等待安装完毕)

安装完成！！！

![image-20260702002112565](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702002112721.webp)

## b. 验证

这里的验证不能使用 `root` 用户进行验证，使用 `HwHiAiUser` 进行登录，以 `root` 用户执行命令 `roscore` 会出错。

- 打开一个 **HwHiAiUser用户** 远程界面，执行命令
  ```bash
  roscore
  ```

  ![image-20260702002318910](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702002319057.webp)
- 再打开一个 **HwHiAiUser用户** 远程界面，执行命令
  ```bash
  rosrun turtlesim turtlesim_node
  ```

  ![image-20260702002344815](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702002345016.webp)
- 再打开一个 **HwHiAiUser用户** 远程界面，执行命令
  ```bash
  rosrun turtlesim turtle_teleop_key
  ```

  ![image-20260702002412485](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702002412664.webp)

>**键盘操作时，屏幕焦点应该在输入`rosrun turtlesim turtle_teleop_key`命令的远程窗口中，否则小乌龟不会动！**

# 6. 安装桌面

## a. xfce桌面

- **参考文章**
  - [atlas 200 远程图形化桌面_atlas 200dk安装桌面-CSDN博客](https://blog.csdn.net/qq_30841655/article/details/121210271)
  - [给Atlas 200安装一个图形化桌面-云社区-华为云 (huaweicloud.com)](https://bbs.huaweicloud.com/blogs/135310)

**以root用户远程登录**

```bash
apt-get install xfce4 xfce4-goodies xorg dbus-x11 x11-xserver-utils
```

弹出窗口选择 **“lightdm”**, 然后等待安装完。

[grid]
![image-20260702002820054](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702002820197.webp)
![image-20260702002825025](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702002825159.webp)
[/grid]

查看是否安装完毕
```bash
which xfce4-session
# 输出
/usr/bin/xfce4-session
```

## b. Ubuntu桌面

### i. 安装桌面包（root 用户远程 SSH 执行）

以`root`账号远程登录设备后，执行以下命令安装完整 Ubuntu 桌面：

```bash
apt-get install ubuntu-desktop
```

安装完成后可通过命令校验 GNOME 桌面是否部署成功：

```bash
which gnome-shell
```

若输出类似 `/usr/bin/gnome-shell` 的文件路径，代表 GNOME 桌面环境安装完毕。

### ii. 环境说明与问题现象

1. **优缺点说明**
   - 完整 Ubuntu 桌面功能齐全，但常驻内存占用会额外增加约 1GB，对设备内存开销较大。
2. **异常问题**
   - 完成安装并重启设备、外接显示器后，依旧无法正常输出桌面画面，推测存在内核相关组件缺失问题，可通过下方官方 / 社区链接排查对应解决方案。
   > [!TIP]
   >
   > [本机显示模式-登录开发者套件-快速开始-Atlas 200I DK A2开发者套件23.0.RC3开发文档-昇腾社区 (hiascend.com)](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/qs/qs_0014.html)
   >
   > 这个链接可以看出 Ubuntu22.04 在开机启动了一个服务 toggle_graphical_desktop
   >
   > ```
   > [Unit]
   > Description=/usr/local/bin/toggle_graphical_desktop.sh
   > 
   > [Service]
   > ExecStart=/usr/local/bin/toggle_graphical_desktop.sh
   > Restart=on-failure
   > RestartSec=10s
   > 
   > [Install]
   > WantedBy=multi-user.target
   > ```
   >
   > 而这个服务启动了一个脚本 toggle_graphical_desktop.sh
   >
   > ```
   > #!/bin/bash
   > 
   > if [ -e /var/mini_upgraded ]; then
   > insmod /lib/modules/5.10.0+/ascend_vdp_drm.ko
   > nmcli radio wifi on
   > fi
   > ```
   >
   > 这个脚本启动了一个内核，Ubuntu22.04官方的有这个内核，Ubuntu 20.04 没有，可能需要自己去编译。

   > [!TIP]
   >
   > [Atlas 200I DK A2 桌面显示问题定位步骤_Atlas 200I DK A2_昇腾论坛 (hiascend.com)](https://www.hiascend.com/forum/thread-0286139203007449004-1-1.html)
   >
   > 而在这个链接的 **2. 检查桌面功能开启情况**，也可以看出显示屏没显示 可能是服务没启动（Ubuntu 22.04），
   >
   > 所以Ubuntu20.04 估计也是这个问题，后续可以看看。

# 7. Nomachine 远程

一些小操作：**[【NoMachine 如何Ctrl + Alt + T启动Linux终端】_nomachine 快捷键-CSDN博客](https://blog.csdn.net/qq_35914805/article/details/128022468)**

>**因为显示屏界面暂时问题解决不了，~~但是ROS导航、建图等等又需要可视化，所以使用 Nomachine进行可视化。~~**
> **MobaXterm也可以可视化 Rviz，剩下的再看。**

- **Nomachine**

  - 官网链接：[NoMachine - Free Remote Desktop for Everybody](https://www.nomachine.com/)

    依据选择下载Windows版本（作为服务端） 与 arm64 版本（作为客户端）

Windows安装不做赘述，只介绍Arm64 版本

## a. 安装

1. **安装包传入系统**

   Windows下的 **nomachine_8.11.3_3_arm64.deb**，通过 **MobaXterm** 传入到 **HwHiAiUser** 用户主目录下，等待传输完毕
   ![image-20260702003859460](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702003859681.webp)

2. **安装**

   ```
   sudo dpkg -i nomachine_8.11.3_3_arm64.deb
   ```

   ![image-20260702003948310](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702003948430.webp)

## b. 登录

1. 打开Windows桌面的 Nomachine

   ![image-20260702004042826](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702004042920.webp)
2. 点击左上角的 **“Add”**

   ![image-20260702004113198](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702004113304.webp)
3. 右边内容 Name 随意填，自己记住是哪个就可以，Host 填入 “192.168.137.2” 或者没网络共享之前的 ”192.168.0.2“

   ![image-20260702004155399](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702004155587.webp)
4. **双击设置好的图标**

   ![image-20260702004236702](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702004236797.webp)
5. 输入登录用户 **”HwHiAiUser“** 与密码 **”Mind@123“**
   ![image-20260702004326134](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702004326311.webp)
6. **询问是否创建一个新界面**
   <!--"无法检测到任何正在运行的显示器。您希望 NoMachine 创建一个新的显示并继续连接到桌面吗？"-->
   ![image-20260702004407908](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702004408067.webp)

7. **等待连接，连接成功后会出现一些显示设置，全部点击OK，登陆成功！**
   ![image-20260702004427514](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702004427755.webp)

## c. 小乌龟案例

可以在这个界面验证一下，成功界面！！！

![image-20260702004520504](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702004520762.webp)

# 8. ROS功能包验证 

**使用 ”Nomachine“ 或 MobaXterm 进行**

## a. rplidar_ros

> **这是一个验证雷达建图功能的包**

### i. 准备工作

在进行验证之前，需要在主目录下构建一个工作空间，打开一个终端

1. 输入指令 **“mkdir -p ~/rplidar_ws/src && cd ~/rplidar_ws”** ，新建工作空间。
2. 输入指令 **“catkin_make”** ,编译新工作空间。
3. 输入指令 **“echo "source ~/rplidar_ws/devel/setup.bash" >> ~/.bashrc”** ,将新工作空间设置成环境变量。可在主目录 **.bashrc** 中查看添加的内容。**$HOME** 代表你自己的系统名称



- **第二步骤”catkin_make“ 出现错误**
  1. **缺少empy**

     ![](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702005012953.webp)
     - **解决方法**
       ```bash
       pip install empy==3.3.2
       # 这里需要安装与ROS Noetic 版本对应的empy,否则以后编译会报错！
       ```

       ![](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702004811025.webp)
  2. **找不到 catkin_pkg**

     ![image-20260702005212688](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702005212869.webp)
     - **解决方法**
       ```bash
       pip install catkin_pkg
       ```
  3. **编译成功！**
  
     ![image-20260702005342459](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702005342583.webp)

### ii. 编译功能包

~~将同目录下的 [rplidar_ros.zip](ros\rplidar_ros.zip) 压缩包~~，解压到 第一步骤中创建的工作空间下的src文件夹下，或者打开终端 

```bash
# 输入指令
cd rplidar_ws/src/ && git clone https://github.com/Slamtec/rplidar_ros

# 编译
cd ..
catkin_make
```

### iii. 重映射

重映射USB串口：这种方法长期有效。在rplidar_ros功能包路径下，安装 USB 端口重映射

```bash
chmod +x ./scripts/create_udev_rules.sh
./scripts/create_udev_rules.sh
```

**输入密码，完成**

![image-20260702005852747](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702005852903.webp)

重新插拔激光雷达的USB接口，使用以下命令查看是否成功： 

```bash
ls -l /dev | grep ttyUSB
```

![image-20260702005953530](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702005953647.webp)

### iv. 代码测试

#### 1. 点云图

确保激光雷达上电连接，并且信号线连接正常，查看点云扫描图，在工作空间目录下，运行rplidar节点，在rviz中查看

```bash
roslaunch rplidar_ros view_rplidar_a1.launch
```

运行成功可以在 rviz 中看到 rplidar 的扫描结果。

![image-20260702010047027](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702010047280.webp)

#### 2. 雷达数据

还可以单独看见雷达的数据输出，将上一个步骤的终端 kill 关闭，另开一个新终端输入指令 

```
roslaunch rplidar_ros rplidar_a1.launch
```

再开一个新终端，输入指令 

```
rosrun rplidar_ros rplidarNodeClient
```

可以看到终端打印出来的雷达数据

![image-20260702010206953](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702010207129.webp)

## b. esteam_ws

> **这是一个使用思岚 A1M8进行雷达建图与保存的测试包**

暂不记录

## c. lingao_ws

>这是使用小白底盘 进行建图、导航的官方包

暂不记录

**官方链接：**[文件列表 - lingaoros/lingao_ros - 公开仓库 (coding.net)](https://keaa.coding.net/public/lingaoros/lingao_ros/git/files/3.1.0)

**百度网盘：**[下载地址](https://pan.baidu.com/s/1ZTycjBNElRu2sxJpW2NGUQ?pwd=yi8k)

# 系统存档 - 2024-07-26

测试 通过 Win32DiskImager 可以进行读取与写入镜像，但是无法使用 脚本工具 进行缩小镜像

所以物理备份了一个 镜像

存在了一张TF卡内 ，上面有文字标识

`华为昇腾 Ubuntu20.04 备份镜像 2024.07.26`

**已丢失_2026-07-01**

# 9. MindX SDK 应用 - 目标检测

这个配合以前的 `Jetson Nano` 的那个垃圾桶进行按钮触发拍照，然后目标检测，检测完成后打开对应舵机并触发语音提示。

通过 **`root`** 用户登录

## a. 目标检测

- **使用 Ubuntu 22.04 官方镜像** 

  官方配置好了环境，直接进行使用。

  详细使用：**[目标检测应用样例开发介绍（Python）](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC2/Getting%20Started%20with%20Application%20Development/gswmsad/gswmsad_0002.html)**

  > [!TIP]
  > 其中有一步，在运行 `main.py` 前需要声明环境 `. /usr/local/Ascend/mxVision/set_env.sh`
  > 我们可以将这句话写到 `.bashrc` 文件中，
  > 在文件中最底下加入 `source /usr/local/Ascend/mxVision/set_env.sh`

- **使用 Ubuntu 20.04 服务器**

  这个是上面的服务器版本，但是没有环境，看一看怎么配置，实现目标检测。

  未实现！！！

## b. 线路连接

![image-20260702011310224](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702011310448.webp)

## c. GPIO设置

这个摘自别的文档的一些问题，但是也是包括GPIO设置

### i. 按钮

按钮是一个`自复位按钮`。

**[自锁开关和自动复位开关有什么区别？](http://en.topstone-cb.net/?news_55/548.html)**

首先我们需要知道什么是自锁开关，什么是自复位开关?

自锁开关就是当使用者按压下去按钮时，开关行程走到特定位置的时候，会被机械结构锁住，然后停在指定的位置。在第二次按压时，开关会回弹到第一次按压的位置。

自锁开关的种类很多，有直键开关、带灯轻触开关等，所用于油烟机、落地风扇灯上面的开关。

自动复位开关是指按钮按压无论到那个行程位置，都会自动回到初始的位置。自复位开关比较常见，如轻触开关、直键开关、微动开关钮子开关等都有带自复位功能，多用于吹风机、电饭煲、电脑开机键等上面。

电路上的解释是主板上的插接线的插接对象之一，手按下时它发生短路，松开后又恢复开路。瞬间的短路就会让计算机重启，简单的说就是一个重启按钮。  

自锁开关和自复位开关的区别：主要在于控制内部行程的机械物理结构，自锁的通常会带有一个卡位，行程走到这个卡位的时候，就会自动锁住。当然，自锁和自复位是一个结构功能上的称呼，可以涵盖各种类型的开关。 

自锁开关的价格大多比复位开关的稍微贵点，因为在按键结构设计原理上，自锁的内部工作状态相对于复位的，要多出一些结构，用于按压第一次时锁住开关，断开时复位。比如我们常见装修的家具里面的智能发光按键开关，就有自锁和自复位的，通常自锁的多用控制房间的风扇和窗帘等，用自锁的比较多。不过自复位用的比较多的是在防水轻触开关上。

### ii. 按钮接的IO口

华为板IO口布局与树莓派、Jetson 系列板子一致，具体引脚定义以官方为准。

`图片为树莓派引脚图`

![image-20260702011510983](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702011511167.webp)

- **华为版IO口资料链接**

  - **[40Pin接口介绍](https://www.hiascend.com/document/detail/zh/Atlas200IDKA2DeveloperKit/23.0.RC1/Hardware%20Interfaces/hiug/hiug_0017.html)**

  - [**小藤 GPIO、40pin管脚使用教学**](https://www.hiascend.com/forum/thread-0267128000548963084-1-1.html)

代码中检测IO口，用的是 Github上的 [**python-periphery**](https://github.com/vsergeev/python-periphery) 库，这个库的 [使用介绍](https://python-periphery.readthedocs.io/en/latest/gpio.html)。

### iii. 案例

使用`python-periphery`案例

#### 1. 使用代码控制GPIO接口

[**使用代码控制GPIO接口**](https://www.hiascend.com/forum/thread-0274134987066704006-1-1.html)

关于第16号引脚为什么在代码中使用80的编号 ` gpio_button = GPIO(80, "in")`

- **先是查询16号引脚对应 gpio复用关系**

  这里显示是 `gpio2_16`
  ![image-20260702011734251](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702011734481.webp)



- **在查询对应序号**

  参考网址[[接口外设调测参考 -> GPIO -> 寄存器描述 ](https://support.huawei.com/enterprise/zh/doc/EDOC1100332692/602e74fa)

  ![image-20260702011752329](https://vip.123pan.cn/1831996731/a_PicBed/project/hw-ascend-01/20260702011752482.webp)



第二组第16个引脚 对应的GPIO_ID 就为 `64+16 =80`

#### 2. Atlas200 DK A2与Arduino进行UART串口通信

[**Atlas200 DK A2与Arduino进行UART串口通信**](https://www.hiascend.com/forum/thread-0260123430838468031-1-1.html)

用的是`CH340串口模块通信`,对应设备信息可以通过命令`ls -l /dev/ttyUSB`查看是否有连接

```bash
(base) root@davinci-mini:~# ls -l /dev/ttyUSB
crw-rw---- 1 root dialout 188, 0 Sep 20 11:55 /dev/ttyUSB0
```

#### 3. 串口通信协议 -UART

- **[串口通信协议【I2C、SPI、UART、RS232、RS422、RS485、CAN、TTL、USB】](https://blog.csdn.net/qq_59572329/article/details/127560226?ops_request_misc=%257B%2522request%255Fid%2522%253A%25227D054DDE-E0EF-4810-8BBB-B82219596587%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=7D054DDE-E0EF-4810-8BBB-B82219596587&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-127560226-null-null.142^v100^control&utm_term=%E4%B8%B2%E5%8F%A3%E9%80%9A%E4%BF%A1&spm=1018.2226.3001.4187)**
- **[【Iot】什么是串口？什么是串口通信？串口通信(串口通讯)原理，常见的串口通信方式有哪些？](https://blog.csdn.net/weixin_42960907/article/details/136001074?ops_request_misc=%257B%2522request%255Fid%2522%253A%25227D054DDE-E0EF-4810-8BBB-B82219596587%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=7D054DDE-E0EF-4810-8BBB-B82219596587&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-2-136001074-null-null.142^v100^control&utm_term=%E4%B8%B2%E5%8F%A3%E9%80%9A%E4%BF%A1&spm=1018.2226.3001.4187)**

- **[UART串口通信](https://blog.csdn.net/m0_58427556/article/details/135302591?ops_request_misc=&request_id=&biz_id=102&utm_term=%E4%B8%B2%E5%8F%A3%E9%80%9A%E4%BF%A1&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-135302591.142^v100^control&spm=1018.2226.3001.4187)**

关于串口通信，CSDN上很多。

垃圾桶的通信方式是`串口通信-UART通信-全双工通信`

通过接收上位机 **(Atlas_200I_DK_A2)** 传过来的通信协议，去控制垃圾桶的开启与对应语音的触发。

### iv. 完整更改的代码

**百度网盘： https://pan.baidu.com/s/19zSj6HAtbLhHgzzijAX27Q?pwd=f7ys** 

可以解压缩查看代码，目录大概是

- **`yolo_sdk_python_sample/`**
  - **model/** (使用的模型文件)
    - yolov5s_bs1.om
    - yolov5s.onnx
  - **old_photo/** (每次检测后的照片)
  - **result/** (检测结果照片)
  - **test/** (测试GPIO、拍照、串口等功能)
  - coco_names.txt (识别的种类文件)
  - det_tools.py (新添加使用的函数)
  - det_utils.py (原有包的函数)
  - main.py (运行的主函数,并添加了一些新的函数)
  - start_detection.sh (启动 main.py 的脚本)

# 附录

## a. 待解决的问题

1. 网络驱动

2. 蓝牙驱动
3. 屏幕显示
4. 九、MindX SDK 应用 - 目标检测 **->** 1. 目标检测 **->** 2- Ubuntu20.04 服务器 没有实现
5. 

## b. 可以实现功能

### i. 小白底盘 / 大黄蜂底盘

> **`可以实现功能：小白底盘 / 大黄蜂底盘 `**
>
> 1- 底层驱动 (控制运动)  /  底层驱动 (控制运动)
>
> 2- 思岚雷达建图导航  /   思岚雷达建图导航
>
> 3- DABAI 深度摄像头RGB 显示 / 

> **`未实现功能(不清楚的)`**
>
> 1- 
>
> 2- 

### ii. 机械臂





















