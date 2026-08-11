---
title: WEILAN 机器狗（一）
published: 2025-09-20
updated: 2026-08-11
description: 蔚蓝机器狗的基础使用与控制
image: /assets/bolg_cover/weilan-devq-00.webp
tags: [机器狗, ROS, 自动导航]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

**[WEILAN 机器狗（二）](/posts/project/weilan-devq-02/)**

**[WEILAN 机器狗（三）](/posts/project/weilan-devq-03/)**

> 本章节重点阐述蔚蓝机器狗 BabyAlpha Dev-Q 型号的基础二次开发方法及标准化实施步骤，为开发者开展二次开发工作提供清晰、规范的操作指引，助力开发者快速完成开发环境搭建、基础功能适配及初步拓展等核心工作。

Github：[AlphaDogDeveloper](https://github.com/AlphaDogDeveloper)

[原文档PDF原件](https://1831996731.share.123pan.cn/123pan/wdzVjv-jgWvd)

- **基础环境**

  | **主机设备**   | WEILAN 机器狗                                                |
  | :------------- | :----------------------------------------------------------- |
  | **操作系统**   | Ubuntu 18.04 LTS                                             |
  | **传感器设备** |                                                              |
  | **ROS版本**    | ROS Melodic Morenia                                          |
  | **补充说明**   | 本环境为项目/测试的基础运行环境，后续所有操作均基于此环境开展，若环境有变更，需在文档中同步更新。 |

- **参考链接**

  | **产品名称**                   |                     **BabyAlpha Dev-Q**                      |
  | :----------------------------- | :----------------------------------------------------------: |
  | **agentos_sdk wiki**           |  **https://github.com/AlphaDogDeveloper/agentos_sdk/wiki**   |
  | **操作指引**                   |   **https://weilan.dochelp.cn/c/1681563736140279810.html**   |
  | **Github issues**              | **https://github.com/AlphaDogDeveloper/dev_robot_control_sdk/issues/created_by/21%20%20%20---%20Open?q=is%3Aissue** |
  | **dev_robot_control_sdk-main** | **[AlphaDogDeveloper/dev_robot_control_sdk: SDK for developing motion control software on WeiLan Dev series robots.](https://github.com/AlphaDogDeveloper/dev_robot_control_sdk)** |
  | **tools-main**                 | **[AlphaDogDeveloper/tools: burn tool, guides, etc.](https://github.com/AlphaDogDeveloper/tools)** |
  | **robodog**                    | **[00make/robodog: A Python library for controlling AlphaDog robotic dogs.](https://github.com/00make/robodog)** |
  | **alphadog_ros_ctl**           | **[alphadog_ros_ctl: 蔚蓝机器狗dev版本使用ros1 bridge连通ROS Humble和ROS Noetic，实现Joystick手柄遥控操作机器狗。](https://gitee.com/chenxin852/alphadog_ros_ctl)** |
  | **agentos** 的一个新的文档     | **[安装指南 — agentos 0.1 文档](https://agentos.readthedocs.io/zh-cn/latest/user_guide/installation.html)** |
  | 相关视频                       | **[二次开发机器狗学习分享_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1PvVZzQEGc?buvid=XY729C870210667572C0A4E453592000FE96B&from_spmid=search.search-result.0.0&is_story_h5=false&mid=XKX9a9aSqYtdWnp9LA7rtg%3D%3D&plat_id=116&share_from=ugc&share_medium=android&share_plat=android&share_session_id=c5afb3dd-fd5f-4013-87f9-5a87d55434f5&share_source=WEIXIN&share_tag=s_i&spmid=united.player-video-detail.0.0&timestamp=1757478588&unique_k=ehKXAKf&up_id=1128287275&vd_source=44174cb9e1b481198e2339e3ef279079)** |

```
dev_robot_control_sdk-main 官方介绍

Dev Robot Control SDK V1.0.0
最新发布日期：2025-03-07
蔚蓝开发者版本机器人运动控制SDK是一个专门为购买蔚蓝开发者系列机器人用户开放的在机器人本体上进行运动控制软件开发和算法创新的软件包。
支持产品
BabyAlpha Dev
重点描述
SDK 包含以 C 头文件和动态库形式发布的 sensorimotor_interface 库和一个作为示例的运动控制软件框架，实现了基于有限状态机的多个运动模式，能够控制机器狗站立、趴下，同时提供了一个作为示例的基于强化学习模型的运动控制模式，能够控制机器狗移动。支持通过发布 ROS 消息输入控制指令。
sensorimotor_interface 库封装了对于不同硬件的传感器（IMU） 和执行器的访问接口，以 C 头文件和动态库的形式方便开发者基于大多数编程语言进行调用。

-----------------------------------------------------------------------------------------------------------

tools-main 官方介绍

Tools V1.0.0
最新发布日期：2025-03-07
开发者工具包专为蔚蓝机器狗开发者版用户提供在开发过程中有可能使用到的系统工具软件、驱动及方法。
支持产品
BabyAlpha Dev
重点描述
工具包会依据不同硬件开发平台进行分类，每个平台下会提供机器狗连接方法，SOC镜像烧录工具及方法，OTA工具及方法，常见问题及注意事项介绍等。

------------------------------------------------------------------------------------------------------------

robodog
可能是个人开发者写的 Python API

------------------------------------------------------------------------------------------------------------

alphadog_ros_ctl
蔚蓝 AlphaDog Dev + SO-101 机械臂 ROS 1 / ROS 2 通信桥接方案
```

![image-20260811105814198](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811105814438.webp)



本文件将在上述基础环境的框架下，详细记录项目开发、测试验证等相关工作的进展。各具体模块可根据实际需求灵活规划与补充。鉴于篇幅及内容聚焦考量，有关**系统安装及部分常用配置**的具体细节将不做赘述。



# 1. SSH

上述资料链接中的 **Tools** 工具包内提供`《开发者版本工具使用手册.pdf》`文档，文档记载两种设备登录方案：

1. **无线连接**：终端接入机器狗自带 WiFi 后，通过 SSH 协议远程登录设备；
   - 一个是连接机器狗自身的Wifi
   - 另一个是机器狗链接公共局域网（需使用官方APP进行操作）
2. **有线连接**：使用网线直连设备网口，通过 IP 地址 10.10.10.10 完成登录，需保证操作终端与机器狗处于同一网段。

## a. 帐号

![image-20260811110523902](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811110524021.webp)

## b. 登录

这里登录可以使用任意的ssh登录工具，Windows Power Shell也可以，依据不同的用户名输入不同密码

| **root** | **weilan.com** |
| :------: | :------------: |
| **dev**  |  **12345678**  |

![image-20260811110555011](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811110555097.webp)

### i.  root用户

![image-20260811110704755](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811110704938.webp)



### ii. dev用户

![image-20260811110718646](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811110718810.webp)

## c. 网络连接

> [!IMPORTANT]
>
> 在测试群体控制连接网络时，发现官方的APP连接网络的可能有要求，就是必须连接在可以联通互联网的Wifi热点，使用自己创建的Wifi(AP)，机器狗连接上几秒后，就会自动断开。
>
> (3F)我在楼下实验时（路由器有互联网）
>
> 1、树莓派自身网卡连接路由器，另一个网卡组成热点，机器狗连接没问题。
>
> 2、树莓派自身网卡断开路由器，另一个网卡组成热点，机器狗连接出现连接后断开。
>
> 3、树莓派自身网卡断开路由器，外接一个USB上网卡，另一个网卡组成热点，机器狗连接没问题。
>
> (5F)楼上实验时（没有路由器，相当于断开路由器）
>
> 1、树莓派自身网卡断开路由器，另一个网卡组成热点，机器狗连接出现连接后断开。
>
> 2、树莓派自身网卡断开路由器，外接一个USB上网卡，另一个网卡组成热点，机器狗连接没问题。
>
> 3、树莓派自身网卡断开路由器，自身网卡连接手机热点，另一个网卡组成热点，机器狗连接没问题。
>
> 
>
> 上述情况，在有互联网的情境下，机器狗连接十分稳定，所以应该是官方的设置问题。
>
> 

[板载电脑如何联网 · Issue #19 · AlphaDogDeveloper/dev_robot_control_sdk](https://github.com/AlphaDogDeveloper/dev_robot_control_sdk/issues/19)

在 Github Issue 19 中给出了回答

![image-20260811111228579](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811111228670.webp)

App连接网络大致流程就是

1. 连接机器狗 WIFI  BabyAlpha***
2. 进入官方App，待机器狗连接成功，显示机器狗模型画面
3. 点击其中左下角的网络连接，连接对应无线网络即可

然后通过ssh登录进行测试，ping网络 `ping www.baidu.com`/`ping 8.8.8.8`，代表已连接网络。

![image-20260811111514612](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811111514798.webp)

下一次启动开机会自动连接网络，以下是查看机器狗IP的一些输出信心

```
root@sport:~# hostname -I
10.10.10.10
root@sport:~# ifconfig
br0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.10.10.10  netmask 255.255.255.0  broadcast 10.10.10.255
        inet6 fe80::3278:c9ff:fe52:671c  prefixlen 64  scopeid 0x20<link>
        ether 30:78:c9:52:67:1c  txqueuelen 1000  (Ethernet)
        RX packets 10259  bytes 637744 (637.7 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 2058  bytes 173097 (173.0 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

eth0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether 30:78:c9:52:67:1c  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 127

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1  (Local Loopback)
        RX packets 20802  bytes 2685163 (2.6 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 20802  bytes 2685163 (2.6 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether 54:78:c9:52:67:1c  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 1  bytes 90 (90.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        ether 56:78:c9:52:67:1c  txqueuelen 1000  (Ethernet)
        RX packets 10259  bytes 637744 (637.7 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 2059  bytes 202089 (202.0 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

root@sport:~# cat /etc/network/interfaces
# interfaces(5) file used by ifup(8) and ifdown(8)
# Include files from /etc/network/interfaces.d:
source-directory /etc/network/interfaces.d
root@sport:~# ip addr
4: wlan0: <NO-CARRIER,BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state DORMANT group default qlen 1000
    link/ether 54:78:c9:52:67:1c brd ff:ff:ff:ff:ff:ff
5: wlan1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast master br0 state UP group default qlen 1000
    link/ether 56:78:c9:52:67:1c brd ff:ff:ff:ff:ff:ff
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc pfifo_fast master br0 state DOWN group default qlen 1000
    link/ether 30:78:c9:52:67:1c brd ff:ff:ff:ff:ff:ff
3: br0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 30:78:c9:52:67:1c brd ff:ff:ff:ff:ff:ff
    inet 10.10.10.10/24 brd 10.10.10.255 scope global br0
       valid_lft forever preferred_lft forever
    inet6 fe80::3278:c9ff:fe52:671c/64 scope link
       valid_lft forever preferred_lft forever
```









# [2. Dev_robot_control_sdk](https://github.com/AlphaDogDeveloper/dev_robot_control_sdk)

**本章节需在机器狗本地端进行操作**

蔚蓝Dev系列机器人运动控制程序示例。

## a. 目录结构

- **sensorimotor_interface**：包含用于与传感器和电机（如执行器、IMU 等）通信的 C 语言接口和库。
- **config**：包含机器人控制的配置文件。
- **include**：包含示例运动控制程序的 C++ 头文件。
- **src**：包含示例运动控制程序的 C++ 源代码。
- **third-party**：包含第三方库和其他依赖项。
- **model**：包含基于学习的模型文件。
- **resources**：包含机器人的资产文件，如 URDF（统一机器人描述格式）和网格文件。


## b. 环境构建

依据 **dev_robot_control_sdk**的文档操作。

```bash
source /opt/ros/noetic/setup.bash
mkdir -p ~/example_ws/src
cd ~/example_ws
git clone https://github.com/AlphaDogDeveloper/dev_robot_control_sdk.git src/robot_control
catkin_make install
```

- **设置 ROS 环境**：`source /opt/ros/noetic/setup.bash`，加载 ROS Noetic 的环境变量。
- **创建工作空间**：`mkdir -p ~/example_ws/src`，创建一个名为 `example_ws` 的工作空间，并在其中创建 `src` 目录。
- **切换到工作空间**：`cd ~/example_ws`，进入工作空间目录。
- **克隆 SDK**：`git clone https://github.com/AlphaDogDeveloper/dev_robot_control_sdk.git src/robot_control`，将 SDK 代码克隆到 `src/robot_control` 目录。
- **构建 SDK**：`catkin_make install`，构建并安装 SDK。

## c.运行

```bash
# Run
# Note: please ensure that no other robot control program is running and using sensorimotors (actuators, IMU, etc).

# Run robot control program
cd ~/example_ws
source install/setup.bash 
cd install/lib/robot_control
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib:./
./robot_control config/devq.yaml
```

- **运行前的注意事项**：确保没有其他机器人控制程序正在运行并使用传感器和电机。
- **运行控制程序**：
  - `cd ~/example_ws`，切换到工作空间目录。
  - `source install/setup.bash`，加载构建后的环境变量。
  - `cd install/lib/robot_control`，切换到控制程序的安装目录。
  - `export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib:./`，设置动态链接库路径。
  - `./robot_control config/devq.yaml`，运行控制程序并加载配置文件 `config/devq.yaml`。

## d.测试模式

![image-20260811111924715](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811111924834.webp)

- **被动模式**：机器人不执行任何主动动作，可能处于待机状态或等待进一步指令。 
- **躺下模式**：机器人执行躺下动作，通常用于机器人需要休息或关闭时。 
- **站立模式**：机器人执行站立动作，准备好进行进一步的操作或移动。 
- **强化学习模型模式**：机器人使用强化学习模型来控制其动作。这可能涉及使用预先训练的模型来执行复杂的任务或动作。
- **软停止模式**：机器人执行软停止动作，平滑地停止所有运动，而不是突然停止。

```bash
source /opt/ros/noetic/setup.bash	
# Set motion mode to STAND_UP
# 通过 ROS 的 `rostopic pub` 命令发布消息，将机器人的运动模式设置为 `STAND_UP`（站立模式）。
rostopic pub --once /robot_control/set_mode std_msgs/Int32MultiArray "data: [2]"

source /opt/ros/noetic/setup.bash
# Set motion mode to LIE_DOWN
# 将机器人的运动模式设置为 `LIE_DOWN`（躺下模式）。
rostopic pub --once /robot_control/set_mode std_msgs/Int32MultiArray "data: [1]"
```

## e.测试设置速度

```bash
source /opt/ros/noetic/setup.bash
# Set vx=0.1, vy=0.0, wz=0.3
rostopic pub --once /robot_control/set_velocity std_msgs/Float32MultiArray "data: [0.1, 0.0, 0.3]"
```

通过 ROS 的 `rostopic pub` 命令发布消息，设置机器人的速度。设置的速度参数为 `vx=0.1`（x 方向速度），`vy=0.0`（y 方向速度），`wz=0.3`（z 方向角速度）。

## f. 问题

### i. issues 上的问题

- **Q1**

  [关于 dev_robot_control_sdk相关问题 · Issue #11 · AlphaDogDeveloper/dev_robot_control_sdk](https://github.com/AlphaDogDeveloper/dev_robot_control_sdk/issues/11)

  ![image-20260811114625397](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811114626639.webp)

- **Q2**

  [关于DevQ运动之前需解锁的问题 · Issue #4 · AlphaDogDeveloper/dev_robot_control_sdk](https://github.com/AlphaDogDeveloper/dev_robot_control_sdk/issues/4)

  ![image-20260811114736378](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811114736805.webp)

###  ii. 构建环境时的问题

以下步骤执行不成功，直接使用 **root** 用户进行测试。

> [!WARNING]
>
> ~~`mkdir -p ~/example_ws/src` 在使用 **dev** 用户时，会出现没有权限执行。~~
>
> ```bash
> dev@sport:~$ mkdir -p ~/example_ws/src
> mkdir: cannot create directory ‘/home/dev/example_ws’: Permission denied
> ```
>
> ~~需要登陆到 **root** 用户，更改 **dev** 用户级别~~
>
> ~~**将 dev 用户加入到 sudo 用户组**~~
>
> ~~使用 `usermod` 命令将 `dev` 用户加入到 `sudo` 用户组。~~
>
> ```bash
> usermod -aG sudo dev
> ```
>
> ~~**验证 dev 用户是否已加入 sudo 用户组**~~
>
> ~~为了确保 `dev` 用户已经成功加入到 `sudo` 用户组，可以使用 `groups` 命令查看 `dev` 用户所属的用户组。~~
>
> ```bash
> groups dev
> ```
>
> ~~输出应该包含 `sudo` 用户组，例如：~~
>
> ```bash
> dev : dev sudo
> ```
>



# [3. Agentos_sdk](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki)

**本章节需在机器狗本地端进行操作**

本文开头已附上项目对应的 Github 仓库地址；若需将项目部署至机器狗板载系统，需先完成设备联网操作，网络连接步骤详见章节 [c. 网络连接](/posts/project/weilan-devq-01/#c-网络连接)。

## a. 目录结构

- [agent_msgs](https://github.com/AlphaDogDeveloper/agentos_sdk/tree/master/agent_msgs) Agent Skills相关技能接口，包括技能消息定义、调用技能及控制技能等。
- [ros_alphadog](https://github.com/AlphaDogDeveloper/agentos_sdk/tree/master/ros_alphadog) 运动控制相关接口，例如获取机器狗的运动状态。
- [docs](https://github.com/AlphaDogDeveloper/agentos_sdk/tree/master/docs) 文档相关。
- [agentos_examples](https://github.com/AlphaDogDeveloper/agentos_sdk/tree/master/agentos_examples) 示例项目。

## b. 环境构建

使用 root 用户登录

```bash
root@sport:~# source /opt/ros/noetic/setup.bash
root@sport:~# mkdir -p ~/agent_ws/src
root@sport:~# cd ~/agent_ws
root@sport:~/agent_ws# git clone https://github.com/AlphaDogDeveloper/agentos_sdk.git src/
Cloning into 'src'...
remote: Enumerating objects: 132, done.
remote: Counting objects: 100% (132/132), done.
remote: Compressing objects: 100% (95/95), done.
remote: Total 132 (delta 17), reused 127 (delta 13), pack-reused 0 (from 0)
Receiving objects: 100% (132/132), 328.85 KiB | 915.00 KiB/s, done.
Resolving deltas: 100% (17/17), done.
root@sport:~/agent_ws# catkin build
-----------------------------------------------------------------------
Profile:                     default
Extending:             [env] /opt/ros/noetic:/usr/lib/aarch64-linux-gnu
Workspace:                   /root/agent_ws
-----------------------------------------------------------------------
Build Space:        [exists] /root/agent_ws/build
Devel Space:        [exists] /root/agent_ws/devel
Install Space:      [unused] /root/agent_ws/install
Log Space:         [missing] /root/agent_ws/logs
Source Space:       [exists] /root/agent_ws/src
DESTDIR:            [unused] None
-----------------------------------------------------------------------
Devel Space Layout:          linked
Install Space Layout:        None
-----------------------------------------------------------------------
Additional CMake Args:       None
Additional Make Args:        None
Additional catkin Make Args: None
Internal Make Job Server:    True
Cache Job Environments:      False
-----------------------------------------------------------------------
Buildlisted Packages:        None
Skiplisted Packages:         None
-----------------------------------------------------------------------
Workspace configuration appears valid.

NOTE: Forcing CMake to run for each package.
-----------------------------------------------------------------------
[build] Found 2 packages in 0.0 seconds.
[build] Updating package table.
Starting  >>> catkin_tools_prebuild
Finished  <<< catkin_tools_prebuild                [ 11.1 seconds ]
Starting  >>> agent_msgs
Starting  >>> ros_alphadog
_____________________________________________________________________________________________________________________________________________________________________________________________________
Warnings   << ros_alphadog:cmake /root/agent_ws/logs/ros_alphadog/build.cmake.000.log
-- Building Time: 2025-09-10 07:36:38
-- Git Branch: master
-- Git Version: bf3d413
cd /root/agent_ws/build/ros_alphadog; catkin build --get-env ros_alphadog | catkin env -si  /usr/bin/cmake /root/agent_ws/src/ros_alphadog --no-warn-unused-cli -DCATKIN_DEVEL_PREFIX=/root/agent_ws/devel/.private/ros_alphadog -DCMAKE_INSTALL_PREFIX=/root/agent_ws/install; cd -

.....................................................................................................................................................................................................
Finished  <<< ros_alphadog                         [ 2 minutes and 54.4 seconds ]
Finished  <<< agent_msgs                           [ 3 minutes and 10.4 seconds ]
[build] Summary: All 3 packages succeeded!
[build]   Ignored:   None.
[build]   Warnings:  1 packages succeeded with warnings.
[build]   Abandoned: None.
[build]   Failed:    None.
[build] Runtime: 3 minutes and 21.6 seconds total.
[build] Note: Workspace packages have changed, please re-source setup files to use them.
root@sport:~/agent_ws#
```

编译完成后，终端提示 `“please re-source setup files”`，意思是 **需要重新加载工作空间的环境变量**，否则终端无法找到编译生成的可执行文件 / 节点。

```bash
# 1. 执行以下命令加载环境
root@sport:~/agent_ws#  cd ~/agent_ws
root@sport:~/agent_ws# source devel/setup.bash

# 2. 若想每次打开终端都自动加载（无需重复输入），可将上述命令添加到 **~/.bashrc** 文件中
echo "source ~/agent_ws/devel/setup.bash" >> ~/.bashrc
source ~/.bashrc  # 立即生效
```

## c. 开始使用

### i. 连接机器狗WiFi

打开“蔚蓝机器狗APP”，在”宠物“页面的右上角选单中选择“通用”，然后点击“Wi-Fi与安全”，得到机器狗的WiFi名称和密码，电脑(上位机)连接此WiFi。

### ii. 配置ROS环境变量

```bash
ifconfig
# 查看无线IP地址，例如：10.10.10.132

export ROS_MASTER_URI=http://10.10.10.10:11311
export ROS_HOSTNAME=<无线IP>
# 将<无线IP>替换为实际IP地址，例如：export ROS_HOSTNAME=10.10.10.217
```

### iii. 基础测试

#### 1.  控制技能

执行之前先进行加载工作空间的环境变量

```bash
# 获取机器狗当前的运动控制状态
rostopic echo /alphadog_node/dog_ctrl_state
```

调用`do_action`技能使机器狗站立

```bash
# 在机器狗本端运行时不需要配置ROS环境变量，
# 若本机为Ubuntu ROS，则需要
rosrun actionlib_tools axclient.py /agent_skill/do_action/execute agent_msgs/ExecuteAction
```

> [!NOTE]
>
> 这里运行会出错
>
> ```bash
> root@sport:~/agent_ws# rosrun actionlib_tools axclient.py /agent_skill/do_action/execute agent_msgs/ExecuteAction
> [rospack] Error: package 'actionlib_tools' not found
> ```
>
> 安装一下 **actionlib_tools**（若先进行了鱼香ROS的安装可直接安装即可）
>
> ```bash
> # 添加 ROS Noetic 官方源（适用于 Ubuntu 20.04，Noetic 对应的系统版本）
> sudo sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/ros-latest.list'
> 
> # 导入 ROS 官方密钥
> # 方法1：直接指定密钥服务器和密钥ID添加
> sudo apt-key adv --keyserver 'hkp://keyserver.ubuntu.com:80' --recv-key F42ED6FBAB17C654
> 
> # 方法2：如果方法1失败，手动下载密钥文件（需确保网络可访问）
> wget https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc -O ros.asc
> sudo apt-key add ros.asc
> rm ros.asc  # 用完删除临时文件
> 
> sudo apt-get update  # 先更新软件源列表（避免找不到包）
> sudo apt-get install ros-$ROS_DISTRO-actionlib-tools  # 安装 Noetic 版本的 actionlib_tools
> ```
>
> 这里会占用1.4G空间，查了一下内存显示是够用的。
>
> ```bash
> root@sport:~/agent_ws# df -h
> Filesystem       Size  Used Avail Use% Mounted on
> /dev/root        7.9G  3.3G  4.3G  44% /
> devtmpfs         2.0G     0  2.0G   0% /dev
> tmpfs            2.0G     0  2.0G   0% /dev/shm
> tmpfs            394M  1.2M  392M   1% /run
> tmpfs            5.0M     0  5.0M   0% /run/lock
> tmpfs            2.0G     0  2.0G   0% /sys/fs/cgroup
> /dev/mmcblk0p7   494K  2.0K  492K   1% /mnt/PRIVATE
> /dev/mmcblk0p11  7.9G   37M  7.5G   1% /mnt/UDISK
> /dev/mmcblk0p10   13G  669M   12G   6% /mnt/USERFS
> tmpfs            394M     0  394M   0% /run/user/0
> ```
>
> 验证安装
>
> ```bash
> rospack find actionlib_tools
> ```
>
> - 若输出类似 `/opt/ros/noetic/share/actionlib_tools` 的路径，说明安装成功；
> - 若仍提示 “package not found”，检查网络是否正常，或重新执行 `sudo apt-get update` 后再次安装。
>
> ```bash
> dpkg: error processing package gdm3 (--configure):
>  installed gdm3 package post-installation script subprocess returned error exit status 10
> Errors were encountered while processing:
>  gdm3
> E: Sub-process /usr/bin/dpkg returned an error code (1)
> 
> 这样的信息不用管
> ```
>
> 这个我在正常的Ubuntu ROS中安装只占了 60M多,这里下载却需要1.4G多，可能缺少的依赖更多吧。

Goal内容如下:

```bash
invoker: 'test_skill'
invoke_priority: 15
hold_time: 3.0
args: '{"action_id": 4}'
```

以上接口调用成功，则说明电脑(上位机)可以与机器狗进行消息的互通，可以进行下一步的开发工作。

这里的动作列表在 [附录一](/posts/project/weilan-devq-01/#附录一)

#### 2.  控制运动

还可以控制运动，启动对应接口的名称规范

```bash
rosrun actionlib_tools axclient.py /agent_skill/set_motion_params/execute agent_msgs/ExecuteAction
```

```bash
invoker: 'test_skill'
invoke_priority: 15
hold_time: 3.0
args: '{"vx": 0.1, "wz": 0.2}'
```

这里的运动控制参数在 [附录二](/posts/project/weilan-devq-01/#附录二)



#### 3.  即有行为

还有让机器狗执行一个即有行为，即 **`/agent_skill/do_dog_behavior/execute`** ，获取**机器狗支持的行为列表**：

```bash
root@sport:~# rostopic echo /agent_skill/do_dog_behavior/dog_behaviors
values:
  - confused								
  - confused_again					 		
  - recovery_balance_stand_1
  - recovery_balance_stand
  - recovery_balance_stand_high
  - force_recovery_balance_stand
  - force_recovery_balance_stand_high
  - recovery_dance_stand_and_params
  - recovery_dance_stand
  - recovery_dance_stand_high
  - recovery_dance_stand_high_and_params
  - recovery_dance_stand_pose
  - recovery_dance_stand_high_pose
  - recovery_stand_pose
  - recovery_stand_high_pose
  - wait
  - cute
  - cute_2
  - enjoy_touch
  - very_enjoy
  - eager
  - excited_2
  - excited
  - crawl
  - stand_at_ease
  - rest
  - shake_self
  - back_flip
  - front_flip
  - left_flip
  - right_flip
  - express_affection
  - yawn
  - dance_in_place
  - shake_hand
  - wave_hand
  - draw_heart
  - push_up
  - bow
---

```

```bash
rosrun actionlib_tools axclient.py /agent_skill/do_dog_behavior/execute agent_msgs/ExecuteAction
```

```bash
invoker: 'test_skill'
invoke_priority: 15
hold_time: 3.0
args: '{"behavior": "rest"}'
```

这里的行为列表在 [附录三](/posts/project/weilan-devq-01/#附录三)



### iv. 进阶

本节相关详细说明可查阅下方 Wiki 文档：

- [技能的调用和控制 · AlphaDogDeveloper/agentos_sdk Wiki](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/技能的调用和控制)

- [技能列表及使用介绍 · AlphaDogDeveloper/agentos_sdk Wiki](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/技能列表及使用介绍)

其主要是这一段话 **技能的调用接口通过ros action接口实现，action接口的名称规范为 `/agent_skill/<skill name>/execute`，消息类型为 [agent_msgs/ExecuteAction](https://github.com/AlphaDogDeveloper/agentos_sdk/tree/master/agent_msgs/action/Execute.action)。**

就是对应上面控制运动 **`/agent_skill/set_motion_params/execute`** 、控制技能 **`/agent_skill/do_action/execute`** 、即有行为  **`/agent_skill/do_dog_behavior/execute`** ，可以对应上一节调试动作、控制运动、控制即有行为。

剩下的一些不常用的可以查看**Wiki**进行调试。

### v. 控制 

使用`rosrun actionlib_tools axclient.py /agent_skill/set_motion_params/execute agent_msgs/ExecuteAction` 这种形式测试太麻烦了，做个Demo程序，简化这一操作。

```python title="dogControl.py"
#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import time
import sys
import tty
import termios
import select
import rospy
import actionlib
from agent_msgs.msg import ExecuteAction, ExecuteGoal


class RobotController:
    """机器人控制器类，封装所有控制逻辑"""
    
    def __init__(self):
        # 终端设置
        self.fd = sys.stdin.fileno()
        self.old_settings = termios.tcgetattr(self.fd)
        
        # 移动控制参数
        self.vx = 0.3
        self.wz = 0.3
        self.speed_step = 0.2
        self.max_speed = 3.0
        self.min_speed = 0.3
        
        # 动作映射表
        self.action_map = self.get_action_mapping()
        
        # 初始化ROS节点（延迟到实际需要时）
        self.ros_initialized = False

    def get_action_mapping(self):
        """动作映射表（包含新增动作）"""
        return {
            '0': [0, "急停"],     
            '1': [1, "唤醒"],           
            '2': [3, "恢复站立"],          
            '3': [4, "准备移动"], 
            '4': [2, "趴下"],         
            '5': [5, "坐下"],              
            '6': [20510, "鞠躬"],
            # 新增动作
            '7': [20483, "摇尾巴"],
            '8': [20530, "撒娇"],
            '9': [20491, "伸懒腰"],
            '10': [20482, "转圈"],
            '11': [20481, "抖一抖"],
            '12': [20529, "跳舞"],
            '13': [20541, "握手"],
            '14': [20542, "挥手"],
            '15': [20543, "击掌"],
            '16': [20504, "俯卧撑"],
            '17': [20484, "匍匐"],
            '99': [None, "移动控制模式"]
        }

    def clear_terminal(self):
        """清除终端屏幕"""
        os.system('cls' if os.name == 'nt' else 'clear')

    def init_ros_node(self, node_name):
        """初始化ROS节点（确保只初始化一次）"""
        if not self.ros_initialized and not rospy.core.is_initialized():
            rospy.init_node(node_name, anonymous=True)
            self.ros_initialized = True

    def send_motion_command(self, vx, wz, action_name):
        """发送移动控制指令"""
        try:
            self.init_ros_node('robot_motion_controller')
            
            # 创建动作客户端
            client = actionlib.SimpleActionClient(
                '/agent_skill/set_motion_params/execute', 
                ExecuteAction
            )

            # 等待服务端响应
            if not client.wait_for_server(rospy.Duration(5.0)):
                rospy.logerr("移动控制服务端未响应，请检查服务是否启动！")
                return False

            # 构建移动指令
            goal = ExecuteGoal()
            goal.invoker = 'test_skill'
            goal.invoke_priority = 15
            goal.hold_time = 0.5
            goal.args = f'{{"vx": {vx:.2f}, "wz": {wz:.2f}}}'

            client.send_goal(goal)
            rospy.loginfo(f"发送{action_name}指令: vx={vx:.2f}, wz={wz:.2f}")
            
            # 等待结果
            if not client.wait_for_result(rospy.Duration(2.0)):
                rospy.logwarn(f"{action_name}指令响应超时")
                return False

            result = client.get_result()
            rospy.loginfo(f"{action_name}执行结果: {result.result}")
            return True
            
        except Exception as e:
            rospy.logerr(f"移动指令发送失败: {str(e)}")
            return False

    def send_action_command(self, action_id, action_name):
        """发送基础动作指令"""
        try:
            self.init_ros_node('robot_action_controller')
            
            client = actionlib.SimpleActionClient(
                '/agent_skill/do_action/execute', 
                ExecuteAction
            )

            if not client.wait_for_server(rospy.Duration(10.0)):
                rospy.logerr("基础动作服务端未启动！")
                return None

            goal = ExecuteGoal()
            goal.invoker = 'test_skill'
            goal.invoke_priority = 15
            goal.hold_time = 2.0
            goal.args = f'{{"action_id": {action_id}}}'

            client.send_goal(goal)
            rospy.loginfo(f"发送{action_name}指令 (ID: {action_id})")
            
            if not client.wait_for_result(rospy.Duration(30.0)):
                rospy.logerr(f"{action_name}执行超时")
                return None

            return client.get_result()
            
        except Exception as e:
            rospy.logerr(f"动作指令发送失败: {str(e)}")
            return None

    def print_main_menu(self):
        """打印主菜单（优化对齐）"""
        # 计算最长动作名称的长度
        max_name_length = max(len(name) for _, (_, name) in self.action_map.items())
        total_width = 80 if max_name_length < 6 else 90
        
        print("=" * total_width)
        print("机器人控制中心 (输入序号执行动作，'q'退出)".center(total_width))
        print("=" * total_width)
        
        # 按序号排序
        sorted_actions = sorted(
            self.action_map.items(), 
            key=lambda x: (len(x[0]), int(x[0]))
        )
        
        # 每行显示3个动作，使用格式化字符串对齐
        for i in range(0, len(sorted_actions), 3):
            row = sorted_actions[i:i+3]
            row_items = []
            for seq, (_, action_name) in row:
                # 使用固定宽度格式化，确保对齐
                item = f"{seq:2} - {action_name:{max_name_length}}"
                row_items.append(item)
            # 用制表符分隔列
            print("\t".join(row_items))
        
        print("=" * total_width)

    def print_motion_menu(self):
        """打印移动控制菜单"""
        print("=" * 60)
        print("移动控制模式 (按'b'返回主菜单)")
        print(f"当前速度: vx={self.vx:.2f}, wz={self.wz:.2f}")
        print("=" * 60)
        print("速度调节:")
        print("  q: 增加vx(+0.2)   z: 减少vx(-0.2)")
        print("  w: 增加wz(+0.2)   x: 减少wz(-0.2)")
        print("=" * 60)
        print("方向控制:")
        print("  i/↑: 前进   j/←: 左转")
        print("  l/→: 右转   m/↓: 后退")
        print("  k/空格: 停止")
        print("=" * 60)

    def get_key_non_blocking(self):
        """非阻塞获取键盘输入"""
        tty.setraw(self.fd)
        try:
            if select.select([sys.stdin], [], [], 0.2)[0]:
                key = sys.stdin.read(1)
                # 处理方向键（ESC开头的3字符序列）
                if key == '\x1b':
                    key += sys.stdin.read(2)
                return key
            return None
        except Exception as e:
            print(f"按键捕获错误: {str(e)}")
            return None
        finally:
            termios.tcsetattr(self.fd, termios.TCSADRAIN, self.old_settings)

    def motion_control_mode(self):
        """移动控制模式"""
        last_vx, last_wz = self.vx, self.wz
        self.clear_terminal()
        self.print_motion_menu()

        while True:
            key = self.get_key_non_blocking()
            key_processed = False
            
            # 处理多字符按键（方向键）
            if key and len(key) >= 3:
                full_key = key[:3]
                if full_key == '\x1b[A':  # 上方向键
                    self.send_motion_command(self.vx, 0.0, "前进")
                    key_processed = True
                elif full_key == '\x1b[B':  # 下方向键
                    self.send_motion_command(-abs(self.vx), 0.0, "后退")
                    key_processed = True
                elif full_key == '\x1b[D':  # 左方向键
                    self.send_motion_command(0.0, self.wz, "左转")
                    key_processed = True
                elif full_key == '\x1b[C':  # 右方向键
                    self.send_motion_command(0.0, -abs(self.wz), "右转")
                    key_processed = True
        
            # 处理单字符按键
            if not key_processed and key:
                if key == 'i':
                    self.send_motion_command(self.vx, 0.0, "前进")
                elif key == 'm':
                    self.send_motion_command(-abs(self.vx), 0.0, "后退")
                elif key == 'j':
                    self.send_motion_command(0.0, self.wz, "左转")
                elif key == 'l':
                    self.send_motion_command(0.0, -abs(self.wz), "右转")
                elif key == 'k' or key == ' ':
                    self.send_motion_command(0.0, 0.0, "停止")
                elif key == 'q':
                    self.vx = min(self.vx + self.speed_step, self.max_speed)
                elif key == 'z':
                    self.vx = max(self.vx - self.speed_step, self.min_speed)
                elif key == 'w':
                    self.wz = min(self.wz + self.speed_step, self.max_speed)
                elif key == 'x':
                    self.wz = max(self.wz - self.speed_step, self.min_speed)
                elif key == 'b':
                    print("返回主菜单...")
                    self.send_motion_command(0, 0, "退出移动模式-停止")
                    time.sleep(0.5)
                    return
        
            # 刷新判断
            if key or (self.vx != last_vx) or (self.wz != last_wz):
                self.clear_terminal()
                self.print_motion_menu()
                last_vx, last_wz = self.vx, self.wz
        
            if not key:
                time.sleep(0.05)
                continue
            
            time.sleep(0.1)

    def safe_shutdown(self):
        """安全退出流程"""
        print("\n开始安全退出...")
        # 执行趴下动作
        lie_down_id, lie_down_name = self.action_map['4']
        self.send_action_command(lie_down_id, lie_down_name)
        
        # 执行急停
        stop_id, stop_name = self.action_map['0']
        self.send_action_command(stop_id, stop_name)
        
        print("安全退出完成！")

    def main_loop(self):
        """主循环"""
        try:
            while True:
                self.clear_terminal()
                self.print_main_menu()
                
                user_input = input("请输入动作序号或'q'退出: ").strip().lower()
                
                if user_input == 'q':
                    self.safe_shutdown()
                    break
                
                if user_input in self.action_map:
                    action_id, action_name = self.action_map[user_input]
                    
                    if user_input == '99':
                        print("进入移动控制模式前，先执行准备移动动作...")
                        # 获取准备移动动作的ID和名称
                        prepare_move_id, prepare_move_name = self.action_map['3']
                        # 执行准备移动动作
                        result = self.send_action_command(prepare_move_id, prepare_move_name)
                        
                        # 检查准备移动动作是否成功执行
                        if result:
                            print("准备移动完成，进入移动控制模式...")
                            self.motion_control_mode()
                        else:
                            print("准备移动动作执行失败，无法进入移动控制模式！")
                        
                    else:
                        rospy.loginfo(f"执行{action_name} (序号: {user_input})")
                        self.send_action_command(action_id, action_name)
                else:
                    print(f"无效输入: '{user_input}'，请重试")
                    time.sleep(1)
        finally:
            termios.tcsetattr(self.fd, termios.TCSADRAIN, self.old_settings)


if __name__ == '__main__':
    try:
        controller = RobotController()
        controller.main_loop()
    except rospy.ROSInterruptException:
        rospy.loginfo("程序被ROS中断")
    except Exception as e:
        rospy.logerr(f"程序出错: {str(e)}")
```



# 4. Robodog

这是一个个人开发者写的 Python API ,虽说他写明主要是用 **GitHub Copilot** 进行开发，但是这个写的真的挺好，这是他的计划表。

![image-20260811121209870](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811121210139.webp)

Github地址在文章开头，本章节应该是看看这个怎么使用与搭建，这个可能不是在机器狗端部署的，是部署在控制端的。



# 附录一

[动作列表 · AlphaDogDeveloper/agentos_sdk Wiki](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/动作列表)

> [!NOTE]
>
> **do_action**
>
> execute args
>
> | 字段      | 类型 | 示例 | 说明                                                         |
> | --------- | ---- | ---- | ------------------------------------------------------------ |
> | action_id | int  | 1    | 动作 ID。详见 [动作列表](https://github.com/AlphaDogDeveloper/agentos_sdk/wikis/动作列表) |
>
> **Note**: 获取机器狗支持的动作列表：`rostopic echo /agent_skill/do_action/ext_actions`
>
> ```bash
> # 示例，趴下:
> {"action_id": 2}
> ```
>
> ```bash
> # 站立:
> {"action_id": 4}
> ```
>
> [↑返回](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/技能列表及使用介绍#原始技能)

![image-20260811121326866](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811121327391.webp)

# 附录二

**设置运动参数 set_motion_params**

> [!NOTE]
>
> 可设置的参数参考: [运动控制参数](https://github.com/AlphaDogDeveloper/agentos_sdk/wikis/运动控制参数)
>
> 示例，机器狗以 0.1m/s 的速度和 0.2rad/s 的角速度行走:
>
> ```bash
> invoker: 'test_skill'
> invoke_priority: 15
> hold_time: 3.0
> args: '{"swing_traj_type":Elegant}'
> ```
>
> ```bash
> invoker: 'test_skill'
> invoke_priority: 15
> hold_time: 3.0
> args: '{"user_mode":EXTREME}'
> ```
>
> ```bash
> invoker: 'test_skill'
> invoke_priority: 15
> hold_time: 3.0
> args: '{"gait":FREEWALKING}'
> ```
>



可通过调用 `set_motion_params` 来设置以下参数。

| 字段                | 类型    | 单位  | 描述                                                         |
| ------------------- | ------- | ----- | ------------------------------------------------------------ |
| user_mode           | int32   | N/A   | 用户模式，参考 **[用户模式](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/运动控制参数#用户模式)**。 |
| gait                | int32   | N/A   | **[极限模式](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/运动控制参数#用户模式)**下行走时的步态，参考 [运动步态](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/运动控制参数#运动步态)。同时作用于所有遥控器。 |
| swing_traj_type     | int32   | N/A   | 行走时的摆腿轨迹类型，参考 **[摆腿轨迹类型](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/运动控制参数#摆腿轨迹类型)** |
| ground_model        | int32   | N/A   | 地面模型，参考 **[地面模型](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/运动控制参数#地面模型).** |
| vx                  | float32 | m/s   | 前后移动速度。向前为正。                                     |
| vy                  | float32 | m/s   | 左右移动速度。向左为正。                                     |
| wz                  | float32 | rad/s | 旋转速度。绕竖直向上的轴（z轴）顺时针旋转为正。              |
| roll                | float32 | rad   | 身体的横滚角度。                                             |
| pitch               | float32 | rad   | 身体的俯仰角度。                                             |
| yaw                 | float32 | rad   | 身体的偏航角度。                                             |
| body_tilt_x         | float32 | m     | 机器狗身体的前后偏移距离。向前为正。                         |
| body_tilt_y         | float32 | m     | 机器狗身体的左右偏移距离。向左为正。                         |
| body_height         | float32 | m     | 机器狗的身体高度。以四个脚落地时的平均高度为参考基准。       |
| foot_height         | float32 | m     | 摆腿时的抬脚高度。                                           |
| swing_duration      | float32 | s     | 腿的摆动周期，结合步态类型决定了步频。                       |
| friction            | float32 | N/A   | 机器狗足底和地面之间的摩擦系数。                             |
| scale_x             | float32 | N/A   | 支撑面 x 方向（机器狗身体前后方向）的大小缩放比例。默认不缩放，为 1。 |
| scale_y             | float32 | N/A   | 支撑面 y 方向（机器狗身体左右方向）的大小缩放比例。默认不缩放，为 1。 |
| free_leg            | int32   | N/A   | 在录制自定义动作时的自由腿的序号。                           |
| swaying_duration    | float32 | s     | 机器狗在做左右摇摆动作时的摇摆周期。                         |
| jump_distance       | float32 | m     | 向前跳跃距离。                                               |
| jump_angle          | float32 | rad   | 跳跃旋转的角度。                                             |
| decelerate_time     | float32 | s     | 3.0                                                          |
| decelerate_duration | float32 | s     | 3.0                                                          |
| velocity_decay      | float32 | N/A   | 设置指令速度的衰减比例。同时作用于所有遥控器。               |
| collision_protect   | int32   | N/A   | 碰撞保护功能是否开启（开启：1，关闭：0）。                   |

## a. 用户模式

| ID   | 名称           | 描述                                     |
| ---- | -------------- | ---------------------------------------- |
| 1    | EXTREME        | 极限模式。手动操控，极限性能。           |
| 2    | KIDS           | 儿童模式。视觉辅助移动，安全、缓慢。     |
| 3    | NORMAL         | 普通模式。视觉辅助自动切换步态。         |
| 4    | DANCE          | 舞蹈模式。表演舞蹈动作。                 |
| 5    | QUIET          | 比较安静的模式。视觉辅助移动，比较缓慢。 |
| 6    | MUTE           | 静音模式。静态步态移动。非常缓慢。       |
| 7    | LONG_ENDURANCE | 长续航模式。仅支持在平坦路面上使用。     |

## b. 运动步态

| ID   | 名称             | 描述                                                         |
| ---- | ---------------- | ------------------------------------------------------------ |
| 0    | TROTTING         | 对角步态。稳定性较好，速度适中。                             |
| 1    | TROTRUNNING      | 对角奔跑步态。速度最快。                                     |
| 2    | TROTWALKING      | 缓慢的对角行走步态。速度较慢。                               |
| 3    | FREETROTTING     | 自由对角步态。会自动根据速度调节步态，包括平衡站立。稳定性和速度兼具。 |
| 4    | STANDING         | 平衡站立。站立在原地并保持平衡。                             |
| 5    | BOUNDING         | 跳跑步态。前后两对脚交替摆动，身体会自然前后俯仰。           |
| 6    | PACING           | 踱步步态。左右两对脚交替摆动，身体会自然左右侧倾。           |
| 7    | PRONKING         | 跳跃步态。四条腿一齐摆动、一齐落地。身体会上下跳跃。         |
| 8    | WALKING          | 行走步态。按照常规四足动物行走时的摆腿顺序。                 |
| 9    | GALLOPING        | 疾驰步态。类似于马奔跑时的摆腿顺序。                         |
| 10   | BRISKTROTWALKING | 比 TROTWALKING 稍快的对角步态。                              |
| 11   | STATICWALKING    | 准静态缓慢行走。                                             |
| 12   | BRISKWALKING     | 准静态竞走。                                                 |
| 13   | FASTWALKING      | 准静态快速行走。                                             |
| 14   | FREEWALKING      | 自由准静态行走步态。会根据速度指令自动调节步态。             |
| 15   | FREESTATIC       | 自由静态步态。移动中保持静态稳定。会根据速度调节摆腿周期。   |

## c. 摆腿轨迹类型

| ID   | 名称           | 描述                                     |
| ---- | -------------- | ---------------------------------------- |
| 0    | Efficient      | 高效率的摆腿轨迹类型，更省电。           |
| 1    | General        | 通用的摆腿轨迹类型，适合大多数场景。     |
| 2    | Avoid obstacle | 更适合跨越障碍物和上楼梯的摆腿轨迹类型。 |
| 3    | Elegant        | 一种看起来比较优雅的摆腿轨迹。           |
| 4    | Compliant      | 一种避免髋关节转动的摆腿轨迹。           |

## d. 地面模型

| ID   | 名称     | 描述                                       |
| ---- | -------- | ------------------------------------------ |
| 0    | HORIZEN  | 保持身体水平，即 Roll 和 Picth 角度都为 0. |
| 1    | OBSTACLE | 身体姿态自适应地形坡度。                   |
| 2    | STAIRS   | 适合于上下楼梯。                           |
| 3    | SLOPE    | 斜坡地形。                                 |
| 4    | COMMON   | 通用地形。                                 |

## e. 运动控制模式

| ID   | 名称           | 描述                           |
| ---- | -------------- | ------------------------------ |
| 0    | OFF            | 机器人停止工作，处于待机状态。 |
| 1    | LIEDOWN        | 站立并缓慢趴下。               |
| 2    | RECOVERY_STAND | 从翻身的状态恢复并站立。       |
| 3    | LOCOMOTION     | 移动。                         |

## f. EStop 状态

| Value | 描述                                                         |
| ----- | ------------------------------------------------------------ |
| 0     | 正常状态。                                                   |
| 1     | 用户主动停止。                                               |
| 2     | 因为与执行器相关的故障而自动停止。                           |
| 4     | 因为其他故障而停止。例如身体翻倒。                           |
| 8     | 因为发生[错误](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/运动控制参数#错误码)或者某些[警告](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/运动控制参数#警告码)而进入了保护状态。机器狗将自动趴下然后停止。用户可以通过主动 EStop 来退出该保护状态。 |

## g. 错误码

| 数值   | 描述                     |
| ------ | ------------------------ |
| 0x0000 | 没有错误。               |
| 0x0001 | 错误的参数配置。         |
| 0x0002 | 初始化 SBUS 接受器失败。 |
| 0x0004 | 初始化 IMU 失败。        |
| 0x0008 | 初始化 SPI 失败。        |
| 0x0010 | 初始化 Ethecat 失败。    |
| 0x0020 | SBUS 接受器断开。        |
| 0x0040 | IMU 断开。               |
| 0x0080 | SPI 通信断开。           |
| 0x0100 | Ethercat 断开。          |
| 0x0200 | 执行器掉线。             |
| 0x0800 | 执行器错误。             |
| 0x1000 | 电池保护                 |

## h. 警告码

| 数值       | 描述                                                         |
| ---------- | ------------------------------------------------------------ |
| 0x00000000 | 没有警告。                                                   |
| 0x00000001 | 初始化 BMS 失败。                                            |
| 0x00000002 | 没有 BMS。                                                   |
| 0x00000004 | 未知的 BMS 类型。                                            |
| 0x00000008 | 读取 SBUS 数据失败。                                         |
| 0x00000010 | 读取 IMU 数据失败。                                          |
| 0x00000020 | 读取 SPI 数据失败。                                          |
| 0x00000040 | 读取 Ethercat 数据失败。                                     |
| 0x00000080 | 无效的 SPI 数据。                                            |
| 0x00000100 | 执行器过热。                                                 |
| 0x00000200 | 电流过高。                                                   |
| 0x00000400 | 动作过于激烈。                                               |
| 0x00000800 | 有执行器报警。                                               |
| 0x00001000 | 身体上下翻倒。                                               |
| 0x00002000 | 不能站立。                                                   |
| 0x00004000 | 执行器回零检查动作超时。                                     |
| 0x00008000 | 执行器将要过热。                                             |
| 0x00010000 | 电量不足。                                                   |
| 0x00020000 | 遥控器失联。                                                 |
| 0x00040000 | 执行器报警，需要休息一会才能继续使用。                       |
| 0x00080000 | 检测到身体发生碰撞。朝向碰撞方向的速度指令将被限制，需要发送反方向（包括 0）的速度指令来解除限制。 |
| 0x00100000 | 将要放生碰撞。指令速度可能会被限制。                         |

## i. 遥控器类型

| 字段 | 类型     | 描述                                                         |
| ---- | -------- | ------------------------------------------------------------ |
| 1    | SBUS     | SBUS 遥控器，可以控制主要的几个动作、速度、身高等大多数功能。 |
| 2    | ROS/WIFI | ROS 控制器，或者 Wifi 控制器。具备完整的遥控功能。           |
| 3    | LEASH    | 仅仅是一根狗绳。可以控制速度，包括转弯，还可以通过按压机器狗使其趴下。 |

# 附录三

**全部行为列表**，具体哪些可以执行需要输入 `rostopic echo /agent_skill/do_dog_behavior/dog_behaviors` 进行查看。

[行为列表 · AlphaDogDeveloper/agentos_sdk Wiki](https://github.com/AlphaDogDeveloper/agentos_sdk/wiki/行为列表)

图片最后缺了三个，不影响，可以去**Wiki**查看。

![image-20260811121742310](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811121742978.webp)



---

