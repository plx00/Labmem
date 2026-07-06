---
title: Unitree 机器狗（二）：ROS导航
published: 2026-03-19
updated: 2026-07-03
description: 宇树机器狗 Go2-Air相关的二次开发
image: /assets/bolg_cover/unitree-02.webp
tags: [机器狗, ROS, 自动导航]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

**[Unitree 机器狗（一）：运动控制](/posts/project/unitree-01/)**

>本文档用于记录摩方M6s N100平台下，宇树机器狗Go2 Air版本相关的ROS控制开发、功能测试、联调调试等相关工作，作为项目过程追溯、参数参考、问题排查的基础依据，后续内容可根据实际项目需求补充完善。

- **基础环境**
  
  | **主机设备**   | 摩方M6s N100                                                 |
  | -------------- | ------------------------------------------------------------ |
  | **操作系统**   | Ubuntu 20.04 LTS                                             |
  | **传感器设备** | 思岚 A1M8                                                    |
  | **ROS版本**    | ROS Noetic Ninjemys                                          |
  | **补充说明**   | 本环境为项目/测试的基础运行环境，后续所有操作均基于此环境开展，若环境有变更，需在文档中同步更新。 |
  
- **参考链接**
  
  | **[GitHub - abizovnuralem/go2_ros2_sdk](https://github.com/abizovnuralem/go2_ros2_sdk)** |
  | ------------------------------------------------------------ |
  | **[GitHub - legion1581/unitree_webrtc_connect](https://github.com/legion1581/unitree_webrtc_connect)** |
  | **[GitHub - phospho-app/go2_webrtc_connect](https://github.com/phospho-app/go2_webrtc_connect)** |
  | **[宇树科技 文档中心](https://support.unitree.com/home/zh/developer/Obtain%20SDK)** |
  | **[timer/GO2GO](https://gitee.com/simon_133/go2-go)**        |
  | **[GitHub - legion1581/go2_firmware_tools](https://github.com/legion1581/go2_firmware_tools)** |
  | **[unitree-go2-slam-nav2](https://relatedrepos.com/gh/h-naderi/unitree-go2-slam-nav2)** |
  | **[DarrenPig (darrenpig) - Gitee.com](https://gitee.com/darrenpig)** |

本文件将在上述基础环境的框架下，详细记录项目开发、测试验证等相关工作的进展。各具体模块可根据实际需求灵活规划与补充。鉴于篇幅及内容聚焦考量，有关系统安装及部分常用配置的具体细节将不做赘述。

> [!TIP]
>
> 使用 ROS1 在 Ubuntu20.04 系统中进行控制宇树机器狗进行简单的 2D 建图与 2D 导航，实现点对点导航跟沿途避障。
>
> **项目目录如下：**
>
> **navdgu_ws/**
>
> - **sdk/**							# unitree_webrtc_connect 包存放地址，机器狗控制驱动
> - **src/**							# ROS1 工作空间 src 目录，全部是关于机器狗导航的功能包
>   - **goe_auto_start/**			 # 一键启动导航/建图
>   - **goe_ros/**					 
>     - **goe_bringup/**			  # 各种传感器综合控制
>     - **unitree_description/**	  # URDF 描述文件
>     - **unitree_driver/**		  # 底层运动驱动
>     - **unitree_msgs/**		  # 专用消息包
>   - **goe_slam_nav/**			 # 导航/建图配置、参数、启动等
>   - **goe_tools/**				 
>     - **rf2o_laser_odometry/**	  # 雷达 /scan 消息转为 /odom
>     - **robot_localization/**	  # /odom 融合
>     - **rplidar_ros/**			  # 司岚 A1M8 激光雷达驱动
>     - **wit_ros_imu/**			  # WT61C 陀螺仪驱动
> - **test/**					       # unitree_webrtc_connect 包的各种测试案例

# 1. 相关配置

## a. 烧录系统

依照相关的设置烧录即可，只需要看版本是哪个，宇树机器狗的用户名与管理员密码统一定为以下字段

| **用户名** | **密码** |
| ---------- | -------- |
| unitree    | unitree  |

## b. ROS1 安装

```bash
# 鱼香ROS 一键安装
wget http://fishros.com/install -O fishros && . fishros
```

依照下面的选择 **noetic** 版本

```ini
请选择你要安装的ROS版本名称(请注意ROS1和ROS2区别):
[1]:foxy(ROS2)
[2]:galactic(ROS2)
[3]:noetic(ROS1)
[4]:rolling(ROS2)
[0]:quit
请输入[]内的数字以选择:3
RUN Choose Task:[请输入括号内的数字]
请选择安装的具体版本(如果不知道怎么选,请选1桌面版):
[1]:noetic(ROS1)桌面版
[2]:noetic(ROS1)基础版(小)
[0]:quit
请输入[]内的数字以选择:1
```

## c. 局域网通信

通过以太网线(六类网线)连接主控板与机器狗进行通信，需配置两台为同一网段，宇树机器狗的网络频段为 `192.168.123.161`

> [!TIP]
>
> **设置宇树机器狗 IP 为 `192.168.123.161` 时的注意事项**
>
> 在设置 IP 之前，需要注意以下两点之一：
> - 提前通过“一键ROS”脚本安装好 ROS；
> - 若在安装过程中遇到问题，请先关闭有线网络连接。
>
> 否则，在执行 `RUN Choose Task:` 并输入括号内数字后，系统会提示检测到多个 ROS 镜像源，要求选择：
>
> ```plain
> 检测到您的系统支持多个ROS镜像源，请选择您想要使用的ROS镜像源(默认清华)：
> [1]:中科大镜像源 (推荐国内用户使用)
> [2]:清华镜像源 (容易被封禁)
> [3]:华为镜像源
> [4]:中山大学开源软件镜像站 (试运行)
> [5]:ROS官方源 (国外用户或需要最新版本时使用)
> [0]:quit
> 请输入[]内的数字以选择:1
> ```
>
> 此时会出现以下错误：
>
> ```plain
> [/][6.22s] 错误:6 http://mirrors.tuna.tsinghua.edu.cn/ros2/ubuntu focal InReleas[-][10.63s] CMD Result:code:100
> apt更新失败,后续程序可能会继续尝试...,[]
> Run CMD Task:[sudo apt search ros-base ]
> [-][0.92s] CMD Result:success
> 换源后更新失败，您可以重新选择镜像源再尝试！
> ```
>
> **错误原因**：选择了清华源（选项2）或中科大源（选项1）后，APT 更新仍然失败。建议在安装 ROS 前关闭有线连接，或更换为其他可用镜像源（如华为源）重试。

### i. 有界面配置

可以参考 [宇树科技 文档中心](https://support.unitree.com/home/zh/developer/Quick_start)，需要通过一些必要的配置步骤将这两台电脑组成一个局域网。

**配置步骤：**

1. **配置网段**

   用网线的一端连接Go2机器人，另一端连接用户电脑，并开启电脑的 USB Ethernet 后进行配置。机器狗机载电脑的 IP 地地址为 192.168.123.161，故需将电脑 USB Ethernet 地址设置为与机器狗同一网段，如在 Address 中输入 192.168.123.222 (“222”可以改成其他)。

   ![1779092024717-c6feaa75-a11b-4ed7-8588-7421cea5d981](https://vip.123pan.cn/1831996731/a_PicBed/project/unitree/20260702235405388.webp)

   ![img](https://vip.123pan.cn/1831996731/a_PicBed/project/unitree/20260702235425565.webp)
   为了测试用户电脑与Go2机器人内置电脑是否正常连接，可在终端中输入 `ping 192.168.123.161` 进行检测，出现下图类似内容即为连接成功。

   ![img](https://vip.123pan.cn/1831996731/a_PicBed/project/unitree/20260702235725347.webp)

2. **查看123网段对应的网卡名字**
   通过ifconfig命令查看123网段的网卡名字，如下图所示:

   ![img](https://vip.123pan.cn/1831996731/a_PicBed/project/unitree/20260703000002004.webp)
   
   如上图所示，ip 为 192.168.123.222 对应的网卡名字为 enxf8e43b808e06。用户需要记住此名字，在运行例程时其将会作为必要参数。

### ii. 无界面配置

通过修改 `/etc/netplan/` 目录下的文件来实现

```bash
sudo nano /etc/netplan/50-cloud-init.yaml
# 或
sudo gedit /etc/netplan/50-cloud-init.yaml
network:
    version: 2
    renderer: networkd  # 统一使用networkd渲染器
    ethernets:
        enp2s0:  # 有线网卡，用于连接机器狗(改为自己实际的接口名称)
            dhcp4: no  # 关闭DHCP
            addresses: [192.168.123.222/24]  # 静态IP（与机器狗同网段）
            optional: true
    wifis:
        wlp1s0:
            access-points:
                ESTEAM_5G:
                    hidden: true
                    password: "Ysd13579"
            dhcp4: true  # Wi-Fi保持DHCP自动获取
            optional: true
```

配置生效  `sudo netplan apply`

## d. Cartographer 安装

参考安装：[Cartographer](/posts/ros/ros-package/#a-cartographer)

## e. 其他

### i. 常用工具

```bash
# 网络检测
sudo apt install net-tools
```

### ii. 宇树机器狗 IP 全局设置

程序与宇树机器狗通信依赖设备 IP 地址，为避免多处重复修改地址、提升维护效率，采用全局变量统一存放通信 IP。

#### 1. 单个机器狗

```bash
# 在 ~/.bashrc 文件中添加宇树机器狗的 IP 地址配置
echo 'export UNITREE_IP="192.168.123.161"' >> ~/.bashrc
source ~/.bashrc
```

**在 Python 代码中引用：**

```python
import os

# 从环境变量读取 IP，若未设置则使用默认值
UNITREE_IP = os.environ.get('UNITREE_IP', '192.168.123.161')
```

> **优点**：以后切换为无线网络或更换局域网时，只需修改 `~/.bashrc` 中的 `UNITREE_IP` 变量即可，无需改动代码。

#### 2. 多个机器狗(群控)

```python
import os

# 支持多个机器狗 IP，用逗号分隔
UNITREE_IPS = os.environ.get('UNITREE_IPS', '192.168.123.161').split(',')
PRIMARY_IP = UNITREE_IPS[0]

print(f"主机器狗: {PRIMARY_IP}")
print(f"所有机器狗: {UNITREE_IPS}")
```

对应的 `.bashrc` 配置：

```bash
export UNITREE_IPS="192.168.123.161,192.168.123.162,192.168.123.163"
```

### iii. 消除rviz警告

```bash
# 在 ~/.bashrc 文件中消除rviz警告配置
echo 'export DISABLE_ROS1_EOL_WARNINGS=1' >> ~/.bashrc
source ~/.bashrc
```

![img](https://vip.123pan.cn/1831996731/a_PicBed/project/unitree/20260703000915560.webp)

# 2. 功能包说明

简单介绍所有的包的创建、文件内容以及部分配置，详细内容请查看项目代码。

```bash
# 1. 创建工作空间目录并初始化
mkdir -p ~/navdgu_ws/src
cd ~/navdgu_ws
catkin init

# 2. 编译工作空间
catkin build

# 3 将工作空间的 devel/setup.bash 永久加入 ~/.bashrc
echo "source ~/navdgu_ws/devel/setup.bash" >> ~/.bashrc
source ~/.bashrc

# 4. 立即在当前终端生效
source ~/navdgu_ws/devel/setup.bash
```

## a. goe_auto_start

```bash
cd ~/navdgu_ws/src/
catkin_create_pkg goe_auto_start rospy roscpp  geometry_msgs std_msgs 
cd ~/navdgu_ws && catkin build
```

主要是导航/建图运行脚本(待完善)

```bash
unitree@unitree:~/navdgu_ws/src/goe_auto_start/scripts$ ls
navigate_multi_start  navigate_start  navigate_stop  slam_start  slam_stop
```

launch/目录（待完善）

## b. goe_ros

### i. goe_bringup

```bash
cd ~/navdgu_ws/src/goe_ros
catkin_create_pkg goe_bringup rospy roscpp  geometry_msgs std_msgs 
cd ~/navdgu_ws && catkin build
unitree@unitree:~/navdgu_ws/src/goe_ros$ tree goe_bringup/
goe_bringup/
├── CMakeLists.txt
├── config
│   ├── ekf_rf2o.yaml        							# ekf融合-激光雷达odom与机器狗IMU
│   └── ekf_unitree.yaml                  # ekf融合-机器狗odom与机器狗IMU
├── include
│   └── goe_bringup
├── launch
│   ├── include
│   │   ├── camera.launch								  # 摄像头
│   │   ├── rf2o.launch										# 激光雷达odom
│   │   ├── rplidar.launch                # 激光雷达
│   │   ├── unitree_description.launch    # 宇树机器狗模型  
│   │   └── unitree_driver.launch         # 宇树机器狗驱动  
│   └── robot_unitree.launch              # 总体启动
├── package.xml
├── scripts
│   ├── lidar_avoidance.py                # 雷达检测
│   ├── pub_usbcam.py                     # 摄像头节点发布
│   └── tf_echo.py                        # TF树关系图终端打印 
└── src

7 directories, 13 files
```

这是一个所有传感器启动的总包，启动命令

```bash
roslaunch goe_bringup robot_unitree.launch
```

### ii. unitree_description

- **模型包**

  - **官网地址：** [宇树科技 文档中心](https://support.unitree.com/home/zh/developer/Obtain%20SDK)

    ![image-20260514095240148.png](https://vip.123pan.cn/1831996731/a_PicBed/project/unitree/20260703001047015.webp)

  - **123备份：**[Go2_URDF.zip(13.5 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-jKz6v)

然后将其中的文件复制到对应自己创建的功能包中修改相应文件即可

```bash
cd ~/navdgu_ws/src/goe_ros
catkin_create_pkg unitree_description rospy roscpp  geometry_msgs std_msgs urdf xacro joint_state_publisher robot_state_publisher rviz 
cd ~/navdgu_ws && catkin build
unitree@unitree:~/navdgu_ws/src/goe_ros$ tree unitree_description/
unitree_description/
├── CMakeLists.txt
├── config
│   ├── joint_names_go2_description.yaml
│   └── robot_control.yaml
├── dae
│   ├── base.dae
│   ├── calf.dae
│   ├── calf_mirror.dae
│   ├── foot.dae
│   ├── hip.dae
│   ├── thigh.dae
│   └── thigh_mirror.dae
├── include
│   └── unitree_description
├── launch
│   ├── check_joint_rplidar.rviz
│   ├── check_joint.rviz
│   ├── go2_rplidar_rviz.launch
│   └── go2_rviz.launch
├── meshes
│   └── rplidar.stl
├── package.xml
├── src
└── urdf
    ├── Amended_collision_model.png
    ├── go2_description.urdf
    ├── go2_rplidar.urdf
    └── Normal_collision_model.png

8 directories, 20 files
```

#### **1. 修改launch**

将 go2_description 功能包部分改为unitree_description

```xml
<launch>

    <!-- 调试模式参数 -->
    <arg name="user_debug" default="false"/>
    
    <!-- 加载机器人URDF模型 -->
    <param name="robot_description" textfile="$(find unitree_description)/urdf/go2_description.urdf" />

    <!-- 提高robot_state_publisher的平均发布频率（可选）-->
    <!-- <param name="rate" value="1000"/> -->

    <!-- 启动关节状态发布器GUI，可手动调节关节角度 -->
    <node pkg="joint_state_publisher_gui" type="joint_state_publisher_gui" name="joint_state_publisher_gui">
        <param name="use_gui" value="TRUE"/>
    </node>

    <!-- 启动机器人状态发布器，计算机器人各连杆的TF变换 -->
    <node pkg="robot_state_publisher" type="robot_state_publisher" name="robot_state_publisher">
        <param name="publish_frequency" type="double" value="1000.0"/>
    </node>

    <!-- 启动RViz可视化工具 -->
    <node pkg="rviz" type="rviz" name="rviz" respawn="false" output="screen"
        args="-d $(find unitree_description)/launch/check_joint.rviz"/>

</launch>
```

#### **2. 修改 URDF 文件**

**修改URDF文件中所有 go2_description 包名为 unitree_description 包名**

#### **3. dae 改小**

dae文件太大，rviz打开卡顿，将文件改小一些

```bash
pip install pymeshlab
```

相关处理程序

```python title="simplify_target_faces.py"
import pymeshlab
import os
# 对应文件夹（依据实际路径进行修改）
os.chdir('/home/unitree/桌面/GO2_URDF/dae3')

# 修改面数达到改小dae文件体积
# 目标面数配置（大幅减少）
face_targets = {
     # 原始面数: 77928
    'base.dae': 16000,       
     # 原始面数: 37040
    'hip.dae': 7000,        
     # 原始面数: 30134
    'thigh.dae': 6000,     
    'thigh_mirror.dae': 6000,
     # 原始面数: 8602
    'calf.dae': 1600,       
    'calf_mirror.dae': 1600,
     # 原始面数: 4404
    'foot.dae': 800,       
}

print("开始批量简化模型（使用目标面数）...\n")

for filename, target_faces in face_targets.items():
    if not os.path.exists(filename):
        print(f"文件不存在，跳过: {filename}")
        continue
    
    print(f"正在处理: {filename} (目标面数: {target_faces})")
    
    try:
        ms = pymeshlab.MeshSet()
        ms.load_new_mesh(filename)
        
        original_faces = ms.current_mesh().face_number()
        original_size = os.path.getsize(filename) / (1024*1024)
        print(f"  原始面数: {original_faces}, 原始大小: {original_size:.2f}MB")
        
        # 使用目标面数
        ms.apply_filter('meshing_decimation_quadric_edge_collapse', 
                        targetfacenum=target_faces)
        
        new_faces = ms.current_mesh().face_number()
        
        output_name = filename.replace('.dae', '_simplified.dae')
        ms.save_current_mesh(output_name)
        
        new_size = os.path.getsize(output_name) / (1024*1024)
        reduction = (1 - new_faces/original_faces) * 100
        print(f"  简化后: {new_faces} 面数 (减少 {reduction:.1f}%), 大小: {new_size:.2f}MB\n")
        
    except Exception as e:
        print(f"  处理失败: {e}\n")

print("所有文件处理完成！")
```

#### **4. 其他**

总共在原功能包上修改了 launch 文件内容、urdf 文件、dae 文件大小、urdf 文件添加雷达部分、删除没必要的部分。

并且我查看 [go2_ros2_sdk](https://github.com/abizovnuralem/go2_ros2_sdk) 项目时，他这里面也有对应的 URDF 文件，但是没试验，因为他的 **meshes/** 下的 STL 文件体积也不小（10 多 MB）。

### iii. unitree_driver

```bash
cd ~/navdgu_ws/src/goe_ros
catkin_create_pkg unitree_driver rospy roscpp geometry_msgs std_msgs
cd ~/navdgu_ws && catkin build
unitree@unitree:~/navdgu_ws/src/goe_ros$ tree unitree_driver/
unitree_driver/
├── CMakeLists.txt
├── include
│   └── unitree_driver
├── package.xml
├── scripts
│   └── webrtc_client.py
└── src

4 directories, 3 files
```

这个功能包只有一个文件 `webrtc_client.py`，主要是利用 **unitree_webrtc_connect** 与机器狗进行通信。

```python title="webrtc_client.py"
#!/usr/bin/env python3
"""
webrtc_client.py - 宇树 Go2 机器狗 ROS 驱动节点

本文件是 go2_webrtc_driver 功能包的唯一核心节点，基于 unitree_webrtc_connect 库实现。
通过 WebRTC 协议与宇树 Go2 机器狗建立低延迟通信，完成运动控制、状态采集与 ROS 话题发布。

【主要功能】
- 控制接口：订阅 /cmd_vel 话题，将线速度/角速度指令转发给机器狗（限幅 ±2.5）
- 安全机制：节点启动时自动执行“站立 → 恢复站立”，退出时自动执行“恢复站立 → 趴下”
- 状态发布：
  * /go2/lowstate       - 原始底层状态（电机、BMS、足端力、温度等）
  * /go2/sportmodestate - 运动状态（位置、速度、IMU、步态类型等）
  * /go2/odom           - 标准里程计（位置、姿态、速度）
  * /go2/joint_states   - 标准关节状态（12 个运动关节的角度、角速度）
  * /go2/imu            - 标准 IMU 数据（四元数、角速度、线加速度）

【依赖库】
- unitree_webrtc_connect：宇树官方 WebRTC 通信库，负责底层连接与数据收发
- rospy / unitree_msgs：ROS 通信与消息定义
- 环境变量 UNITREE_IP：机器狗 IP 地址（默认 192.168.123.161）

【使用方法】
1. 设置机器狗 IP（可选）：
   export UNITREE_IP="192.168.123.161"
2. 启动节点：
   rosrun go2_webrtc_driver webrtc_client.py
3. 发送运动指令：
   rostopic pub /cmd_vel geometry_msgs/Twist '{linear: {x: 0.5}}'

【注意事项】
- 机器狗需要与主机处于同一局域网（有线或无线均可）
- 节点启动后会立即让机器狗站立，请确保周围有足够空间
- 退出节点时（Ctrl+C）会自动执行趴下动作，无需手动干预
"""

import asyncio
import logging
import sys
import threading
import json

import rospy
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
from geometry_msgs.msg import Pose, Point, Quaternion as GeoQuat
from geometry_msgs.msg import Twist as GeoTwist, Vector3
from std_msgs.msg import Header
from sensor_msgs.msg import JointState, Imu
from unitree_msgs.msg import (LowState, SportModeState,
                               IMU, MotorState, BmsState, TimeSpec)

from unitree_webrtc_connect.webrtc_driver import UnitreeWebRTCConnection, WebRTCConnectionMethod
from unitree_webrtc_connect.constants import RTC_TOPIC, SPORT_CMD
import os

UNITREE_IP = os.environ.get('UNITREE_IP', '192.168.123.161')
logging.basicConfig(level=logging.WARN)

# 速度限幅
SPEED_LIMIT = 2.5  # m/s 和 rad/s

# 关节名称（Go2 12个运动关节）
JOINT_NAMES = [
    "FR_hip_joint",   # 右前腿 髋关节
    "FR_thigh_joint", # 右前腿 大腿关节
    "FR_calf_joint",  # 右前腿 小腿关节
    "FL_hip_joint",   # 左前腿 髋关节
    "FL_thigh_joint", # 左前腿 大腿关节
    "FL_calf_joint",  # 左前腿 小腿关节
    "RR_hip_joint",   # 右后腿 髋关节
    "RR_thigh_joint", # 右后腿 大腿关节
    "RR_calf_joint",  # 右后腿 小腿关节
    "RL_hip_joint",   # 左后腿 髋关节
    "RL_thigh_joint", # 左后腿 大腿关节
    "RL_calf_joint",  # 左后腿 小腿关节
]


class Go2StatePublisher:
    def __init__(self):
        self.lowstate_pub = rospy.Publisher('/go2/lowstate', LowState, queue_size=10)
        self.sportstate_pub = rospy.Publisher('/go2/sportmodestate', SportModeState, queue_size=10)
        self.odom_pub = rospy.Publisher('/go2/odom', Odometry, queue_size=50)
        self.joint_pub = rospy.Publisher('/go2/joint_states', JointState, queue_size=10)
        self.imu_pub = rospy.Publisher('/go2/imu', Imu, queue_size=10)
        
        self.conn = None
        self.event_loop = None
        
        # 用于计算速度的变量
        self.last_position = None
        self.last_time = None

    def create_connection(self):
        return UnitreeWebRTCConnection(
            WebRTCConnectionMethod.LocalSTA,
            ip=UNITREE_IP
        )

    async def connect_and_subscribe(self):
        self.conn = self.create_connection()
        await self.conn.connect()
        self.event_loop = asyncio.get_running_loop()

        # 1. 启动安全序列：站立 + 恢复站立
        await self.startup_motions()

        # 2. 订阅状态频道
        rospy.loginfo(f"Subscribing to: {RTC_TOPIC['LF_SPORT_MOD_STATE']}")
        self.conn.datachannel.pub_sub.subscribe(
            RTC_TOPIC['LF_SPORT_MOD_STATE'],
            self.sportstate_callback
        )

        rospy.loginfo(f"Subscribing to: {RTC_TOPIC['LOW_STATE']}")
        self.conn.datachannel.pub_sub.subscribe(
            RTC_TOPIC['LOW_STATE'],
            self.lowstate_callback
        )
        
        rospy.loginfo(f"Subscribing to: {RTC_TOPIC['ROBOTODOM']}")
        self.conn.datachannel.pub_sub.subscribe(
            RTC_TOPIC['ROBOTODOM'],
            self.odom_callback
        )

        # 3. 订阅 cmd_vel
        rospy.Subscriber('/cmd_vel', Twist, self.cmd_vel_callback)

        rospy.loginfo("节点就绪，等待指令...")
        rospy.loginfo("已发布话题: /go2/lowstate, /go2/sportmodestate, /go2/odom, /go2/joint_states")

        while not rospy.is_shutdown():
            await asyncio.sleep(0.5)

    # ---------- 运动控制 ----------
    async def startup_motions(self):
        try:
            resp = await self.conn.datachannel.pub_sub.publish_request_new(
                RTC_TOPIC["MOTION_SWITCHER"],
                {"api_id": 1001}
            )
            if resp['data']['header']['status']['code'] == 0:
                data = json.loads(resp['data']['data'])
                current_mode = data['name']
                if current_mode != "normal":
                    rospy.loginfo(f"切换至 normal 模式...")
                    await self.conn.datachannel.pub_sub.publish_request_new(
                        RTC_TOPIC["MOTION_SWITCHER"],
                        {"api_id": 1002, "parameter": {"name": "normal"}}
                    )
                    await asyncio.sleep(5)

            rospy.loginfo("执行站立...")
            await self.conn.datachannel.pub_sub.publish_request_new(
                RTC_TOPIC["SPORT_MOD"],
                {"api_id": SPORT_CMD["StandUp"]}
            )
            await asyncio.sleep(2)

            rospy.loginfo("执行恢复站立...")
            await self.conn.datachannel.pub_sub.publish_request_new(
                RTC_TOPIC["SPORT_MOD"],
                {"api_id": SPORT_CMD["RecoveryStand"]}
            )
            await asyncio.sleep(2)

        except Exception as e:
            rospy.logerr(f"启动动作异常: {e}")

    async def shutdown_motions(self):
        if not self.conn:
            return
        try:
            rospy.loginfo("发送恢复站立...")
            asyncio.create_task(
                self.conn.datachannel.pub_sub.publish_request_new(
                    RTC_TOPIC["SPORT_MOD"],
                    {"api_id": SPORT_CMD["RecoveryStand"]}
                )
            )
            await asyncio.sleep(0.5)

            rospy.loginfo("发送趴下...")
            asyncio.create_task(
                self.conn.datachannel.pub_sub.publish_request_new(
                    RTC_TOPIC["SPORT_MOD"],
                    {"api_id": SPORT_CMD["StandDown"]}
                )
            )
            await asyncio.sleep(0.5)

            rospy.loginfo("发送停止运动...")
            asyncio.create_task(
                self.conn.datachannel.pub_sub.publish_request_new(
                    RTC_TOPIC["SPORT_MOD"],
                    {
                        "api_id": SPORT_CMD["Move"],
                        "parameter": {"x": 0, "y": 0, "z": 0}
                    }
                )
            )
            await asyncio.sleep(0.5)
        except Exception as e:
            rospy.logwarn(f"关闭动作异常（已忽略）: {e}")
        
    async def send_move(self, vx, vy, vyaw):
        if not self.conn:
            return
        try:
            await self.conn.datachannel.pub_sub.publish_request_new(
                RTC_TOPIC["SPORT_MOD"],
                {
                    "api_id": SPORT_CMD["Move"],
                    "parameter": {"x": vx, "y": vy, "z": vyaw}
                }
            )
        except Exception as e:
            rospy.logerr(f"发送运动指令失败: {e}")

    def cmd_vel_callback(self, msg: Twist):
        vx = max(-SPEED_LIMIT, min(SPEED_LIMIT, msg.linear.x))
        vy = max(-SPEED_LIMIT, min(SPEED_LIMIT, msg.linear.y))
        vyaw = max(-SPEED_LIMIT, min(SPEED_LIMIT, msg.angular.z))

        if self.event_loop and self.event_loop.is_running():
            asyncio.run_coroutine_threadsafe(
                self.send_move(vx, vy, vyaw),
                self.event_loop
            )
        else:
            rospy.logwarn("事件循环未运行，丢弃 cmd_vel")

    # ---------- ROBOTODOM 回调 ----------
    def odom_callback(self, message):
        try:
            if isinstance(message, dict) and 'data' in message:
                data = message['data']
                if isinstance(data, str):
                    data = json.loads(data)
                elif not isinstance(data, dict):
                    return
            else:
                return
            
            if 'pose' not in data:
                return
            
            pose_data = data['pose']
            position = pose_data.get('position', {})
            orientation = pose_data.get('orientation', {})
            
            stamp = rospy.Time.now()
            if 'header' in data and 'stamp' in data['header']:
                sec = data['header']['stamp'].get('sec', 0)
                nsec = data['header']['stamp'].get('nanosec', 0)
                if sec > 0:
                    stamp = rospy.Time(sec, nsec)
            
            odom_msg = Odometry()
            odom_msg.header = Header()
            odom_msg.header.stamp = stamp
            odom_msg.header.frame_id = "odom"
            odom_msg.child_frame_id = "base_link"
            
            odom_msg.pose.pose = Pose(
                position=Point(
                    x=position.get('x', 0.0),
                    y=position.get('y', 0.0),
                    z=position.get('z', 0.0)
                ),
                orientation=GeoQuat(
                    x=orientation.get('x', 0.0),
                    y=orientation.get('y', 0.0),
                    z=orientation.get('z', 0.0),
                    w=orientation.get('w', 1.0)
                )
            )
            
            odom_msg.pose.covariance = [
                0.01, 0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.01, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.01, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.01, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.01, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.01
            ]
            
            current_time = stamp.to_sec()
            current_x = position.get('x', 0.0)
            current_y = position.get('y', 0.0)
            
            if self.last_position is not None and self.last_time is not None:
                dt = current_time - self.last_time
                if dt > 0.001:
                    vel_x = (current_x - self.last_position[0]) / dt
                    vel_y = (current_y - self.last_position[1]) / dt
                    vel_z = (position.get('z', 0.0) - self.last_position[2]) / dt
                    
                    odom_msg.twist.twist = GeoTwist(
                        linear=Vector3(x=vel_x, y=vel_y, z=vel_z),
                        angular=Vector3(x=0.0, y=0.0, z=0.0)
                    )
                    
                    odom_msg.twist.covariance = [
                        0.01, 0.0, 0.0, 0.0, 0.0, 0.0,
                        0.0, 0.01, 0.0, 0.0, 0.0, 0.0,
                        0.0, 0.0, 0.01, 0.0, 0.0, 0.0,
                        0.0, 0.0, 0.0, 0.01, 0.0, 0.0,
                        0.0, 0.0, 0.0, 0.0, 0.01, 0.0,
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.01
                    ]
            
            self.last_position = (current_x, current_y, position.get('z', 0.0))
            self.last_time = current_time
            
            self.odom_pub.publish(odom_msg)
            
        except Exception as e:
            rospy.logerr(f"odom_callback error: {e}")

    # ---------- LOW_STATE 回调（包含关节）----------
    def lowstate_callback(self, message):
        try:
            data = message['data']
            msg = LowState()

            # 填充 IMU 状态
            if 'imu_state' in data:
                msg.imu_state = self._fill_imu(data['imu_state'])

            # ========== 1. 填充关节状态 ==========
            motors_raw = data.get('motor_state', [])
            motor_list = [MotorState() for _ in range(20)]
            joint_positions = []
            joint_velocities = []
            
            for i in range(min(12, len(motors_raw))):
                m = motors_raw[i]
                q = float(m.get('q', 0.0))
                dq = float(m.get('dq', 0.0))
                
                motor_list[i].q = q
                motor_list[i].dq = dq
                motor_list[i].temperature = int(m.get('temperature', 0))
                motor_list[i].lost = int(m.get('lost', 0))
                
                joint_positions.append(q)
                joint_velocities.append(dq)
                
            msg.motor_state = motor_list

            # 发布 JointState 消息
            joint_msg = JointState()
            joint_msg.header.stamp = rospy.Time.now()
            joint_msg.name = JOINT_NAMES[:len(joint_positions)]
            joint_msg.position = joint_positions
            joint_msg.velocity = joint_velocities
            # 力矩数据（如果需要可以加上）
            # joint_msg.effort = [...]
            self.joint_pub.publish(joint_msg)

            # 填充 BMS 状态（保留但不发布单独话题）
            if 'bms_state' in data:
                bms = data['bms_state']
                msg.bms_state.version_high = bms.get('version_high', 0)
                msg.bms_state.version_low = bms.get('version_low', 0)
                msg.bms_state.soc = bms.get('soc', 0)
                msg.bms_state.current = bms.get('current', 0)
                msg.bms_state.cycle = bms.get('cycle', 0)

                bq_ntc = bms.get('bq_ntc', [0, 0])
                mcu_ntc = bms.get('mcu_ntc', [0, 0])
                if isinstance(bq_ntc, list) and len(bq_ntc) >= 2:
                    msg.bms_state.bq_ntc = [int(bq_ntc[0]), int(bq_ntc[1])]
                else:
                    msg.bms_state.bq_ntc = [0, 0]
                if isinstance(mcu_ntc, list) and len(mcu_ntc) >= 2:
                    msg.bms_state.mcu_ntc = [int(mcu_ntc[0]), int(mcu_ntc[1])]
                else:
                    msg.bms_state.mcu_ntc = [0, 0]

            # 填充足底力
            if 'foot_force' in data:
                ff = data['foot_force']
                for i in range(min(4, len(ff))):
                    msg.foot_force[i] = int(ff[i])

            msg.temperature_ntc1 = int(data.get('temperature_ntc1', 0))
            msg.temperature_ntc2 = int(data.get('temperature_ntc2', 0))
            msg.power_v = float(data.get('power_v', 0.0))
            msg.power_a = float(data.get('power_a', 0.0))

            # 发布原始 LowState
            self.lowstate_pub.publish(msg)

        except Exception as e:
            rospy.logerr(f"lowstate_callback error: {e}")
            import traceback
            traceback.print_exc()

    # ---------- SPORT MODE STATE 回调 ----------
    def sportstate_callback(self, message):
        try:
            data = message['data']
            msg = SportModeState()

            now = rospy.Time.now()
            msg.stamp = TimeSpec(sec=now.secs, nanosec=now.nsecs)
            msg.error_code = 0

            if 'imu_state' in data:
                msg.imu_state = self._fill_imu(data['imu_state'])

            msg.mode = data.get('mode', 0)
            msg.progress = data.get('progress', 0.0)
            msg.gait_type = data.get('gait_type', 0)
            msg.foot_raise_height = data.get('foot_raise_height', 0.0)

            pos = data.get('position', [0.0, 0.0, 0.0])
            for i in range(3):
                msg.position[i] = pos[i] if i < len(pos) else 0.0

            msg.body_height = data.get('body_height', 0.0)

            vel = data.get('velocity', [0.0, 0.0, 0.0])
            for i in range(3):
                msg.velocity[i] = vel[i] if i < len(vel) else 0.0

            msg.yaw_speed = data.get('yaw_speed', 0.0)

            rng = data.get('range_obstacle', [0.0]*4)
            for i in range(4):
                msg.range_obstacle[i] = rng[i] if i < len(rng) else 0.0

            ff = data.get('foot_force', [0]*4)
            for i in range(4):
                msg.foot_force[i] = ff[i] if i < len(ff) else 0

            fpb = data.get('foot_position_body', [0.0]*12)
            for i in range(12):
                msg.foot_position_body[i] = fpb[i] if i < len(fpb) else 0.0

            fsb = data.get('foot_speed_body', [0.0]*12)
            for i in range(12):
                msg.foot_speed_body[i] = fsb[i] if i < len(fsb) else 0.0

            self.sportstate_pub.publish(msg)

            # ==================== 新增：发布标准 IMU 消息 ====================
            # 从已填充的 msg.imu_state 中提取数据
            imu_msg = Imu()
            imu_msg.header = Header()
            imu_msg.header.stamp = rospy.Time.now()
            imu_msg.header.frame_id = "imu"
            
            # 四元数（注意顺序：SportModeState 中是 [w, x, y, z]）
            imu_msg.orientation.x = msg.imu_state.quaternion[1]
            imu_msg.orientation.y = msg.imu_state.quaternion[2]
            imu_msg.orientation.z = msg.imu_state.quaternion[3]
            imu_msg.orientation.w = msg.imu_state.quaternion[0]
            
            # 角速度（rad/s）
            imu_msg.angular_velocity.x = msg.imu_state.gyroscope[0]
            imu_msg.angular_velocity.y = msg.imu_state.gyroscope[1]
            imu_msg.angular_velocity.z = msg.imu_state.gyroscope[2]
            
            # 线加速度（m/s²）
            imu_msg.linear_acceleration.x = msg.imu_state.accelerometer[0]
            imu_msg.linear_acceleration.y = msg.imu_state.accelerometer[1]
            imu_msg.linear_acceleration.z = msg.imu_state.accelerometer[2]
            
            # 设置协方差矩阵（表示传感器精度）
            # 姿态协方差
            imu_msg.orientation_covariance = [0.01, 0.0, 0.0,
                                              0.0, 0.01, 0.0,
                                              0.0, 0.0, 0.01]
            # 角速度协方差
            imu_msg.angular_velocity_covariance = [0.005, 0.0, 0.0,
                                                    0.0, 0.005, 0.0,
                                                    0.0, 0.0, 0.005]
            # 加速度协方差
            imu_msg.linear_acceleration_covariance = [0.02, 0.0, 0.0,
                                                       0.0, 0.02, 0.0,
                                                       0.0, 0.0, 0.02]
            
            self.imu_pub.publish(imu_msg)
            # ================================================================

        except Exception as e:
            rospy.logerr(f"sportstate_callback error: {e}")
            import traceback
            traceback.print_exc()

    @staticmethod
    def _fill_imu(imu_dict):
        imu_msg = IMU()
        quat = imu_dict.get('quaternion', [1.0, 0.0, 0.0, 0.0])
        for i in range(4):
            imu_msg.quaternion[i] = quat[i] if i < len(quat) else 0.0
        gyro = imu_dict.get('gyroscope', [0.0]*3)
        for i in range(3):
            imu_msg.gyroscope[i] = gyro[i] if i < len(gyro) else 0.0
        acc = imu_dict.get('accelerometer', [0.0]*3)
        for i in range(3):
            imu_msg.accelerometer[i] = acc[i] if i < len(acc) else 0.0
        rpy = imu_dict.get('rpy', [0.0]*3)
        for i in range(3):
            imu_msg.rpy[i] = rpy[i] if i < len(rpy) else 0.0
        imu_msg.temperature = imu_dict.get('temperature', 0)
        return imu_msg


def async_main(node):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(node.connect_and_subscribe())
    except Exception as e:
        rospy.logerr(f"WebRTC 异常: {e}")
    finally:
        loop.close()


if __name__ == "__main__":
    rospy.init_node('go2_state_publisher', anonymous=True)
    node = Go2StatePublisher()

    t = threading.Thread(target=async_main, args=(node,), daemon=True)
    t.start()

    rospy.loginfo("宇树 Go2 运动控制与状态发布节点已启动")
    rospy.loginfo("发布话题: /go2/lowstate, /go2/sportmodestate, /go2/odom, /go2/joint_states")
    rospy.loginfo("订阅话题: /cmd_vel (限幅 ±2.5)")

    try:
        rospy.spin()
    except KeyboardInterrupt:
        pass
    finally:
        rospy.loginfo("正在执行安全关闭序列...")
        try:
            asyncio.run(node.shutdown_motions())
        except Exception as e:
            rospy.logerr(f"关闭动作异常: {e}")
        rospy.loginfo("节点已关闭")
```

### iv. unitree_msgs

> [!TIP]
>
> - **go2_interfaces 源码**
>   - **官网地址：**[go2_ros2_sdk/go2_interfaces](https://github.com/abizovnuralem/go2_ros2_sdk/tree/master/go2_interfaces)
>   - **123备份：**[go2_interfaces.zip(9 KB)](https://1831996731.cdn.123clouddisk.com/1831996731/a_PicBed/project/unitree/20260703002647312.zip)
>
> `go2_interfaces` 是 `go2_ros2_sdk`的消息接口包，主要环境是ROS2 ，包含 Unitree Go2 机器人的自定义消息类型（`.msg` 文件）。由于目标开发环境为 ROS1（Noetic），需要将该包手动转换为 ROS1 的`catkin`风格消息包`unitree_msgs`。转换过程中，核心的修改集中在 `package.xml` 和 `CMakeLists.txt` 两个文件。

```bash
cd ~/navdgu_ws/src/goe_ros
catkin_create_pkg unitree_msgs roscpp std_msgs geometry_msgs message_generation
cd unitree_msgs
rm -rf src/ include/
mkdir msg

# 将 go2_interfaces 包中的msg文件全部移到 unitree_msgs/msg 中
cd ~/navdgu_ws && catkin build
```

```bash
unitree@unitree:~/navdgu_ws/src/goe_ros$ tree unitree_msgs/
unitree_msgs/
├── CMakeLists.txt
├── msg
│   ├── AudioData.msg
│   ├── BmsCmd.msg
│   ├── BmsState.msg
│   ├── Error.msg
│   ├── Go2Cmd.msg
│   ├── Go2FrontVideoData.msg
│   ├── Go2Move.msg
│   ├── Go2RpyCmd.msg
│   ├── Go2State.msg
│   ├── HeightMap.msg
│   ├── IMU.msg
│   ├── InterfaceConfig.msg
│   ├── LidarState.msg
│   ├── LowCmd.msg
│   ├── LowState.msg
│   ├── MotorCmd.msg
│   ├── MotorCmds.msg
│   ├── MotorState.msg
│   ├── MotorStates.msg
│   ├── PathPoint.msg
│   ├── Req.msg
│   ├── Res.msg
│   ├── SportModeCmd.msg
│   ├── SportModeState.msg
│   ├── TimeSpec.msg
│   ├── UwbState.msg
│   ├── UwbSwitch.msg
│   ├── VoxelHeightMapState.msg
│   ├── VoxelMapCompressed.msg
│   ├── WebRtcReq.msg
│   └── WirelessController.msg
└── package.xml

1 directory, 33 files
```

#### **1. unitree_msgs/CMakeLists.txt**

```tex
cmake_minimum_required(VERSION 3.0.2)
project(unitree_msgs)

find_package(catkin REQUIRED COMPONENTS
  geometry_msgs
  message_generation
  roscpp
  std_msgs
)

add_message_files(
  FILES
  Go2Cmd.msg
  Go2State.msg
  Go2Move.msg
  Go2RpyCmd.msg
  IMU.msg
  AudioData.msg
  BmsCmd.msg
  BmsState.msg
  Error.msg
  Go2FrontVideoData.msg
  HeightMap.msg
  InterfaceConfig.msg
  LidarState.msg
  LowCmd.msg
  LowState.msg
  MotorCmd.msg
  MotorCmds.msg
  MotorState.msg
  MotorStates.msg
  PathPoint.msg
  Req.msg
  Res.msg
  SportModeCmd.msg
  SportModeState.msg
  TimeSpec.msg
  UwbState.msg
  UwbSwitch.msg
  VoxelMapCompressed.msg
  VoxelHeightMapState.msg
  WebRtcReq.msg
  WirelessController.msg
)

generate_messages(
  DEPENDENCIES
  geometry_msgs
  std_msgs
)

catkin_package(
  CATKIN_DEPENDS geometry_msgs std_msgs message_runtime
)

include_directories(${catkin_INCLUDE_DIRS})
```

#### **2. unitree_msgs/package.xml**

```xml
<?xml version="1.0"?>
<package format="2">
  <name>unitree_msgs</name>
  <version>0.0.0</version>
  <description>The unitree_msgs package</description>
  <maintainer email="a@todo.todo">a</maintainer>
  <license>TODO</license>

  <buildtool_depend>catkin</buildtool_depend>

  <build_depend>geometry_msgs</build_depend>
  <build_depend>message_generation</build_depend>
  <build_depend>roscpp</build_depend>
  <build_depend>std_msgs</build_depend>

  <exec_depend>geometry_msgs</exec_depend>
  <exec_depend>roscpp</exec_depend>
  <exec_depend>std_msgs</exec_depend>
  <exec_depend>message_runtime</exec_depend>
</package>
```

#### **3. 其他**

修改完毕后，重新编译工作空间

```bash
cd ~/navdgu_ws && catkin build

# 查看是否可以识别
unitree@unitree:~$ rosmsg list | grep unitree_msgs
unitree_msgs/AudioData
unitree_msgs/BmsCmd
unitree_msgs/BmsState
unitree_msgs/Error
unitree_msgs/Go2Cmd
unitree_msgs/Go2FrontVideoData
unitree_msgs/Go2Move
unitree_msgs/Go2RpyCmd
unitree_msgs/Go2State
unitree_msgs/HeightMap
unitree_msgs/IMU
unitree_msgs/InterfaceConfig
unitree_msgs/LidarState
unitree_msgs/LowCmd
unitree_msgs/LowState
unitree_msgs/MotorCmd
unitree_msgs/MotorCmds
unitree_msgs/MotorState
unitree_msgs/MotorStates
unitree_msgs/PathPoint
unitree_msgs/Req
unitree_msgs/Res
unitree_msgs/SportModeCmd
unitree_msgs/SportModeState
unitree_msgs/TimeSpec
unitree_msgs/UwbState
unitree_msgs/UwbSwitch
unitree_msgs/VoxelHeightMapState
unitree_msgs/VoxelMapCompressed
unitree_msgs/WebRtcReq
unitree_msgs/WirelessController
unitree@unitree:~$ rosmsg show unitree_msgs/TimeSpec
int32 sec
uint32 nanosec
```

## c. goe_slam_nav

```bash
cd ~/navdgu_ws/src
catkin_create_pkg goe_slam_nav rospy roscpp  geometry_msgs std_msgs 
cd ~/navdgu_ws && catkin build
unitree@unitree:~/navdgu_ws/src$ tree goe_slam_nav/
goe_slam_nav/
├── CMakeLists.txt
├── config
│   ├── amcl.yaml
│   ├── carto_nav_2d_lidar_odom_imu_local.lua
│   ├── carto_nav_2d_lidar_odom_imu.lua
│   ├── carto_slam.lua
│   └── carto_slam_nav.lua
├── include
│   └── goe_slam_nav
├── launch
│   ├── amcl_nav.launch
│   ├── carto_nav2.launch
│   ├── carto_nav.launch
│   ├── carto_slam.launch
│   ├── gmapping_slam.launch
│   └── hector_slam.launch
├── maps
│   ├── map_20260515_115355.pbstream
│   ├── map_20260515_152836.pbstream
│   ├── map_20260515_152836.pgm
│   ├── map_20260515_152836.yaml
│   ├── map.pbstream
│   ├── map.pgm
│   └── map.yaml
├── package.xml
├── params
│   ├── costmap
│   │   ├── global_costmap_params.yaml
│   │   └── local_costmap_params.yaml
│   ├── move_base.yaml
│   └── planner
│       ├── dwa_local_planner_params.yaml
│       ├── global_planner_params.yaml
│       ├── mpc_local_planner_params.yaml
│       └── teb_local_planner_params.yaml
├── rviz
│   ├── 2d_multi_navigate.rviz
│   ├── 2d_navigate.rviz
│   ├── 2d_slam_carto.rviz
│   └── 2d_slam.rviz
├── scripts
│   └── carto_initialpose.py
└── src

11 directories, 33 files
```

### i. 相关依赖

```bash
ROS_DISTRO=$(rosversion -d)
sudo apt install -y \
ros-$ROS_DISTRO-navigation \
ros-$ROS_DISTRO-move-base \
ros-$ROS_DISTRO-global-planner \
ros-$ROS_DISTRO-dwa-local-planner \
ros-$ROS_DISTRO-teb-local-planner \
ros-$ROS_DISTRO-mpc-local-planner \
ros-$ROS_DISTRO-map-server \
ros-$ROS_DISTRO-amcl \
ros-$ROS_DISTRO-gmapping \
ros-$ROS_DISTRO-hector-slam \
ros-$ROS_DISTRO-rviz \
ros-$ROS_DISTRO-laser-filters \
ros-$ROS_DISTRO-tf2-ros \
ros-$ROS_DISTRO-tf2-tools \
ros-$ROS_DISTRO-navfn \
ros-$ROS_DISTRO-teleop-twist-keyboard
```

- `navigation`：导航栈元包，包含导航核心功能包的集合，提供完整的机器人导航解决方案
- `move-base`：导航核心节点，整合全局/局部规划器与成本地图，将路径转换为速度指令并发布给底盘
- `global-planner`：全局路径规划器，基于Dijkstra或A*算法在静态地图上规划从起点到目标点的最优路径
- `dwa-local-planner`：DWA局部规划器，基于动态窗口法在局部范围内实时避障并跟踪全局路径
- `teb-local-planner`：TEB局部规划器，采用时间弹性带算法，生成平滑且符合运动学约束的局部轨迹
- `mpc-local-planner`：MPC局部规划器，基于模型预测控制算法，预测未来状态并优化控制指令
- `map-server`：地图服务器，加载、保存并提供地图数据给导航栈中的其他节点
- `amcl`：自适应蒙特卡洛定位，基于粒子滤波算法在已知地图中估计机器人的位姿
- `gmapping`：基于Rao-Blackwellized粒子滤波的2D栅格地图构建工具，适用于室内SLAM
- `hector-slam`：无需里程计信息的SLAM系统，依赖激光雷达数据，适合地面不平整的机器人
- `rviz`：3D可视化工具，用于显示机器人模型、传感器数据、地图及导航状态
- `laser-filters`：激光雷达数据滤波工具集，包括去噪、去除孤立点、角度限制等
- `tf2-ros`：TF2坐标变换库的ROS绑定，管理机器人各坐标系之间的变换关系
- `tf2-tools`：TF2调试工具集，如`tf_echo`、`view_frames`等用于坐标变换可视化与诊断
- `navfn`：传统全局规划器（已逐步被global_planner替代），提供基于势场的导航功能
- `teleop-twist-keyboard`：键盘控制节点，通过键盘按键发布`/cmd_vel`速度指令，用于手动遥控机器人

### ii. 启动命令

这个主要启动导航与建图的各种文件

- **建图启动文件**
  - carto_slam.launch
  - gmapping_slam.launch
  - hector_slam.launch
- **导航启动文件**
  - amcl_nav.launch
  - carto_nav2.launch
  - carto_nav.launch

格式为
```bash
roslaunch goe_slam_nav ***.launch
```

## d. goe_tools

### i. rf2o_laser_odometry

```bash
# navdgu_ws
cd ~/navdgu_ws/src/goe_tools/

# 克隆代码到 src/goe_tools 目录下
git clone -b ros1 https://github.com/MAPIRlab/rf2o_laser_odometry.git 

# 编译工作空间（跳过CATKIN_IGNORE标记的包）
cd ~/navdgu_ws && catkin build
```

这个下载的包使用会有问题，一句下面的文章可以修复，若文章失效，可以查看蔚蓝机器狗关于这部分的介绍，那里详细介绍了

[基于rf2o_laser_odometry纯激光里程计的gmapping建图](https://zhuanlan.zhihu.com/p/500211757)

这里直接贴出修改好的功能包文件：[rf2o_laser_odometry.zip(137 KB)](https://1831996731.cdn.123clouddisk.com/1831996731/a_PicBed/project/unitree/20260703003840437.zip)

### ii. robot_localization

里程计融合包（必须下载对应的版本）

#### 1. 系统安装

```bash
# 针对 ROS1 版本
sudo apt-get update
sudo apt-get install ros-$ROS_DISTRO-robot-localization

# 验证安装成功
rospack find robot_localization  # 输出路径则安装成功

sudo apt remove ros-$ROS_DISTRO-robot-localization
```

#### 2. 导包安装

- **源码**
  - **官网地址：**[cra-ros-pkg/robot_localization](https://github.com/cra-ros-pkg/robot_localization)
  - **123备份：**[robot_localization-noetic-devel.zip(6.4 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-PU2yv)

```bash
# 1. 安装依赖（应该不止这些，但是出现那个错误就安装那个包，问题都是一样的类型）
# 使用 ROS_DISTRO 变量
sudo apt-get install -y \
    libgeographic-dev \
    geographiclib-tools \
    libgeographiclib-dev \
    ros-$ROS_DISTRO-geographic-msgs \
    ros-$ROS_DISTRO-geodesy \
    ros-$ROS_DISTRO-geographic-info \
    ros-$ROS_DISTRO-libg2o \
    ros-$ROS_DISTRO-tf2-sensor-msgs


# 2. 克隆源码到工作空间
cd ~/navdgu_ws/src/goe_tools/

# 2-1. 下载主分支，然后切换
git clone https://github.com/cra-ros-pkg/robot_localization.git
cd robot_localization
git checkout noetic-devel

# 2-2. 直接下载对应分支
git clone -b noetic-devel https://github.com/cra-ros-pkg/robot_localization.git


# 3. 编译（指定Python3，适配Noetic）
cd ~/navdgu_ws
catkin build
（编译大概 5分钟左右）

# 4. 刷新环境（关键！）
source devel/setup.bash

# 5. 验证编译成功
rospack find robot_localization  # 输出路径则成功
```

### iii. rplidar_ros

参考安装：[rplidar_ros](/posts/ros/ros-package/#e-rplidar_ros)

### iv. wit_ros_imu

维特官网：https://wit-motion.cn/#/witmotion/search

驱动GitHub：https://github.com/finn-wang/wit_ros_imu?tab=read

产品资料地址：https://wit-motion.yuque.com/wumwnr/docs/mkdwe1?singleDoc#

![1774864319054-8513611d-fa7c-45a5-b743-38c984fe25a6](https://vip.123pan.cn/1831996731/a_PicBed/project/unitree/20260703005634001.webp)

#### 1. 环境配置与依赖安装

```bash
# 进入工作空间目录
cd ~/navdgu_ws/src/goe_tools/

# 克隆 IMU 驱动代码
git clone https://github.com/finn-wang/wit_ros_imu.git

# 编译工作空间（自动跳过带 CATKIN_IGNORE 标记的包）
cd ~/navdgu_ws && catkin build

# 刷新 ROS 环境变量
source devel/setup.bash
```

安装系统依赖与 Python 包（适用于 Ubuntu 20.04）：

```bash
sudo apt-get install ros-$ROS_DISTRO-imu-tools ros-$ROS_DISTRO-rviz-imu-plugin
pip3 install pyserial rospkg
```

#### 2. 配置 IMU 固定设备端口

1. **创建 udev 规则文件**

```bash
# 终端编辑器
sudo nano /etc/udev/rules.d/imu.rules

# 或使用图形界面编辑器
sudo gedit /etc/udev/rules.d/imu.rules
```

2. **添加规则内容**

```bash
# 为 WT61C IMU 创建固定设备名
# 设备信息：QinHeng Electronics HL-340 USB-Serial 适配器，ID 1a86:7523
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", MODE:="0666", SYMLINK+="wt61c"
```

- `SUBSYSTEM=="tty"`：限定为串口设备。
- `ATTRS{idVendor}=="1a86"` 和 `ATTRS{idProduct}=="7523"`：匹配 WT61C IMU 设备的实际 ID（原文档错误写为 10c4/ea60，与规则里的 1a86:7523 冲突）。
- `MODE="0666"`：赋予所有用户读写权限，解决串口访问权限不足的问题。
- `SYMLINK+="wt61c"`：创建固定软链接 `/dev/wt61c` 指向实际设备（如 `/dev/ttyUSB0`），与规则里的命名保持一致。

3. **生效 udev 规则**

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

**提示**：如果设备已连接，建议拔插一次 USB 线以确保规则生效。

4. **验证映射结果**

```bash
ls -l /dev/wt61c
lrwxrwxrwx 1 root root 7 Dec 25 07:34 /dev/wt61c -> ttyUSB0
```

5. **修改后的对应 launch 文件**

```xml title="wt61c_rviz.launch"
<?xml version="1.0" encoding="UTF-8"?>
<launch>

    <!-- imu type, default normal -->
    <arg name="type" default="normal" doc="type [normal, modbus]"/>
    
    <!-- 控制是否启动 RViz，默认为 false（关闭） -->
    <arg name="rviz" default="0" doc="启动 RViz: true(1) / false(0)"/>

    <!-- imu python 节点 -->
    <!-- 启动 IMU 驱动节点，读取串口数据并发布 IMU 话题 -->
    <node pkg="wit_ros_imu" type="wit_$(arg type)_ros.py" name="imu" output="screen">
        <!-- IMU 设备串口端口 -->
        <param name="port" type="str" value="/dev/wt61c"/>
        <!-- 串口波特率 -->
        <param name="baud" type="int" value="115200"/>
        <!-- 将 /wit/imu 话题重映射为 /imu -->
        <!-- <remap from="/wit/imu" to="/imu"/>  -->
    </node>


    <!-- RViz 可视化节点 -->
    <!-- 只有当 rviz_enable 参数为 true 时才启动 -->
    <node if="$(eval arg('rviz') == 1)" 
          name="rviz" pkg="rviz" type="rviz" 
          args="-d $(find wit_ros_imu)/rviz/wit_ros_imu.rviz">
    </node>
</launch>
```

调试位置的 launch 需要与 urdf 文件的 imu 位置（x/y/z）相对应

```xml title="imu_urdf.launch"
<?xml version="1.0"?>
<launch>

  <!-- 读取 URDF 文件 -->
  <param name="robot_description" 
         command="$(find xacro)/xacro $(find goe_bringup)/urdf/imu_correction.urdf" />

    <!-- 控制是否启动 RViz，默认为 false（关闭） -->
   <arg name="rviz" default="1" doc="启动 RViz: true(1) / false(0)"/>
  <!-- 发布 tf 树（static_transform_publisher 会被 robot_state_publisher 替代） -->
  <node name="robot_state_publisher" pkg="robot_state_publisher" type="robot_state_publisher" />

  <!-- 你的 IMU 驱动节点 -->
  <node pkg="wit_ros_imu" type="wit_normal_ros.py" name="imu" output="screen">
    <param name="port" value="/dev/wt61c"/>
    <param name="baud" value="115200"/>
    <!-- 如果驱动发布的 IMU 数据 frame_id 不是 "imu_link"，需要 remap 或修改驱动 -->
  </node>

  <!-- RViz 可视化节点（可选） -->
  <node if="$(eval arg('rviz') == 1)" name="rviz" pkg="rviz" type="rviz" 
        args="-d $(find wit_ros_imu)/rviz/wit_ros_imu.rviz"/>

</launch>
<?xml version="1.0"?>
<robot name="imu_robot">

  <!-- 机器人主体（基座） -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.3 0.1"/>
      </geometry>
      <material name="blue"/>
    </visual>
  </link>

  <!-- IMU 传感器本体 -->
  <link name="imu_link">
    <visual>
      <geometry>
        <box size="0.05 0.05 0.02"/>
      </geometry>
      <material name="red"/>
    </visual>
  </link>

  <!-- 固定关节：base_link -> imu_link，带方向修正 -->
  <joint name="imu_joint" type="fixed">
    <!-- 平移偏移（如有需要） -->
    <origin xyz="0.1 0 0.4" rpy="0 0 0"/>  
    <!--          ↑            ↑
           IMU 安装位置   旋转修正：
                          roll=0, pitch=0, yaw=90度（1.5708弧度）
                          如果 IMU 的 X 轴朝右，就旋转使其朝前
    -->
    <parent link="base_link"/>
    <child link="imu_link"/>
  </joint>

</robot>
```

6. **修改发布的 `frame_id`** 

如果想通过 launch 文件选择 `frame_id` 的能力，可以修改脚本如下：

在 launch 对应的 python 文件`__main__` 中 `rospy.init_node` 之后添加：

```python
frame_id = rospy.get_param("~frame_id", "base_link")
```

将上面的三行改为：

```python
imu_msg.header.frame_id = frame_id
mag_msg.header.frame_id = frame_id
location_msg.header.frame_id = frame_id
```

然后在 launch 文件中可以这样传参：

```xml
<node pkg="wit_ros_imu" type="wit_normal_ros.py" name="imu" output="screen">
  <param name="port" value="/dev/wt61c"/>
  <param name="baud" value="115200"/>
  <param name="frame_id" value="imu_link"/>
</node>
```

**验证**

修改后，重新运行 launch，执行：

```bash
rostopic echo /wit/imu -n1 | grep frame_id
```

应输出 `frame_id: "imu_link"`。

# 3. 测试文件

位于 **navdgu_ws/test** 目录下，主要是测试 **unitree_webrtc_connect** 的包括机器狗的连接、控制、群控、UI 等等

```bash
unitree@unitree:~/navdgu_ws$ tree test/
test/
├── data_channel               # unitree_webrtc_connect 示例文件
│   ├── lowstate.py
│   ├── multiplestate.py
│   ├── print_lowstate_raw.py
│   ├── sportmode.py
│   └── sportmodestate.py
├── README.txt
├── robot_odom_print.py				 # RTC_TOPIC["ROBOTODOM"] 消息打印
├── robot_odom_save.py				 # RTC_TOPIC["ROBOTODOM"] 消息保存为文件打印
├── test01.py                  # 测试1
├── test02.py                  # 测试2
├── test03.py 								 # 测试3
├── test04.py									 # 测试4
├── test_pyqt.py							 # 测试Qt是否可用
├── topic_diagnostic.py        # 自动检测Unitree Go2机器狗所有可用的数据话题
├── unitree_control.py				 # 全面控制-终端
├── unitree_qt.py              # 全面控制-Qt_UI
└── unitree_tk.py              # 全面控制-Tk_UI

1 directory, 17 files
```

## a. 相关依赖

```bash
sudo apt install python3-tk
sudo apt install python3-pyqt5
```









---



