---
title: WEILAN 机器狗（三）
published: 2025-09-22
updated: 2026-08-12
description: 蔚蓝机器狗的自动导航
image: /assets/bolg_cover/weilan-devq-03.webp
tags: [机器狗, ROS, 自动导航]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

**[WEILAN 机器狗（一）](/posts/project/weilan-devq-01/)**

**[WEILAN 机器狗（二）](/posts/project/weilan-devq-02/)**

> 本章为激光雷达与视觉摄像头融合建图导航专题，重点讲解蔚蓝机器狗 BabyAlpha Dev-Q 自主导航完整实现方案。方案搭载扩展控制板，经由有线网口完成数据交互与设备管控；依托激光雷达、摄像头、陀螺仪多传感器融合完成环境建模，并结合路径规划算法实现自主导航；同时可基于树莓派上位机控制板下发指令，完成机器狗整机运动调控。

Github：[AlphaDogDeveloper](https://github.com/AlphaDogDeveloper)

[原文档PDF原件](https://1831996731.share.123pan.cn/123pan/wdzVjv-jgWvd)

[各种代码包文件](https://1831996731.share.123pan.cn/123pan/wdzVjv-TFWvd)

- **基础环境**

  | **主机设备**   | Jetson Nano                                                  |
  | -------------- | ------------------------------------------------------------ |
  | **操作系统**   | Ubuntu 20.04 LTS                                             |
  | **传感器设备** | 思岚 A1M8                                                    |
  | **ROS版本**    | ROS Noetic Ninjemys                                          |
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

本文件将在上述基础环境的框架下，详细记录项目开发、测试验证等相关工作的进展。各具体模块可根据实际需求灵活规划与补充。鉴于篇幅及内容聚焦考量，有关**系统安装及部分常用配置**的具体细节将不做赘述。



# 1. 系统配置

## a. 烧录系统

- **树莓派**

  - 使用官方软件进行系统的镜像烧录

    |  用户名  | **nav** |
    | :------: | :-----: |
    | **密码** | **nav** |


  - **Jetson Nano**

    - 因为要适配 **agentos_sdk** 功能包，最好是Ubuntu20，但是这个系列的官方镜像最多是Ubuntu18，所以使用了第三方镜像，以下是列出的一些第三方镜像链接。

    - | 维护方               | 镜像版本 | 有效下载链接                                                 | 核心特点                                                     | 适配机型              |
      | -------------------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------- |
      | Jetson-Containers    | 2025.11  | https://github.com/dusty-nv/jetson-containers                | Ubuntu 20.04 容器镜像，含 TensorRT、YOLO 等，环境隔离        | 所有版本（需 Docker） |
      | Qengineering（优先） | 2025.08  | https://github.com/Qengineering/Jetson-Nano-Ubuntu-20-image/releases | 预装 CUDA 10.2、cuDNN 8.0、OpenCV 4.8、PyTorch 1.13；SD 卡启动，驱动稳定 | 2GB/4GB（SD 卡版）    |
      |                      |          |                                                              |                                                              |                       |

      最终使用 [Qengineering]( file\Jetson-Nano-Ubuntu-20-image-main.zip ) 

      ![image-20260812105633228](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260812105633604.webp)

      两种镜像版本，一个是规格较大，用于AI开发的，另一个是基础的，都下载了。以下链接是有关 **ROS** 的

      [GitHub - CollaborativeRoboticsLab/JetsonNano-ROS2：关于使用 ROS2 搭建 JetsonNano 的全面指南](https://github.com/CollaborativeRoboticsLab/JetsonNano-ROS2)

      烧录完毕，用户名与密码**（最终使用的是规格较大的8.73 GB，基础的有很多问题）**

      |  用户名  | **jetson** |
      | :------: | :--------: |
      | **密码** | **jetson** |

      使用**树莓派官方烧录器**可以烧录成功。

    - **[GParted](https://gparted.org/)** 扩容

      ```bash
      sudo apt-get install gparted
      ```

[grid]
![image-20260812105741969](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260812105742124.webp)
![image-20260812105753397](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260812105753539.webp)
![image-20260812105804333](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260812105804465.webp)
[/grid]

[grid]
![image-20260812105817022](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260812105817165.webp)
![image-20260812105824885](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260812105825004.webp)
[/grid]

## b. ROS安装

```bash
# 鱼香ROS 一键安装
wget http://fishros.com/install -O fishros && . fishros
source <(wget -qO- http://fishros.com/install)
```

连接网络后，输入以上代码，依次按照提示选择，注意在安装以下选项时，选择ROS１与桌面安装

```bash
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

## c. agentos_sdk

- 依据 [3. agentos_sdk](/posts/project/weilan-devq-01/#3-agentos_sdk) 进行官方SDK的包的安装

  没有进行 bashrc 文件的写入，所以运行的话需要

  ```bash
  source ~/agent_ws/devel/setup.bash
  ```

  > [!TIP]
  >
  > 也可以不安装，只是执行这个包所需要的环境（后续这个功能包是要放到导航包工作空间中的，这里只是验证测试这个包是否可用）
  >
  > ```bash
  > sudo apt-get install ros-$ROS_DISTRO-actionlib-tools
  > ```
  >
  > 补上缺失的包即可。


## d. 分布式通信配置

### i. 子网

通过一根网线将**机器狗**与**树莓派**进行连接

![image-20260812111209634](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260812111210387.webp)

树莓派端与机器狗的IP（10.10.10.10）进行网络互通需要确保两者处于同一子网（`10.10.10.0/24`），使用 `netplan` 配置静态 IP（适用于 Ubuntu 系统）。

- **1、找到网络配置文件**

  查看 `netplan` 配置文件目录：

  ```bash
  ls /etc/netplan/
  ```

  通常会看到类似 `50-cloud-init.yaml` 或 `01-network-manager-all.yaml` 的文件（记下来文件名）。

- **2、编辑网络配置文件**

  1. 用 `nano` 打开配置文件（替换为上一步找到的文件名）：

     ```bash
     sudo nano /etc/netplan/50-cloud-init.yaml
     # 或
     sudo gedit /etc/netplan/50-cloud-init.yaml
     ```

  2. 按以下格式修改（为有线网卡 `eth0` 配置静态 IP）：

     ```
     network:
         version: 2
         renderer: networkd  # 统一使用networkd渲染器
         ethernets:
             eth0:  # 有线网卡，用于连接机器狗
                 dhcp4: no  # 关闭DHCP
                 addresses: [10.10.10.50/24]  # 静态IP（与机器狗同网段）
                 optional: true
         wifis:
             wlan0:
                 access-points:
                     ESTEAM_5G:
                         hidden: true
                         password: "Ysd13579"
                 dhcp4: true  # Wi-Fi保持DHCP自动获取
                 optional: true
     ```

- **3、应用配置**

  1. 验证配置文件格式是否正确：

     ```bash
     sudo netplan try
     ```

     若提示 `Configuration accepted`，按回车确认。

  2. 生效配置：

     ```bash
     sudo netplan apply
     ```

- **4、验证配置**

  重新查看网络接口，确认 `eth0` 已配置静态 IP：

  ```bash
  ifconfig eth0
  ```

  若输出中 `inet` 显示 `10.10.10.50`，则配置成功。

- **5、测试与机器狗的连通性**

  用网线连接树莓派和机器狗后，执行：

  ```bash
  ping 10.10.10.10 -c 4
  ```

  若能收到回复，说明网络已连通。

### ii. bashrc

进行配置 **bashrc** 文件内容。

```bash
# >>> fishros initialize >>>
source /opt/ros/noetic/setup.bash
# <<< fishros initialize <<<
source ~/agent_ws/devel/setup.bash
# ROS 环境变量配置（连接机器狗）
export ROS_MASTER_URI=http://10.10.10.10:11311  # 机器狗的 ROS Master 地址
export ROS_HOSTNAME=10.10.10.50                 # 树莓派有线网卡的静态 IP
```

## e. Cartographer 安装

参考安装：[Cartographer](/posts/ros/ros-package/#a-cartographer)

## f. 相关话题

详情查看 [附录一](/posts/project/weilan-devq-01/#附录一)

## g. 其他配置

- **NoMachine**

  ```bash
  # 远程控制软件
  sudo dpkg -i nomachine_8.11.3_4_arm64_RPI.deb
  ```

- 安装**便捷性工具**（这部分**Jetson Nano**可以只进行**网络检测**）

  1. ~~安装 Ubuntu桌面版环境（冗余不安装）~~

     ```bash
     sudo apt-get install ubuntu-desktop
     sudo reboot 
     ```

  2. 若需要提升桌面操作便捷性，可安装**轻量级桌面组件**

     ```bash
     # 安装轻量级窗口管理器和基础工具
     sudo apt install openbox gnome-terminal pcmanfm  # 窗口管理、终端、文件管理器
     sudo apt install xfce4-settings  # 简单的系统设置工具
     ```

     **设置默认终端**

     ```bash
     xdg-settings set default-terminal gnome-terminal
     ```

     查询 终端

     ```bash
     nav@nav:~$ ls /usr/bin/*terminal* /usr/bin/*term*
     /usr/bin/dh_strip_nondeterminism  /usr/bin/lxterm
     /usr/bin/gnome-terminal           /usr/bin/miniterm
     /usr/bin/gnome-terminal           /usr/bin/setterm
     /usr/bin/gnome-terminal.real      /usr/bin/uxterm
     /usr/bin/gnome-terminal.real      /usr/bin/x-terminal-emulator
     /usr/bin/gnome-terminal.wrapper   /usr/bin/x-terminal-emulator
     /usr/bin/gnome-terminal.wrapper   /usr/bin/xterm
     /usr/bin/koi8rxterm
     nav@nav:~$ update-alternatives --list x-terminal-emulator
     /usr/bin/gnome-terminal.wrapper
     /usr/bin/koi8rxterm
     /usr/bin/lxterm
     /usr/bin/uxterm
     /usr/bin/xterm
     ```

  3. **网络检测**

     ```bash
     sudo apt install net-tools
     ```

- **导航包**

  1. **move-base**

     ```
     # 安装
     sudo apt install ros-$ROS_DISTRO-move-base ros-$ROS_DISTRO-navigation
     # 验证安装
     rospack find move_base
     ```

     - 输出 /opt/ros/noetic/share/move_base → 安装成功；

  2. ##### teb_local_planner

     ```bash
     # 安装
     sudo apt install ros-$ROS_DISTRO-teb-local-planner
     # 检查TEB规划器是否被ROS插件系统识别
     rospack plugins --attrib=plugin nav_core | grep teb_local_planner
     ```

     - 正常输出（示例）：`teb_local_planner /opt/ros/noetic/share/teb_local_planner/plugins/teb_local_planner_plugin.xml` → 说明插件已注册，可被 `move_base` 调用。

     > [!TIP]
     >
     > - **1. mpc_local_planner**
     >
     >   用不了，一直报错
     >
     >   ```bash
     >   # 安装
     >   sudo apt install ros-$ROS_DISTRO-mpc-local-planner
     >   
     >   # 重新启动一个终端检查TEB规划器是否被ROS插件系统识别
     >   rospack plugins --attrib=plugin nav_core | grep mpc_local_planner
     >   
     >   # 检查插件是否可用
     >   jetson@nano:~/Desktop$ rospack find mpc_local_planner
     >   /opt/ros/noetic/share/mpc_local_planner
     >   jetson@nano:~/Desktop$ ls $(rospack find mpc_local_planner)/mpc_local_planner_plugin.xml
     >   /opt/ros/noetic/share/mpc_local_planner/mpc_local_planner_plugin.xml
     >   jetson@nano:~/Desktop$ 
     >   ```
     >
     > - **2. rpp_local_planner(ROS2)**
     >
     >   ```bash
     >   # 安装
     >   sudo apt install ros-$ROS_DISTRO-rpp-local-planner
     >         
     >   # 重新启动一个终端检查TEB规划器是否被ROS插件系统识别
     >   rospack plugins --attrib=plugin nav_core | grep rpp_local_planner
     >   ```

  3. **tf2-tools**

     ```bash
     # tf坐标变换
     sudo apt install ros-$ROS_DISTRO-tf2-tools
     ```


# 2. navdg_ws

该 ROS 工作空间作为核心总控载体，整合了导航、建图、功能测试、模型部署等全流程功能模块，所有相关代码文件、配置文件及运行依赖均基于此工作空间统一管理与调度。

***文件目录***

- **navdg_ws/**
  - **src/**
    - **doge_auto_start/**				# 一键启动建图导航
    - **doge_ros/**
      - **alpha_dog_description/**      # 机器狗仿真文件
      - **alpha_dog_driver/**		# 依照 **agentos_sdk** 控制逻辑，做的驱动包
      - **doge_bringup/**                       # 机器狗硬件、仿真总合集
    - **doge_slam_nav/**
    - **doge_tools/**
      - **agentos_sdk/**			# 蔚蓝机器狗官方SDK
      - **rf2o_laser_odometry/**        # 基于激光雷达的平面里程计计算（发布里程计）
      - **robot_localization/**             # 用于激光雷达与IMU数据融合（没用上，在Nano编译成功，使用总出错）
      - **rplidar_ros/**                           # 思岚激光雷达驱动包
      - **slam_gmapping/**                  # gmapping建图包
      - **wit_ros_imu/**                         # 维特智能IMU驱动包

创建 **navdg_ws** 工作空间

```bash
# 1. 批量创建工作空间及功能包目录
mkdir -p ~/navdg_ws/src/{doge_config,doge_navigation,doge_ros,doge_slam,doge_tools}

# 2. 进入工作空间并初始化（catkin init）
cd ~/navdg_ws
# 前置检查：若未安装catkin-tools则自动安装
command -v catkin >/dev/null 2>&1 || sudo apt install -y python3-catkin-tools
catkin init

# 3. 编译工作空间
catkin build

# 4. 配置环境变量
source devel/setup.bash
# 检查是否已存在该环境变量，不存在则添加（优化：单行精准匹配，避免重复）
grep -qxF "source ~/navdg_ws/devel/setup.bash" ~/.bashrc || echo "source ~/navdg_ws/devel/setup.bash" >> ~/.bashrc
source ~/.bashrc

# 并且在其中写入以下内容，用于消除rviz警告
export DISABLE_ROS1_EOL_WARNINGS=1
```

![image-20260812112920411](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260812112920697.webp)

## 常用 ROS 基础命令

```bash
rostopic echo /alphadog_node/joint_states
rostopic echo /alphadog_node/imu

# 保存地图轨迹
roscd doge_slam_nav/maps/
rosrun map_server map_saver -f map

# TF树关系查看
rosrun rqt_tf_tree rqt_tf_tree
# 查看TF树关系图
rosrun tf view_frames
rosrun tf2_tools view_frames.py


# 查看频率
rostopic hz /alphadog_node/imu
rostopic hz /imu
```

## a. doge_auto_start

`一键启动建图、导航、保存地图。`

==未完善==

- **导包**

  ```bash
  # 进入机器狗驱动包所在工作空间目录
  cd ~/navdg_ws/src/
  
  # 创建自定义驱动功能包 doge_auto_start，依赖核心ROS库/消息包
  catkin_create_pkg doge_auto_start rospy roscpp std_msgs
  
  # 编译工作空间（自动跳过标记为CATKIN_IGNORE的功能包）
  cd ~/navdg_ws && catkin build
  ```

- **launch/**

  总启动文件

  - **2d_nav_start.launch**

    ~~这个是单一谷歌导航的，后续添加参数可以选择哪种导航。~~

    2D激光雷达导航启动文件

    ```xml
    <launch>
        <arg name="local_type" default="amcl" doc="定位类型: carto 或 amcl" />
        <arg name="amcl" default="amcl" />
        <arg name="carto" default="carto" />
        
        
        <!-- 机器人驱动 -->
        <include file="$(find doge_bringup)/launch/robot_dog.launch">
            <arg name="use_cam" value="false" />
    	    <arg name="use_lidar" value="true" />
        </include>
    
        <!-- Cartographer 定位 -->
        <include if="$(eval arg('local_type') == 'carto')"
            file="$(find doge_slam_nav)/launch/carto_nav_2d.launch">
            <arg name="map_name" value="map" />
        </include>
    
        <!-- AMCL 定位 -->
        <include if="$(eval arg('local_type') == 'amcl')"
            file="$(find doge_slam_nav)/launch/amcl_nav_2d.launch">
            <arg name="map_name" value="map" />
        </include>
    
        <!-- 启动导航RViz -->
        <include file="$(find doge_slam_nav)/launch/rviz_2d.launch" 
                 launch-prefix="sleep 5">
             <arg name="rviz" value="s2" />
        </include>
    </launch>
    ```

    

  - **2d_slam_start.launch**

    ~~这个是单一谷歌slam的，后续添加参数可以选择哪种slam。~~

    2D激光雷达建图启动文件

    ```xml
    <launch>
        <arg name="slam_type" default="carto" doc="建图类型: carto / gmapping" />
        <arg name="carto" default="carto" />
        <arg name="gmapping" default="gmapping" />
    
        <!-- 机器人驱动 -->
        <include file="$(find doge_bringup)/launch/robot_dog.launch">
            <arg name="use_cam" value="false" />
            <arg name="use_lidar" value="true" />
        </include>
    
        <!-- Cartographer 建图 -->
        <include if="$(eval arg('slam_type') == 'carto')"
            file="$(find doge_slam_nav)/launch/carto_slam_2d.launch">
            <arg name="use_sim_time" value="false" />
        </include>
    
        <!-- GMapping 建图 -->
        <include if="$(eval arg('slam_type') == 'gmapping')"
            file="$(find doge_slam_nav)/launch/gmapping_slam_2d.launch">
            <arg name="use_sim_time" value="false" />
        </include>
    
        <!-- RViz -->
        <include file="$(find doge_slam_nav)/launch/rviz_2d.launch" launch-prefix="sleep 5">
            <arg name="rviz" value="s1" />
        </include>
    </launch>
    ```

    

- **scripts/**

  一键启动的脚本文件

  ```bash
  jetson@nano:~/navdg_ws/src/doge_auto_start/scripts$ ls
  navigate_multi_start  navigate_start  navigate_stop  slam_start  slam_stop
  ```

  - navigate_multi_start （多点导航开始）
  - navigate_start（导航开始）
  - navigate_stop（导航结束）
  - slam_start（建图开始）
  - slam_stop（建图结束）

## b. doge_ros

`机器狗的仿真包、驱动运动包等。`

### i. alpha_dog_description

`这个是存放机器狗的描述文件，相关仿真文件，从dev_robot_control_sdk找到的 BabyAlpha Dev-Q 描述文件。`

 **[dev_robot_control_sdk](https://github.com/AlphaDogDeveloper/dev_robot_control_sdk)** 

机器狗的尺寸启动起来可以看成是一个**长方体**，尺寸是 `60*40*30 cm`。

- **导包**

  ```bash
  # 进入机器狗驱动包所在工作空间目录
  cd ~/navdg_ws/src/doge_ros
  
  # 创建自定义驱动功能包 alpha_dog_description，依赖核心ROS库/消息包
  catkin_create_pkg alpha_dog_description rospy roscpp actionlib geometry_msgs agent_msgs std_msgs urdf xacro joint_state_publisher robot_state_publisher rviz
  
  # 编译工作空间（自动跳过标记为CATKIN_IGNORE的功能包）
  cd ~/navdg_ws && catkin build
  ```

- **launch/**

  这个启动 Urdf 文件夹，其中有 **devq_nav/devq_nav_rviz.launch**（加了雷达与IMU的），**devq_rviz.launch**（原装的）。

  

  **devq_nav_rviz.launch**

  ```xml
  <launch>
      <param name="robot_description" command="$(find xacro)/xacro --inorder '$(find alpha_dog_description)/urdf/devq_nav.urdf'" />
  
      <!-- 高速 joint_states 转换器 -->
      <node name="joint_state_converter" pkg="alpha_dog_description" type="joint_state_converter.py" output="screen" />
  
      <!-- 机器人状态发布器 -->
      <node name="robot_state_publisher" pkg="robot_state_publisher" type="robot_state_publisher" />
  
      <!-- RViz -->
      <node name="rviz" pkg="rviz" type="rviz" args="-d $(find alpha_dog_description)/rviz/urdf.rviz" />
  </launch>
  ```

  ```xml
    <node pkg="tf2_ros" type="static_transform_publisher" name="map_to_world_tf"
              args="0 0 -0.25 0 0 0 map world __name:=map_to_world_tf" output="screen">
            <param name="use_sim_time" value="false"/>
        </node>
        <node pkg="tf2_ros" type="static_transform_publisher" name="world_to_base_link_tf"
              args="0 0 0.25 0 0 0 world base_link __name:=world_to_base_link_tf" output="screen">
            <param name="use_sim_time" value="false"/>
        </node>
  ```

  

- **meshes/**

  模型文件（官方的文件）

  ```bash
  abad_link.STL  base_link.STL  foot_link.STL  hip_link.STL  knee_link.STL
  ```

- **rviz/**

  查看模型用到的Rviz文件，调试用的，后面就用别的了。

- **scripts/**

  最开始使用的是话题 **'/alphadog_node/joint_states'** 获取关节信息，但是速率非常的低，查看官方的 **[issues](https://github.com/AlphaDogDeveloper/dev_robot_control_sdk/issues/5)** 发现同样的问题，所以也可以使用 **'/alphadog_node/robot_ctrl_status'**，来获取关节信息，其中的对应关系是

  ```bash
  robot_ctrl_status
  ├── header (时间戳)
  └── status
      ├── current_status (当前状态)
      │   ├── body (身体位置姿态)
      │   └── legs (4条腿)
      │       ├── 腿1：foot(足端) + joints(3个关节q值)
      │       ├── 腿2：foot(足端) + joints(3个关节q值)
      │       ├── 腿3：foot(足端) + joints(3个关节q值)
      │       └── 腿4：foot(足端) + joints(3个关节q值)
      └── desired_status (目标状态，一般不用)
  ```

  对应转换程序（ **/alphadog_node/robot_ctrl_status --> /joint_states** ）

  ```python
  #!/usr/bin/env python3
  import rospy
  from sensor_msgs.msg import JointState
  from ros_alphadog.msg import RobotCtrlStatusStamped
  
  class JointStateConverter:
      """
      @brief 将机器人高速控制状态转换为标准JointStates话题
      @note  用于解决官方joint_states更新频率过低的问题，提供30Hz实时关节状态
      """
      def __init__(self):
          rospy.init_node('joint_state_converter')
  
          # 订阅机器人控制状态（30Hz）
          rospy.Subscriber('/alphadog_node/robot_ctrl_status', RobotCtrlStatusStamped, self.callback)
  
          # 发布标准高速关节状态
          self.js_pub = rospy.Publisher('/joint_states', JointState, queue_size=10)
  
          # 机器人URDF关节名称（严格匹配）
          self.joint_names = [
              "front_right_abad_joint",
              "front_right_hip",
              "front_right_knee",
              "front_left_abad_joint",
              "front_left_hip",
              "front_left_knee",
              "hind_right_abad_joint",
              "hind_right_hip",
              "hind_right_knee",
              "hind_left_abad_joint",
              "hind_left_hip",
              "hind_left_knee"
          ]
  
      def callback(self, msg):
          """
          @brief 从RobotCtrlStatus提取关节角度并发布
          """
          try:
              legs = msg.status.current_status.legs
  
              # 构建12轴关节角度数组
              positions = [
                  legs[0].joints[0].q, legs[0].joints[1].q, legs[0].joints[2].q,
                  legs[1].joints[0].q, legs[1].joints[1].q, legs[1].joints[2].q,
                  legs[2].joints[0].q, legs[2].joints[1].q, legs[2].joints[2].q,
                  legs[3].joints[0].q, legs[3].joints[1].q, legs[3].joints[2].q,
              ]
  
              # 发布标准JointState
              js = JointState()
              js.header.stamp = rospy.Time.now()
              js.name = self.joint_names
              js.position = positions
              self.js_pub.publish(js)
  
          except Exception as e:
              rospy.logerr(f"JointState converter error: {str(e)}")
  
  if __name__ == '__main__':
      try:
          converter = JointStateConverter()
          rospy.spin()
      except rospy.ROSInterruptException:
          pass
  ```

  

- **urdf/**

  一共两个文件，一个是原装的 `devq.urdf`，一个是经过修改的  `devp_nav.urdf`，大概修改了比如身体/腿关节/髋关节的颜色，添加了雷达、IMU控件，还有添加了一个全局变量，用于抬高机器人，并将所有的有关base_link的关节高度调高对应H，关键修改如下

  ```xml
  <?xml version="1.0" ?>
  <robot name="alphadog_devq">
      
      <!-- 公共参数：机身抬高高度 0.25m，全局统一使用 -->
      <xacro:arg name="body_height" default="0.25" />
      <xacro:property name="h" value="$(arg body_height)" />
  
  	<!-- 基座连杆（橙黄色） -->
  	<link name="base_link">
  		<inertial>
  			<origin xyz="-0.00091406 -0.001375573 -0.001298396475" rpy="0 0 0"/>
  			<mass value="2.571164339"/>
  			<inertia ixx="0.0063721225" ixy="-6.32938e-05" ixz="-8.9136e-06" iyy="0.0191754101" iyz="2.0146499999999998e-05" izz="0.023470604699999998"/>
  		</inertial>
  		<visual>
  			<origin xyz="0 0 ${h}" rpy="0 0 0"/>
  			<geometry>
  				<mesh filename="package://alpha_dog_description/meshes/base_link.STL" scale="1 1 1"/>
  			</geometry>
  			<material name="">
  				<color rgba="1 0.6 0 1"/>
  			</material>
  		</visual>
  		<collision>
  			<origin xyz="0 0 ${h}" rpy="0.0 0.0 0.0"/>
  			<geometry>
  				<box size="0.20 0.19 0.1076"/>
  			</geometry>
  		</collision>
  	</link>
  
  	<!-- 雷达连杆 -->
  	<link name="laser">
  		<visual>
  			<origin xyz="0.01 0 0.045" rpy="0 0 0"/>
  			<geometry>
  				<cylinder length="0.04" radius="0.02"/>
  			</geometry>
  			<material name="">
  				<color rgba="0 1 0 1"/>
  			</material>
  		</visual>
  		<collision>
  			<origin xyz="0.01 0 0.045" rpy="0 0 0"/>
  			<geometry>
  				<cylinder length="0.04" radius="0.02"/>
  			</geometry>
  		</collision>
  		<inertial>
  			<mass value="0.1"/>
  			<inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
  		</inertial>
  	</link>
  
  	<!-- 雷达关节 -->
  	<joint name="laser_joint" type="fixed">
  		<parent link="base_link"/>
  		<child link="laser"/>
  		 <origin xyz="0.01 0 ${0.045 + h}" rpy="0 0 3.14159"/>
  		<axis xyz="0 0 1"/>
  	</joint>
  
  	<!-- IMU连杆 -->
  	<link name="imu_link">
  		<visual>
  			<origin xyz="0.04 0 0.03" rpy="0 0 0"/>
  			<geometry>
  				<box size="0.03 0.03 0.02"/>
  			</geometry>
  			<material name="">
  				<color rgba="1 0 0 1"/>
  			</material>
  		</visual>
  		<collision>
  			<origin xyz="0.04 0 0.03" rpy="0 0 0"/>
  			<geometry>
  				<box size="0.03 0.03 0.02"/>
  			</geometry>
  		</collision>
  		<inertial>
  			<mass value="0.05"/>
  			<inertia ixx="0.00001" ixy="0" ixz="0" iyy="0.00001" iyz="0" izz="0.00001"/>
  		</inertial>
  	</link>
  
  	<!-- IMU关节 -->
  	<joint name="imu_joint" type="fixed">
  		<parent link="base_link"/>
  		<child link="imu_link"/>
  		<origin xyz="0.04 0 ${0.03 + h}" rpy="0 0 0"/>
  		<axis xyz="0 0 1"/>
  	</joint>
  
  	<!-- 前右abad关节 -->
  ```

  

  其中尤为关键的是 URDF 配置中激光雷达关节的`rpy="0 0 3.14159"`（即绕 z 轴旋转 180 度）这一参数。

  由于我们通过 [2. rf2o_laser_odometry](#2. rf2o_laser_odometry) 包计算并发布`/odom`里程计话题，而 rf2o 的核心逻辑是默认以激光雷达的 x 轴（扫描正方向）作为机器人的前进方向（base_link 的 x 轴），因此必须保证**仿真 / 真实激光雷达的物理安装 x 轴朝向，与 URDF 中声明的 rpy 朝向完全一致**。

  若二者存在偏差（比如 URDF 声明朝前但物理雷达朝后），会直接导致 rf2o 计算的运动方向判定反转 —— 具体表现为导航规划中机器人本应前进，实际却持续后退，最终出现 180 度的运动方向错位问题。

  ```xml
  	<!-- 雷达关节 -->
  	<joint name="laser_joint" type="fixed">
  		<parent link="base_link"/>
  		<child link="laser"/>
  		 <origin xyz="0.01 0 0.045" rpy="0 0 3.14159"/>  <!-- yaw=180度，匹配朝后安装 -->
  		<axis xyz="0 0 1"/>
  	</joint>
  ```


### ii. alpha_dog_driver

`基于官方 agentos_sdk 驱动包进行二次开发，构建一款机器狗通信驱动包。该驱动包需实现基于 cmd_vel 指令的解析与转换，以完成对机器狗的运动控制；`

同时将[3-3  测试](#3-3  测试)、[1-6 初步控制](#1-6 初步控制) 功能模块整合至该驱动包中。

> [!TIP]
>
> 可以使用以下键盘控制包来控制，下面是另一种自己写的方法
>
> ```bash
> sudo apt-get install ros-$ROS_DISTRO-teleop-twist-keyboard
> 
> rosrun teleop_twist_keyboard teleop_twist_keyboard.py
> ```
>

- **导包**

  ```bash
  # 进入机器狗驱动包所在工作空间目录
  cd ~/navdg_ws/src/doge_ros
  
  # 创建自定义驱动功能包alpha_dog_driver，依赖核心ROS库/消息包
  catkin_create_pkg alpha_dog_driver rospy roscpp actionlib geometry_msgs agent_msgs std_msgs
  
  # 编译工作空间（自动跳过标记为CATKIN_IGNORE的功能包）
  cd ~/navdg_ws && catkin build
  ```

- **添加文件**

  - **action2dog.py**

    ```bash
    #!/usr/bin/env python3
    """
    AlphaDog Dev Q 机器人运动控制驱动节点 (ROS Action 机制)
    功能：订阅 /cmd_vel 速度指令，通过 Action 控制机器狗运动
    特性：速度平滑、防抖、限速、最小速度保护、安全退出
    """
    
    import rospy
    import json
    import actionlib
    from geometry_msgs.msg import Twist
    from agent_msgs.msg import ExecuteAction, ExecuteGoal
    
    class CmdVelToSkillConverter:
        """CmdVel 转 Action 控制节点"""
        
        def __init__(self):
            """初始化ROS节点、参数、客户端并完成机器狗初始化"""
            rospy.init_node('cmd_vel_to_skill_converter')
            rospy.on_shutdown(self.shutdown_callback)
    
            # 读取配置参数
            self.print_velocity_log = rospy.get_param('~print_velocity_log', True)
            self.max_vx = rospy.get_param('~max_vx', 3.0)
            self.max_wz = rospy.get_param('~max_wz', 3.0)
            self.action_timeout = rospy.get_param('~action_timeout', 10.0)
            self.hold_time = rospy.get_param('~hold_time', 3.0)
    
            # 防抖与平滑参数
            self.vx_threshold = rospy.get_param('~vx_threshold', 0.08)
            self.wz_threshold = rospy.get_param('~wz_threshold', 0.08)
            self.speed_diff_threshold = rospy.get_param('~speed_diff_threshold', 0.03)
            self.max_send_freq = rospy.get_param('~max_send_freq', 1.5)
            self.smooth_alpha = rospy.get_param('~smooth_alpha', 0.5)
    
            # 最小速度限制
            self.min_vel_x = 0.8
            self.min_vel_theta = 0.8
    
            # 上一帧速度缓存
            self.last_vx = 0.0
            self.last_wz = 0.0
            self.last_send_time = rospy.Time.now()
    
            # 初始化Action客户端
            self.do_action_client = actionlib.SimpleActionClient(
                '/agent_skill/do_action/execute', ExecuteAction
            )
            self.set_motion_client = actionlib.SimpleActionClient(
                '/agent_skill/set_motion_params/execute', ExecuteAction
            )
            self.dog_behavior_client = actionlib.SimpleActionClient(
                '/agent_skill/do_dog_behavior/execute', ExecuteAction
            )
    
            # 等待Action服务器连接
            self.do_action_client.wait_for_server(rospy.Duration(5.0))
            self.set_motion_client.wait_for_server(rospy.Duration(5.0))
            self.dog_behavior_client.wait_for_server(rospy.Duration(5.0))
    
            # 机器狗初始化：停止→站立→设置步态
            self.send_stop_action()
            self.send_ready_action()
            self.send_elegant_gait_action()
    
            # 订阅速度指令
            self.cmd_vel_sub = rospy.Subscriber(
                '/cmd_vel', Twist, self.cmd_vel_callback, queue_size=1
            )
    
            rospy.loginfo("✅ 驱动已启动：运动平滑 + 强制最小速度 + 防抖")
    
        def send_stop_action(self):
            """发送停止动作"""
            goal = ExecuteGoal()
            goal.invoker = "test_skill"
            goal.invoke_priority = 15
            goal.hold_time = self.hold_time
            goal.args = json.dumps({"action_id": 0})
            self.do_action_client.send_goal_and_wait(goal, rospy.Duration(self.action_timeout))
    
        def send_ready_action(self):
            """发送站立准备动作"""
            goal = ExecuteGoal()
            goal.invoker = "test_skill"
            goal.invoke_priority = 15
            goal.hold_time = self.hold_time
            goal.args = json.dumps({"action_id": 4})
            self.do_action_client.send_goal_and_wait(goal, rospy.Duration(self.action_timeout))
    
        def send_elegant_gait_action(self):
            """设置优雅步态"""
            goal = ExecuteGoal()
            goal.invoker = "test_skill"
            goal.invoke_priority = 15
            goal.hold_time = self.hold_time
            goal.args = json.dumps({"swing_traj_type": "Elegant"})
            self.set_motion_client.send_goal_and_wait(goal, rospy.Duration(20.0))
    
        def cmd_vel_callback(self, msg):
            """cmd_vel回调：处理速度并发送Action指令"""
            # 1. 限速
            target_vx = max(-self.max_vx, min(msg.linear.x, self.max_vx))
            target_wz = max(-self.max_wz, min(msg.angular.z, self.max_wz))
    
            # 2. 死区过滤
            if abs(target_vx) < self.vx_threshold:
                target_vx = 0.0
            if abs(target_wz) < self.wz_threshold:
                target_wz = 0.0
    
            # 3. 最小速度限制
            if target_vx > 0:
                target_vx = max(target_vx, self.min_vel_x)
            elif target_vx < 0:
                target_vx = min(target_vx, -self.min_vel_x)
    
            if abs(target_wz) > 0:
                sign = -1 if target_wz < 0 else 1
                target_wz = max(abs(target_wz), self.min_vel_theta) * sign
    
            # 4. 平滑滤波
            smooth_vx = self.last_vx * (1 - self.smooth_alpha) + target_vx * self.smooth_alpha
            smooth_wz = self.last_wz * (1 - self.smooth_alpha) + target_wz * self.smooth_alpha
    
            # 5. 发送频率限制
            current_time = rospy.Time.now()
            min_interval = 1.0 / self.max_send_freq
            if (current_time - self.last_send_time).to_sec() < min_interval:
                return
    
            # 6. 检查动作状态
            if self.set_motion_client.get_state() in [
                actionlib.GoalStatus.ACTIVE,
                actionlib.GoalStatus.PENDING
            ]:
                return
    
            # 7. 发送速度指令
            args = json.dumps({
                "vx": round(smooth_vx, 3),
                "wz": round(smooth_wz, 3)
            })
            goal = ExecuteGoal()
            goal.invoker = "test_skill"
            goal.invoke_priority = 15
            goal.hold_time = 0.1
            goal.args = args
            self.set_motion_client.send_goal(goal)
    
            # 8. 更新缓存
            self.last_vx = smooth_vx
            self.last_wz = smooth_wz
            self.last_send_time = current_time
    
            # 9. 日志输出
            if self.print_velocity_log:
                rospy.loginfo(f"发送 vx={smooth_vx:.2f}  wz={smooth_wz:.2f}")
    
        def shutdown_callback(self):
            """节点退出：安全停止并进入休眠"""
            rospy.loginfo("🛑 驱动退出，机器狗进入休眠模式")
            goal = ExecuteGoal()
            goal.invoker = "test_skill"
            goal.invoke_priority = 15
            goal.hold_time = self.hold_time
            goal.args = json.dumps({"behavior": "rest"})
            self.dog_behavior_client.send_goal_and_wait(goal, rospy.Duration(5.0))
    
    if __name__ == '__main__':
        try:
            node = CmdVelToSkillConverter()
            rospy.spin()
        except rospy.ROSInterruptException:
            rospy.loginfo("✅ 程序正常退出")
    ```

  - **velocity2dog.py**

    ```python
    #!/usr/bin/env python
    """
    AlphaDog Dev Q 机器人运动控制驱动节点
    功能：订阅 /cmd_vel 速度指令，通过 ROS Topic 直接控制机器狗运动
    """
    
    import rospy
    import json
    import actionlib
    from geometry_msgs.msg import Twist
    from ros_alphadog.msg import SetVelocity
    from agent_msgs.msg import ExecuteAction, ExecuteGoal
    
    
    class TwistToAgent:
        """Twist 转机器狗速度指令的控制节点"""
        
        def __init__(self):
            """初始化ROS节点、通信接口并完成机器狗初始化"""
            rospy.init_node('twist_to_agent')
            rospy.on_shutdown(self.shutdown_callback)
            
            rospy.loginfo("启动 AlphaDog 直接 Topic 控制驱动...")
            
            # 初始化Action客户端
            self.do_action_client = actionlib.SimpleActionClient(
                '/agent_skill/do_action/execute', ExecuteAction
            )
            self.set_motion_client = actionlib.SimpleActionClient(
                '/agent_skill/set_motion_params/execute', ExecuteAction
            )
            self.dog_behavior_client = actionlib.SimpleActionClient(
                '/agent_skill/do_dog_behavior/execute', ExecuteAction
            )
            
            # 等待Action服务器连接
            self.do_action_client.wait_for_server(rospy.Duration(3.0))
            self.set_motion_client.wait_for_server(rospy.Duration(3.0))
            self.dog_behavior_client.wait_for_server(rospy.Duration(3.0))
            
            # 初始化速度发布者
            self.vel_pub = rospy.Publisher(
                '/alphadog_node/set_velocity', 
                SetVelocity, 
                queue_size=10
            )
            
            # 初始化顺序：极限模式 → 自由步态 → 急停 → 站立
            rospy.loginfo("初始化机器狗状态...")
            #self.send_extreme_mode()      # 1. 设置极限模式
            #rospy.sleep(0.5)
            #self.send_freewalk_gait()     # 2. 设置自由行走步态
            #rospy.sleep(0.5)
            self.send_stop_action()       # 3. 急停
            rospy.sleep(0.5)
            self.send_stand_action()      # 4. 恢复站立
            rospy.sleep(1.5)
            self.send_move_action()       # 5. 准备移动
            
            rospy.loginfo("✅ 机器狗初始化完成，开始接收控制指令")
            
            # 订阅遥控/导航速度指令
            rospy.Subscriber('/cmd_vel', Twist, self.cmd_vel_cb, queue_size=1)
            rospy.loginfo("运动桥接节点启动!!!")
            
        def send_extreme_mode(self):
            """设置极限模式（异步发送，不卡死）"""
            goal = ExecuteGoal()
            goal.invoker = "test_skill"
            goal.invoke_priority = 15
            goal.hold_time = 3.0
            goal.args = json.dumps({"user_mode": 1})
            self.set_motion_client.send_goal(goal)  # 不等待返回
            rospy.loginfo("已发送：极限模式")
    
        def send_freewalk_gait(self):
            """设置自由行走步态（异步发送）"""
            goal = ExecuteGoal()
            goal.invoker = "test_skill"
            goal.invoke_priority = 15
            goal.hold_time = 3.0
            goal.args = json.dumps({"gait": 0})
            self.set_motion_client.send_goal(goal)
            rospy.loginfo("已发送：自由行走步态")
    
        def send_stop_action(self):
            """发送急停动作（异步发送）"""
            goal = ExecuteGoal()
            goal.invoker = "test_skill"
            goal.invoke_priority = 15
            goal.hold_time = 3.0
            goal.args = json.dumps({"action_id": 0})
            self.do_action_client.send_goal(goal)
            rospy.loginfo("已发送：急停")
            
        def send_stand_action(self):
            """恢复站立（异步发送）"""
            goal = ExecuteGoal()
            goal.invoker = "test_skill"
            goal.invoke_priority = 15
            goal.hold_time = 3.0
            goal.args = json.dumps({"action_id": 3})
            self.do_action_client.send_goal(goal)
            rospy.loginfo("已发送：恢复站立")
            
        def send_move_action(self):
            """准备移动（异步发送）"""
            goal = ExecuteGoal()
            goal.invoker = "test_skill"
            goal.invoke_priority = 15
            goal.hold_time = 3.0
            goal.args = json.dumps({"action_id": 4})
            self.do_action_client.send_goal(goal)
            rospy.loginfo("已发送：准备移动")
            
            
        def cmd_vel_cb(self, msg):
            """cmd_vel回调：转换并发布速度指令"""
            vel = SetVelocity()
            vel.vx = msg.linear.x
            vel.vy = msg.linear.y
            vel.wz = msg.angular.z
            self.vel_pub.publish(vel)
            
        def shutdown_callback(self):
            """节点退出：安全停止机器狗"""
            rospy.loginfo("🛑 驱动退出，停止运动")
            
            # 发送零速度
            vel = SetVelocity()
            vel.vx = 0.0
            vel.vy = 0.0
            vel.wz = 0.0
            self.vel_pub.publish(vel)
            rospy.sleep(0.2)
            
            # 休眠动作（异步）
            try:
                goal = ExecuteGoal()
                goal.invoker = "test_skill"
                goal.invoke_priority = 15
                goal.hold_time = 3.0
                goal.args = json.dumps({"behavior": "rest"})
                self.dog_behavior_client.send_goal(goal)
                rospy.loginfo("已发送休眠指令")
            except:
                pass
    
    
    if __name__ == '__main__':
        try:
            node = TwistToAgent()
            rospy.spin()
        except rospy.ROSInterruptException:
            rospy.loginfo("✅ 程序正常退出")
    ```


### iii. doge_bringup

`这个包主要用于集中管理各类传感器及驱动的启动流程，可将所有启动操作整合到同一个包中进行统一调用。`

- **导包**

  ```bash
  # 进入机器狗驱动包所在工作空间目录
  cd ~/navdg_ws/src/doge_ros
  
  # 创建自定义驱动功能包 doge_bringup，依赖核心ROS库/消息包
  catkin_create_pkg doge_bringup rospy roscpp actionlib geometry_msgs agent_msgs std_msgs
  
  # 编译工作空间（自动跳过标记为CATKIN_IGNORE的功能包）
  cd ~/navdg_ws && catkin build
  ```

- **添加文件**

  在 **doge_bringup** 功能包中添加以下文件与文件夹，内容待填充。

  ```bash
  # 一次性创建包含 include 子目录的 launch 路径
  mkdir -p ~/navdg_ws/src/doge_ros/doge_bringup/launch/include
  
  # 批量创建 launch 文件（根目录和 include 子目录分开处理）
  touch ~/navdg_ws/src/doge_ros/doge_bringup/launch/robot_dog.launch
  touch ~/navdg_ws/src/doge_ros/doge_bringup/launch/include/{alpha_dog_description,alpha_dog_driver,camera,ekf,imu,odom,rplidar}.launch
  ```

  - **include/alpha_dog_description.launch**

    ```xml
    <launch>
        <!-- 启动机器狗描述文件 -->
        <param name="robot_description" command="$(find xacro)/xacro --inorder '$(find alpha_dog_description)/urdf/devq_nav.urdf'" />
    
        <!-- 高速 joint_states 转换器 -->
        <node name="joint_state_converter" pkg="alpha_dog_description" type="joint_state_converter.py" output="screen" />
    
        <!-- 机器人状态发布器 -->
        <node name="robot_state_publisher" pkg="robot_state_publisher" type="robot_state_publisher" />
    
        <!-- rviz 启动条件：通过参数控制，默认不启动 -->
        <arg name="rviz" default="false" doc="Whether to launch rviz for visualization"/>
        <group if="$(arg rviz)">
            <node name="rviz" pkg="rviz" type="rviz" args="-d $(find alpha_dog_description)/rviz/urdf.rviz" />
        </group>
    
    </launch>
    ```

    

  - **include/alpha_dog_driver.launch**

    ```xml
    <launch>
        <!-- AlphaDog 机器狗 Topic直连运动控制启动文件 -->
        <node name="twist_to_agent" 
              pkg="alpha_dog_driver" 
              type="velocity2dog.py" 
              output="screen"  
              respawn="true">  
    
            <!-- 基础参数 -->
            <param name="~action_timeout" value="10.0" />
            <param name="~hold_time" value="3.0" />
    
            <!-- 话题重映射（按需开启） -->
            <!-- <remap from="/cmd_vel" to="/move_base/cmd_vel" /> -->
        </node>
    </launch>
    ```

  - **include/alpha_dog_driver_action.launch**

    这个是用动作服务进行控制的（未使用）

    ```xml
    <launch>
        <!-- 核心节点配置 -->
        <node name="cmd_vel_to_skill_converter" 
              pkg="alpha_dog_driver" 
              type="cmd_vel2dog.py" 
              output="screen"  
              respawn="true">  
    
            <!-- 基础可调参数（原有） -->
            <param name="~max_vx" value="3.0" />        <!-- 线速度上限 -->
            <param name="~max_wz" value="3.0" />        <!-- 角速度上限 -->
            <param name="~action_timeout" value="10.0" /> <!-- 动作超时时间 -->
            <param name="~hold_time" value="3.0" />     <!-- 指令保持时间 -->
            
            <!-- 新增：日志打印开关（核心需求） -->
            <param name="~print_velocity_log" value="True" /> <!-- True=打印日志，False=关闭 -->
            
            <!-- 新增：过滤+限频核心参数（无需改代码即可调整） -->
            # <param name="~vx_threshold" value="0.1" />      <!-- 线速度微小值过滤阈值 -->
            # <param name="~wz_threshold" value="0.1" />      <!-- 角速度微小值过滤阈值 -->
            # <param name="~speed_diff_threshold" value="0.03" /> <!-- 速度差异过滤阈值 -->
            # <param name="~max_send_freq" value="5" />       <!-- 最大指令发送频率(Hz) -->
            
            <!-- 重映射/cmd_vel话题（可选，适配导航节点不同输出） -->
            <!-- 若导航节点输出/move_base/cmd_vel，取消注释即可，无需改代码 -->
            <!-- <remap from="/cmd_vel" to="/move_base/cmd_vel" /> -->
        </node>
    </launch>
    ```

    

  - **include/camera.launch**

    ```xml
    <launch>
        <!-- 启动 摄像头 节点 -->
        <node pkg="doge_bringup" 
              type="pub_usbcam.py" 
              name="pub_usbcam" 
              output="screen"
              respawn="true"  
              respawn_delay="1">
    
            <!-- 可配置参数 -->
            <param name="~camera_id"        value="0" />          <!-- 摄像头设备编号 -->
            <param name="~frame_width"      value="640" />        <!-- 图像宽度 -->
            <param name="~frame_height"     value="480" />        <!-- 图像高度 -->
            <param name="~target_fps"       value="30" />         <!-- 目标发布帧率 -->
            <param name="~image_topic"      value="/camera_usb" />  <!-- 发布的话题名 -->
            <param name="~camera_frame_id"  value="camera_link" /> <!-- 摄像头坐标系ID -->
        </node>
    </launch>
    ```

    - **pub_usbcam.py**

      需要在 **scripts/** 文件夹中添加

      ```python
      #!/usr/bin/env python3
      # -*- coding: utf-8 -*-
      
      import rospy
      import cv2
      from sensor_msgs.msg import Image
      from cv_bridge import CvBridge
      
      def video_publisher():
          # 初始化ROS节点
          rospy.init_node('video_uploader', anonymous=True)
          # 创建发布者，队列大小设为10（避免帧堆积）
          image_pub = rospy.Publisher('/camera_usb', Image, queue_size=10)
          bridge = CvBridge()
      
          # 摄像头配置
          camera_id = 0  # 摄像头编号
          fps_target = 30  # 目标发布帧率
          rate = rospy.Rate(fps_target)  # ROS帧率控制
      
          # 关键：强制使用V4L2后端打开摄像头，避开GStreamer
          # CAP_V4L2是Linux下摄像头专用后端，Windows可用CAP_DSHOW
          cap = cv2.VideoCapture(camera_id, cv2.CAP_V4L2)
      
          # 摄像头参数配置（可选，根据需要调整）
          cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)   # 宽度
          cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)  # 高度
          cap.set(cv2.CAP_PROP_FPS, fps_target)    # 帧率
      
          # 检查摄像头是否成功打开
          if not cap.isOpened():
              rospy.logfatal("无法打开摄像头（编号：%d），请检查摄像头连接或权限", camera_id)
              return
      
          rospy.loginfo("摄像头已成功打开，开始发布图像到 /usb_cam/image_raw 话题...")
      
          try:
              while not rospy.is_shutdown():
                  # 读取帧
                  ret, frame = cap.read()
                  if not ret:
                      rospy.logwarn("读取摄像头帧失败，重试中...")
                      rate.sleep()
                      continue
      
                  # 转换为ROS Image消息
                  try:
                      image_msg = bridge.cv2_to_imgmsg(frame, "bgr8")
                      # 设置消息时间戳为当前ROS时间（重要，用于时间同步）
                      image_msg.header.stamp = rospy.Time.now()
                      image_msg.header.frame_id = "camera_link"  # 可选，关联坐标系
                      image_pub.publish(image_msg)
                  except Exception as e:
                      rospy.logerr("图像消息转换失败：%s", str(e))
      
                  # 按目标帧率休眠，避免发布过快
                  rate.sleep()
      
          finally:
              # 无论是否异常，都释放摄像头资源
              cap.release()
              rospy.loginfo("摄像头资源已释放，节点退出")
      
      if __name__ == '__main__':
          try:
              video_publisher()
          except rospy.ROSInterruptException:
              rospy.loginfo("节点被用户中断（Ctrl+C）")
          except Exception as e:
              rospy.logfatal("节点运行出错：%s", str(e))
      ```

      

  - **include/imu.launch**

    ```xml
    <launch>
        <!-- imu type, default normal -->
        <arg name="type" default="normal" doc="type [normal, modbus]"/>
    
        <!-- rviz 启动条件：通过参数控制，默认不启动 -->
        <arg name="rviz" default="false" doc="Whether to launch rviz for IMU visualization"/>
    
        <!-- imu python 节点配置 -->
        <node pkg="wit_ros_imu" type="wit_$(arg type)_ros.py" name="imu" output="screen">
            <param name="port"               type = "str"    value="/dev/wt61c"/>
            <param name="baud"               type = "int"    value="115200"/>
            <remap from="/wit/imu" to="/imu"/>
        </node>
    
        <!-- 条件启动rviz：仅当rviz参数为true时启动 -->
        <group if="$(arg rviz)">
            <node name="rviz" pkg="rviz" type="rviz" args="-d $(find wit_ros_imu)/rviz/wit_ros_imu.rviz"/>
        </group>
    </launch>
    ```

    [^ps]: IMU数据有两个，一个是机器狗自身的 **“/alphadog_node/imu”**，频率有点低，好像不能直接使用，所以需要外接一个IMU来使用。

    ```bash
    # 查看消息频率
    rostopic hz /alphadog_node/imu
    rostopic hz /imu
    ```

    

  - **include/odom.launch**

    ~~因为 [3. robot_localization](#3. robot_localization) 有点问题，所以这个没用。~~

    [^ps]: **突然能用了，难道是以前配置文件不对？？___26-03-10**

    

    ```xml
    <launch>
    
      <!-- 1. RF2O激光里程计：只订阅雷达/scan，输出odom_rf2o，不发TF（交给EKF） -->
      <!-- <node pkg="rf2o_laser_odometry" type="rf2o_laser_odometry_node" name="rf2o_laser_odometry" output="screen"> -->
        <!-- 订阅雷达数据 -->
        <!-- <param name="laser_scan_topic" value="/scan"/> -->
        <!-- 激光里程计输出话题 -->
        <!-- <param name="odom_topic" value="/odom_rf2o" /> -->
        <!-- 关闭TF发布，由EKF统一发布 -->
        <!-- <param name="publish_tf" value="false" />
        <param name="base_frame_id" value="base_link"/>
        <param name="odom_frame_id" value="odom" />
        <param name="init_pose_from_topic" value="" /> -->
    
        <!-- 计算频率 -->
        <!-- <param name="freq" value="6.0"/>
        <param name="verbose" value="false" /> -->
    
        <!-- 静止防漂移参数 -->
        <!-- <param name="min_update_vel" value="0.03"/> -->
        <!-- <param name="max_update_vel" value="1.5"/> -->
    
        <!-- 雷达匹配参数，不使用IMU -->
        <!-- <param name="max_correspondence_dist" value="0.3"/> -->
        <!-- <param name="kernel_size" value="3"/> -->
        <!-- <param name="use_imu" value="false"/> -->
      <!-- </node> -->
      
      
      <!-- 2. 机器狗机身完整里程计发布（位置+速度） -->
      <node pkg="doge_bringup" type="body_odom_pub.py" name="body_odom_pub" output="screen"/>
    
      <!-- 3. EKF融合：融合轮式里程计 + IMU -->
      <node pkg="robot_localization" type="ekf_localization_node" name="ekf_se" output="screen">
        <rosparam command="load" file="$(find doge_bringup)/config/ekf_fusion.yaml"/>
        <remap from="odometry/filtered" to="odom"/>
      </node>
    </launch>
    ```

    - **ekf_fusion.yaml**

      需要在 **config/** 文件夹中添加

      ```yaml
      # ekf_fusion.yaml
      frequency: 50                # 输出 50Hz 平滑里程计
      sensor_timeout: 0.1
      two_d_mode: true             # 2D 模式
      publish_tf: true             # 让 EKF 发布 odom->base_link
      transform_time_offset: 0.0
      transform_timeout: 0.0
      print_diagnostics: true
      debug: false
      
      map_frame: map
      odom_frame: odom
      base_link_frame: base_link
      world_frame: odom             # 连续估计，world_frame 设为 odom
      
      # ========== 主源：轮式里程计（高频，28Hz，位置+速度） ==========
      odom0: /odom_wheel
      odom0_config: [true, true, false,    # x, y 位置
                     false, false, true,    # yaw 姿态
                     true, true, false,     # vx, vy 线速度
                     false, false, true,    # 角速度 wz
                     false, false, false]   # 加速度
      odom0_differential: false             # 已经是绝对位置
      odom0_queue_size: 20
      
      # ========== IMU：提供角速度和姿态（仅 yaw） ==========
      imu0: /imu
      imu0_config: [false, false, false,    # 位置
                    false, false, true,     # 仅 yaw 姿态
                    false, false, false,    # 线速度
                    true, true, true,       # 角速度
                    false, false, false]    # 加速度
      imu0_differential: false
      imu0_queue_size: 20
      imu0_remove_gravitational_acceleration: true
      
      # ========== 可选辅助源：激光里程计（低频，6Hz，位置修正） ==========
      # 如果需要启用，请取消注释以下部分，并确保 rf2o_laser_odometry 节点正在运行
      # odom1: /odom_rf2o
      # odom1_config: [true, true, false,
      #                false, false, true,
      #                false, false, false,
      #                false, false, false,
      #                false, false, false]
      # odom1_differential: true              # 用差分模式，避免绝对位置冲突
      # odom1_queue_size: 10
      ```

    - **body_odom_pub.py**

      需要在 **scripts/** 文件夹中添加

      ```python
      #!/usr/bin/env python3
      # -*- coding: utf-8 -*-
      
      import rospy
      import tf
      from nav_msgs.msg import Odometry
      from geometry_msgs.msg import Point, Pose, Quaternion, Twist, Vector3
      from ros_alphadog.msg import RobotCtrlStatusStamped  # 根据实际包名调整
      
      class BodyOdomPublisher:
          """
          订阅 /alphadog_node/robot_ctrl_status
          提取 body 的位置 (x, y, yaw) 和速度 (vx, vy, wz)
          发布完整的 nav_msgs/Odometry 消息到 /odom_wheel
          """
          def __init__(self):
              rospy.init_node('body_odom_pub', anonymous=False)
              
              # 订阅机器狗控制状态
              self.sub = rospy.Subscriber(
                  '/alphadog_node/robot_ctrl_status', 
                  RobotCtrlStatusStamped, 
                  self.callback
              )
              
              # 发布轮式里程计（高频位置+速度）
              self.odom_pub = rospy.Publisher('/odom_wheel', Odometry, queue_size=50)
              
              rospy.loginfo(">>> Body Odom Publisher Started (publishing /odom_wheel)")
      
          def callback(self, msg):
              # 提取 body 状态
              body = msg.status.current_status.body
              
              # 获取时间戳
              current_time = msg.header.stamp
              
              # 构建 Odometry 消息
              odom = Odometry()
              odom.header.stamp = current_time
              odom.header.frame_id = "odom"          # 底层里程计坐标系
              odom.child_frame_id = "base_link"
              
              # 位置
              odom.pose.pose.position.x = body.x
              odom.pose.pose.position.y = body.y
              odom.pose.pose.position.z = 0.0        # 2D 平面
              
              # 姿态（从 roll, pitch, yaw 转换四元数）
              q = tf.transformations.quaternion_from_euler(body.roll, body.pitch, body.yaw)
              odom.pose.pose.orientation.x = q[0]
              odom.pose.pose.orientation.y = q[1]
              odom.pose.pose.orientation.z = q[2]
              odom.pose.pose.orientation.w = q[3]
              
              # 速度
              odom.twist.twist.linear.x = body.vx
              odom.twist.twist.linear.y = body.vy
              odom.twist.twist.linear.z = 0.0
              odom.twist.twist.angular.x = 0.0
              odom.twist.twist.angular.y = 0.0
              odom.twist.twist.angular.z = body.wz
              
              # 协方差（可根据实际调试调整）
              # 位置协方差 (x, y, yaw)
              odom.pose.covariance = [
                  0.01, 0, 0, 0, 0, 0,
                  0, 0.01, 0, 0, 0, 0,
                  0, 0, 1e-6, 0, 0, 0,
                  0, 0, 0, 1e-6, 0, 0,
                  0, 0, 0, 0, 1e-6, 0,
                  0, 0, 0, 0, 0, 0.01
              ]
              # 速度协方差 (vx, vy, wz)
              odom.twist.covariance = [
                  0.01, 0, 0, 0, 0, 0,
                  0, 0.01, 0, 0, 0, 0,
                  0, 0, 1e-6, 0, 0, 0,
                  0, 0, 0, 1e-6, 0, 0,
                  0, 0, 0, 0, 1e-6, 0,
                  0, 0, 0, 0, 0, 0.01
              ]
              
              # 发布里程计
              self.odom_pub.publish(odom)
              
              # 注意：EKF 会发布 odom->base_link 的 TF，这里不发布 TF，避免冲突
      
      if __name__ == '__main__':
          try:
              BodyOdomPublisher()
              rospy.spin()
          except rospy.ROSInterruptException:
              pass
      ```

      

  - **include/odom_rf2o.launch**

    单独的 **rf2o** 激光雷达里程计

    ```xml
    <launch>
      <!--
        RF2O 纯激光雷达里程计启动文件
        功能：仅依靠 2D 激光雷达 /scan 数据，实时计算位姿，发布 odom 话题与 TF 坐标变换
        特点：纯雷达里程计，不依赖 IMU、轮速里程计，适用于差速/阿克曼小车室内定位
      -->
    
      <!-- 启动 RF2O 激光里程计节点 -->
      <node pkg="rf2o_laser_odometry" type="rf2o_laser_odometry_node" name="rf2o_laser_odometry" output="screen">
        <!-- 激光雷达数据话题：订阅标准 /scan 话题 -->
        <param name="laser_scan_topic" value="/scan"/>        
        <!-- 里程计发布话题：直接发布到 /odom，供导航、SLAM 使用 -->
        <param name="odom_topic" value="/odom" />             
        <!-- 发布坐标变换：自动发布 odom → base_link 的 TF 树（必须开启） -->
        <param name="publish_tf" value="true" />                   
        <!-- 机器人基坐标系：固定为 base_link（ROS 标准坐标系） -->
        <param name="base_frame_id" value="base_link"/>            
        <!-- 里程计坐标系：固定为 odom（ROS 标准坐标系） -->
        <param name="odom_frame_id" value="odom" />                
        <!-- 初始位姿来源：空 = 从原点 (0,0,0) 启动，不订阅外部初始位姿 -->
        <param name="init_pose_from_topic" value="" />             
        <!-- 里程计计算频率：6Hz，适配 10Hz 雷达，保证计算稳定不卡顿 -->
        <param name="freq" value="6.0"/>                           
        <!-- 关闭详细日志：false = 只打印关键信息，减少终端刷屏 -->
        <param name="verbose" value="false" />                       
      </node>
    </launch>
    ```

    

  - **include/rplidar.launch**

    ```xml
    <launch>
      <!-- 雷达节点配置 -->
      <node name="rplidarNode" pkg="rplidar_ros" type="rplidarNode" output="screen">
        <param name="serial_port"         type="string" value="/dev/rplidar"/>
        <param name="serial_baudrate"     type="int"    value="115200"/>
        <param name="frame_id"            type="string" value="laser"/>
        <param name="inverted"            type="bool"   value="false"/>
        <param name="angle_compensate"    type="bool"   value="true"/>
      </node>
    
      <!-- rviz 启动条件：通过参数控制，默认不启动 -->
      <arg name="rviz" default="false" doc="Whether to launch rviz for visualization"/>
      <group if="$(arg rviz)">
        <node name="rviz" pkg="rviz" type="rviz" args="-d $(find rplidar_ros)/rviz/rplidar.rviz"/>
      </group>
    </launch>
    ```

    

  - **robot_dog.launch**

    ```xml
    <launch>
        <!-- 功能开关参数 -->
        <arg name="use_lidar" default="true" doc="使用激光雷达" />
        <arg name="use_cam" default="false" doc="使用摄像头" />
        <arg name="use_odom" default="true" doc="使用里程计" />
    
        <!-- 强制使用系统真实时间 -->
        <param name="/use_sim_time" value="false" />
    
        <!-- 1. 启动机器人模型 → 等待 laser → base_link TF -->
        <include file="$(find doge_bringup)/launch/include/alpha_dog_description.launch"/>
        <executable cmd="rosrun tf tf_wait laser base_link 5" output="screen"/> 
    
        <!-- 2. 启动底盘驱动 → 等待控制指令 -->
        <include file="$(find doge_bringup)/launch/include/alpha_dog_driver.launch"/>
        <executable cmd="rostopic wait /cmd_vel -t 5" output="screen"/>  
    
        <!-- 3. 启动雷达 → 等待点云数据 -->
        <include if="$(arg use_lidar)" file="$(find doge_bringup)/launch/include/rplidar.launch"/>
        <executable if="$(arg use_lidar)" cmd="rostopic wait /scan -t 5" output="screen"/>  
    
        <!-- 4. 启动摄像头（可选） -->
        <include if="$(arg use_cam)" file="$(find doge_bringup)/launch/include/camera.launch" />
        <executable if="$(arg use_cam)" cmd="rostopic wait /image_raw -t 5" output="screen"/>
    
        <!-- 5. 启动IMU → 等待惯性数据 -->
        <include file="$(find doge_bringup)/launch/include/imu.launch" />
        <executable cmd="rostopic wait /imu -t 5" output="screen"/>
    
        <!-- 6. 启动RF2O激光里程计（给EKF融合用） -->
        <include if="$(arg use_odom)" file="$(find doge_bringup)/launch/include/odom.launch" />
        <executable if="$(arg use_odom)" cmd="rostopic wait /scan -t 5" output="screen"/>
        <executable if="$(arg use_odom)" cmd="rosrun tf tf_wait laser base_link 5" output="screen"/>
    
        <!-- 固定 map → odom 坐标变换（导航/SLAM必需） -->
        <!-- <node pkg="tf2_ros" type="static_transform_publisher" name="map_to_odom_tf"
              args="0 0 0 0 0 0 map odom __name:=map_to_odom_tf" output="screen">
            <param name="use_sim_time" value="false"/>
        </node> -->
    
    </launch>
    ```

- 

  - **tf_echo.py**

    打印TF树坐标变化与对应发布者

    ```python
    #!/usr/bin/env python3
    import rospy
    import tf2_ros
    from tf2_msgs.msg import TFMessage
    import re
    
    class TFPublisherRecorder:
        def __init__(self):
            self.publisher_map = {}  # 键: (parent, child) 字符串元组, 值: 发布者节点名
            self._sub_tf = rospy.Subscriber('/tf', TFMessage, self.tf_callback, callback_args='/tf')
            self._sub_tf_static = rospy.Subscriber('/tf_static', TFMessage, self.tf_callback, callback_args='/tf_static')
        
        def tf_callback(self, msg, topic_name):
            # 获取发布者节点名
            callerid = msg._connection_header.get('callerid', 'unknown') if hasattr(msg, '_connection_header') else 'unknown'
            for transform in msg.transforms:
                parent = transform.header.frame_id
                child = transform.child_frame_id
                key = (parent, child)
                if key not in self.publisher_map:
                    self.publisher_map[key] = callerid
                    # 调试信息已注释掉，不再输出
                    # rospy.loginfo(f"Recorded transform: {parent} -> {child} from {callerid}")
    
    def main():
        rospy.init_node('print_tf_frames')
        recorder = TFPublisherRecorder()
        buffer = tf2_ros.Buffer()
        listener = tf2_ros.TransformListener(buffer)
        
        # 等待数据收集（可根据需要调整时间）
        rospy.sleep(1.0)
        
        frames_str = buffer.all_frames_as_string()
        
        if not frames_str.strip():
            print("No frames received. Check if TF topics are being published.")
            return
        
        # 解析父子关系（适应句子格式）
        parent_of = {}
        pattern = re.compile(r'Frame (\S+) exists with parent (\S+)\.')
        for line in frames_str.strip().split('\n'):
            line = line.strip()
            if not line:
                continue
            match = pattern.match(line)
            if match:
                child = match.group(1)
                parent = match.group(2)
                parent_of[child] = parent
            else:
                # 如果解析失败，忽略（不会影响主要输出）
                pass
        
        print("\nTF 树结构及发布者：")
        all_frames = set(parent_of.keys()) | set(parent_of.values())
        roots = [f for f in all_frames if f not in parent_of]
        
        def print_tree(frame, indent=0):
            # 打印当前节点名称
            print("  " * indent + frame, end='')
            # 获取发布者
            if frame in parent_of:
                parent = parent_of[frame]
                key = (parent, frame)
                pub = recorder.publisher_map.get(key, 'unknown')
                print(f"  [发布者: {pub}]")
            else:
                # 根节点没有父节点，可能是固定坐标系
                print("  [发布者: static]")
            
            # 递归打印子节点
            children = [child for child, par in parent_of.items() if par == frame]
            if children:
                for child in sorted(children):
                    print_tree(child, indent + 1)
        
        for root in sorted(roots):
            print_tree(root)
    
    if __name__ == '__main__':
        main()
    ```

    

  - **dogControl.py**

    将其添加到 `~/navdg_ws/src/doge_ros/alpha_dog_driver/scripts/` 目录并添加权限即可。

    > [!TIP]
    >
    > 可能会出现问题 `/usr/bin/env: ‘python\r’: No such file or directory` 或 `/usr/bin/env: ‘python3\r’: No such file or directory`
    >
    > 报错里的python3\r中\r是 Windows 的回车符（CR），Linux 系统只会识别\n（LF）作为换行符，导致/usr/bin/env解析#!/usr/bin/env python3时，把python3\r当成完整命令 —— 系统找不到名为python3\r的程序，因此报错。
    >
    > ```bash
    > # 直接清除\r符
    > sed -i 's/\r$//' ~/navdg_ws/src/doge_ros/alpha_dog_driver/scripts/dogControl.py
    > ```

    ```bash
    # 运行
    rosrun alpha_dog_driver dogControl.py
    ```

    

  - **~~doge_keyboard_control~~**

    ~~这个是使用 **c++** 来运行的，相关代码不在展示~~

    ~~**CMakeLists.txt** 主要配置~~

    ```tex
    include_directories(
      include # 这行代码是需要注释放开的
      ${catkin_INCLUDE_DIRS}
    )
    
    add_executable(keyboard_control_node src/doge_keyboard_control.cpp)
    
    add_dependencies(keyboard_control_node ${${PROJECT_NAME}_EXPORTED_TARGETS} ${catkin_EXPORTED_TARGETS})
    
    target_link_libraries(keyboard_control_node
      ${catkin_LIBRARIES}
    )
    ```

    ~~每次修改文件或配置文件都需要重新编译一下~~

    ```bash
    catkin build
    ```

    ==总是哪里有错误，还是使用 **teleop_twist_keyboard** 包了，省事，或者直接用 **dogControl.py** 进行控制也行==

  

## c. doge_slam_nav

`存放关于所有建图、导航的配置文件。`

==未完善==

- **导包**

  ```bash
  # 进入机器狗驱动包所在工作空间目录
  cd ~/navdg_ws/src/
  
  # 创建自定义驱动功能包 doge_slam_nav，依赖核心ROS库/消息包
  catkin_create_pkg doge_slam_nav rospy roscpp std_msgs
  
  # 编译工作空间（自动跳过标记为CATKIN_IGNORE的功能包）
  cd ~/navdg_ws && catkin build
  ```

- **config/**                                               # 谷歌建图导航的lua配置文件

  - 

- **launch/**                                             # 谷歌/gmapping 的 建图/导航 启动文件

  - **include/**
    -   

    -   

  - 

  - ​    

- **maps/**                                               # 建图的地图文件（默认使用map） 

  - **map.pbstream**
  - **map.pgm**
  - **map.yaml**

- **params/**                                           # 自动导航、重定位配置文件

  -  

- **rviz/**                                                  # rviz文件（多点导航、导航、建图）

  - **2d_multi_navigate.rviz**
  - **2d_navigate.rviz**
  - **2d_slam gmapping.rviz**
  - **2d_slam.rviz**

## d. doge_tools

`各种工具、功能包集合。`

### i. agentos_sdk

`AlphaDog 官方 AgentOS SDK，一键初始化开发环境，示例丰富，助你在 5 分钟跑通首个智能体，支持模拟器与真机无缝部署。`

- **导包**

  依据 [3. agentos_sdk](/posts/project/weilan-devq-01/#3-agentos_sdk)  进行官方SDK的包的配置，**actionlib_tools** 相关错误不再赘叙。

  ```bash
  # 进入navdg_ws工作空间目录
  cd ~/navdg_ws/src/doge_tools/
  
  # 克隆 agentos_sdk 代码到src/doge_tools目录下
  git clone https://github.com/AlphaDogDeveloper/agentos_sdk.git 
  
  # 编译工作空间（跳过CATKIN_IGNORE标记的包）
  catkin build
  
  # 刷新当前终端的ROS环境变量，使编译后的包生效
  source devel/setup.bash
  ```

  

> [!TIP]
>
> 可以参考这个项目修改相应包 [alphadog_ros_ctl: 蔚蓝机器狗dev版本使用ros1 bridge连通ROS Humble和ROS Noetic，实现Joystick手柄遥控操作机器狗。](https://gitee.com/chenxin852/alphadog_ros_ctl)
>
> 由于 **[2. alpha_dog_driver](#2. alpha_dog_driver)** 中 velocity2dog.py 需要使用话题 **/alphadog_node/set_velocity** 来控制运动，但是官网下载的包没有这个话题，上面的链接可以下载到相应的包，分别替换掉原先的 **agent_msgs** 和 **ros_alphadog**，为了防止失效，下面的是对应压缩包
>
> [agent_msgs.zip](file\agent_msgs.zip)  [ros_alphadog.zip](file\ros_alphadog.zip) 
>
> 然后重新编译对应包并验证
>
> ```bash
> cd ~/navdg_ws
> 
> # 1. 确认 msg 文件存在
> ls src/doge_tools/agentos_sdk/ros_alphadog/msg/SetVelocity.msg
> 
> # 2. 清理并强制编译
> rm -rf build/ros_alphadog devel/lib/python3/dist-packages/ros_alphadog devel/include/ros_alphadog
> catkin clean ros_alphadog  # 如果使用 catkin 工具
> catkin build ros_alphadog --force-cmake -v
> 
> # 3. 检查生成结果
> ls devel/lib/python3/dist-packages/ros_alphadog/msg/_SetVelocity.py
> ls devel/include/ros_alphadog/SetVelocity.h
> 
> # 4. source 并测试
> source devel/setup.bash
> rosmsg show ros_alphadog/SetVelocity
> rostopic pub /alphadog_node/ ros_alphadog/SetVelocity "linear_x: 0.1
> linear_y: 0.0
> angular_z: 0.0" -r 10
> ```
>
> 
>
> **/alphadog_node/SetVelocity** 的数据流
>
> ```bash
> jetson@nano:~$ rostopic echo /alphadog_node/set_velocity -n 3
> vx: 0.0
> vy: 0.0
> wz: -0.30000001192092896
> ---
> vx: 0.0
> vy: 0.0
> wz: 0.30000001192092896
> ---
> vx: 0.30000001192092896
> vy: 0.0
> wz: 0.0
> ---
> ```
>

### ii. rf2o_laser_odometry

`rf2o_laser_odometry：基于2D激光雷达的实时快速视觉测程ROS包。`

参考安装：[rf2o_laser_odometry](/posts/ros/ros-package/#c-rf2o_laser_odometry) 

### iii. robot_localization

`robot_localization：ROS官方多传感器融合框架，EKF/UKF算法一键融合IMU、里程计、GPS，输出稳健位姿。`

参考安装：[robot_localization](/posts/ros/ros-package/#d-robot_localization) 

### iv. rplidar_ros

`RPLIDAR ROS驱动，即插即用，发布激光扫描话题，兼容全系Slamtec雷达，支持ROS1/2。`

参考安装：[rplidar_ros](/posts/ros/ros-package/#e-rplidar_ros)  

### v. slam_gmapping

`slam_gmapping：ROS官方2D激光SLAM包，基于OpenSLAM GMapping，实时建图，TF输出地图与位姿。`

- **导包**

  ```bash
  # 进入navdg_ws工作空间目录
  cd ~/navdg_ws/src/doge_tools/
  
  # 先克隆元功能包 slam_gmapping
  git clone https://github.com/ros-perception/slam_gmapping.git
  
  # 再进入目录拉取算法核心
  cd slam_gmapping
  git clone https://github.com/ros-perception/openslam_gmapping.git
  
  # 编译工作空间（跳过CATKIN_IGNORE标记的包）
  catkin build
  
  # 刷新当前终端的ROS环境变量，使编译后的包生效
  source devel/setup.bash
  ```


### vi. wit_ros_imu

参考安装：[wit_ros_imu](/posts/ros/ros-package/#f-wit_ros_imu)  



## 参考配置文件

```yaml
# teb_local_planner_params.yaml

# ==============================
# 机器狗 稳定导航配置
# ==============================

#==========================
# 速度范围
#==========================
min_vel_x: 1.5              # 提高！避免低速步态不稳
max_vel_x: 2.5              # 降低最高速，稳定优先
min_vel_theta: 1.0          # 提高最小旋转，快速对准
max_vel_theta: 2.0          # 降低最大旋转，避免过冲
max_vel_x_backwards: 0.05    # 禁止后退！解决前后抖动

scale_vel_x: false
scale_vel_theta: false

#==========================
# 加速度（保守稳定）
#==========================
acc_lim_x: 1.3              # 降低！避免急加速
acc_lim_theta: 1.5          # 降低角加速度

#==========================
# 运动学模型
#==========================
min_turning_radius: 0.0
footprint_model:
  type: "circular"          # 改为圆形，更准确
  radius: 0.3
is_footprint_dynamic: false

#==========================
# 目标容忍度（放宽到位）
#==========================
xy_goal_tolerance: 0.2      # 放宽，减少末端微调
yaw_goal_tolerance: 0.1     # 放宽角度，允许偏差
free_goal_vel: true         # 到达前不强制减速

#==========================
# 时间参数
#==========================
dt_ref: 0.4                 # 提高，降低计算量
dt_hysteresis: 0.1
min_samples: 4
global_plan_overwrite_orientation: true
max_global_plan_lookahead_dist: 3.0   # 降低，只看近处
feasibility_check_no_poses: 2
exact_arc_length: true
allow_init_with_backwards_motion: false  # 禁止后退

#==========================
# 障碍物参数
# TEB 不怎么看 costmap，只看自己的 min_obstacle_dist，所以贴墙走
# inflation_dist = 0.3
# → 障碍物外面 30cm 画一条红线
# min_obstacle_dist = 0.35
# → 机器人必须离红线还有 5cm 才敢走
# 结果：
# 机器人离真实障碍物 至少 35cm
#==========================
min_obstacle_dist: 0.35       # 安全距离拉大,TEB 自己要求：离障碍物 ≥ 35cm
inflation_dist: 0.30          # 膨胀安全距离,TEB 尊重 costmap 膨胀层：30cm
include_costmap_obstacles: true
include_dynamic_obstacles: true

#==========================
# 优化权重
#==========================
no_inner_iterations: 3      # 提高，稳定优化
no_outer_iterations: 3

# 降低时间权重，避免冲突
weight_optimaltime: 15.0    # 降低，不急于赶路

# 平衡速度与方向
weight_max_vel_x: 5.0       # 提高前进权重
weight_max_vel_theta: 10.0  # 降低转向权重，避免过度转向
weight_acc_lim_x: 10.0
weight_acc_lim_theta: 10.0
weight_kinematics_nh: 100.0
weight_obstacle: 50.0        # 避障权重拉满！优先远离障碍
weight_inflation: 10.0        # 重视膨胀层

# 删除或降低 orientation 权重，避免冲突
# weight_orientation: 10.0      # 降低或删除
# weight_orientation_goal: 10.0 # 降低或删除
# weight_velocity_x: 10.0      # 删除，用 weight_max_vel_x
# weight_velocity_theta: 10.0  # 删除，用 weight_max_vel_theta

#==========================
# 其他
#==========================
odom_topic: odom
map_frame: map

#==========================
# 可视化
#==========================
publish_feedback: true
publish_global_plan: true
publish_local_plan: true
```

```yaml
# teb_local_planner_params.yaml - 机器狗避障优化版

# ==============================
# 速度（保持你的要求）
# ==============================
min_vel_x: 1.5
max_vel_x: 2.5
min_vel_theta: 1.0
max_vel_theta: 2.0
max_vel_x_backwards: 0.3      # 关键！允许后退脱困

acc_lim_x: 1.3
acc_lim_theta: 1.5

# ==============================
# 运动学
# ==============================
min_turning_radius: 0.0
footprint_model:
  type: "polygon"             # 改回多边形，比圆形更紧凑
  vertices: [[0.26, 0.15], [0.26, -0.15], [-0.26, -0.15], [-0.26, 0.15]]

# ==============================
# 目标容忍
# ==============================
xy_goal_tolerance: 0.2
yaw_goal_tolerance: 0.1
free_goal_vel: false

# ==============================
# 时间参数（优化计算）
# ==============================
dt_ref: 0.3                   # 从 0.4 降到 0.3，更精细
dt_hysteresis: 0.05
min_samples: 3
global_plan_overwrite_orientation: true
max_global_plan_lookahead_dist: 3.0   # 从 4.0 降到 3.0，减少远期障碍干扰
feasibility_check_no_poses: 3         # 增加检查点
allow_init_with_backwards_motion: true # 允许后退初始化

# ==============================
# 障碍物参数（核心修复！）
# ==============================
# 策略：costmap 负责"安全距离"，TEB 负责"灵活绕行"

min_obstacle_dist: 0.10       # 关键！只留 5cm 缓冲，贴着 costmap 走
inflation_dist: 0.35          # 安全距离移到 costmap 层（见 local_costmap）
include_costmap_obstacles: true
include_dynamic_obstacles: true
costmap_obstacles_behind_robot_dist: 0.5  # 减少后方障碍干扰

# 关键：允许穿越轻微碰撞（让优化器有解）
obstacle_association_force_inclusion_factor: 1.0
obstacle_association_cutoff_factor: 5.0

# ==============================
# 优化权重（明确优先级）
# ==============================
no_inner_iterations: 5        # 增加迭代，找到更优解
no_outer_iterations: 4

# 优先级：时间 > 路径 > 避障
weight_optimaltime: 30.0      # 最高！优先快速到达
weight_shortest_path: 20.0    # 新增！优先短路径
weight_obstacle: 15.0         # 降低！相信 costmap 膨胀层
weight_inflation: 5.0         # 降低！

weight_max_vel_x: 10.0
weight_max_vel_theta: 5.0
weight_acc_lim_x: 10.0
weight_acc_lim_theta: 10.0
weight_kinematics_nh: 1000.0
weight_kinematics_forward_drive: 500.0  # 优先前进，但允许后退

# ==============================
# 脱困行为
# ==============================
allow_init_with_backwards_motion: true
exact_arc_length: false       # 降低计算量
shrink_horizon_backup: true   # 障碍密集时缩短预测，更灵活

# ==============================
# 其他
# ==============================
odom_topic: odom
map_frame: map
publish_feedback: true
publish_global_plan: true
publish_local_plan: true
```

```yaml
# teb_local_planner_params.yaml - 机器狗避障优化版

# ==============================
# 速度限制
# ==============================
min_vel_x: 1.5
max_vel_x: 2.5
min_vel_theta: 1.0
max_vel_theta: 2.0
max_vel_x_backwards: 0.3          # 允许后退脱困
acc_lim_x: 1.3
acc_lim_theta: 1.5

# ==============================
# 运动学模型
# ==============================
min_turning_radius: 0.0
footprint_model:
  type: "polygon"                  # 多边形足迹，更紧凑
  vertices: [[0.26, 0.15], [0.26, -0.15], [-0.26, -0.15], [-0.26, 0.15]]

# ==============================
# 目标容差
# ==============================
xy_goal_tolerance: 0.2
yaw_goal_tolerance: 0.1
free_goal_vel: false

# ==============================
# 轨迹时间参数
# ==============================
dt_ref: 0.3                        # 时间步长参考值
dt_hysteresis: 0.05
min_samples: 3
global_plan_overwrite_orientation: true
max_global_plan_lookahead_dist: 3.0  # 前瞻距离
feasibility_check_no_poses: 5         # 增加检测点数
allow_init_with_backwards_motion: true # 允许后退初始化

# ==============================
# 障碍物处理
# ==============================
min_obstacle_dist: 0.30             # 障碍物最小距离，提高安全余量
inflation_dist: 0.40                 # 考虑膨胀层的范围
include_costmap_obstacles: true
include_dynamic_obstacles: true
costmap_obstacles_behind_robot_dist: 0.5
obstacle_association_force_inclusion_factor: 1.0
obstacle_association_cutoff_factor: 5.0

# ==============================
# 优化器参数
# ==============================
no_inner_iterations: 5
no_outer_iterations: 4

# 权重配置
weight_optimaltime: 20.0             # 时间最优权重（降低）
weight_shortest_path: 10.0            # 路径最短权重（降低）
weight_obstacle: 40.0                 # 避障权重（大幅提高）
weight_inflation: 20.0                # 膨胀代价权重（提高）

weight_max_vel_x: 10.0
weight_max_vel_theta: 5.0
weight_acc_lim_x: 10.0
weight_acc_lim_theta: 10.0
weight_kinematics_nh: 1000.0
weight_kinematics_forward_drive: 500.0  # 鼓励前进，允许后退

# ==============================
# 脱困与自适应
# ==============================
exact_arc_length: false               # 降低计算量
shrink_horizon_backup: true            # 障碍密集时缩短预测时域

# ==============================
# 发布与调试
# ==============================
odom_topic: odom
map_frame: map
publish_feedback: true
publish_global_plan: true
publish_local_plan: true
```

```bash
cd ~/navdg_ws

# 1. 确认 msg 文件存在
ls src/doge_tools/agentos_sdk/ros_alphadog/msg/SetVelocity.msg

# 2. 清理并强制编译
rm -rf build/ros_alphadog devel/lib/python3/dist-packages/ros_alphadog devel/include/ros_alphadog
catkin clean ros_alphadog  # 如果使用 catkin 工具
catkin build ros_alphadog --force-cmake -v

# 3. 检查生成结果
ls devel/lib/python3/dist-packages/ros_alphadog/msg/_SetVelocity.py
ls devel/include/ros_alphadog/SetVelocity.h

# 4. source 并测试
source devel/setup.bash
rosmsg show ros_alphadog/SetVelocity
rostopic pub /alphadog_node/set_velocity ros_alphadog/SetVelocity "linear_x: 0.1
linear_y: 0.0
angular_z: 0.0" -r 10
```

```bash
rosmsg show $(rostopic type /alphadog_node/set_velocity)

cd ~/navdg_ws

# 清理旧的构建（因为混合使用了 catkin_make 和 catkin build）
rm -rf build devel

# 使用 catkin build 重新编译整个工作空间
catkin build

# 或者只编译特定包
catkin build ros_alphadog alphadog_node  # 假设节点包名为 alphadog_node

# 重新 source
source devel/setup.bash
```



---

# 附录一



```bash
nav@nav:~$ rosnode list
/agent_skill/do_action
/agent_skill/do_dog_behavior
/agent_skill/set_fan
/agent_skill/set_motion_params
/agent_skill/smart_action
/alpha_ota/master_monitor_sport_2662_7606634791718745467
/alpha_ota/otainfo_sport_2662_4823919639029699506
/alpha_ota/period_check_sport_2662_136334712616826871
/alpha_ota/test_stamp
/alpha_ota/update_sport_2662_3551789295554763005
/alphadog_aux/alphadog_aux_node
/alphadog_aux/alphadog_sys_config
/alphadog_aux/battery_node
/alphadog_aux/ble_gatt_server
/alphadog_aux/bluetooth_ctrl
/alphadog_node
/record_1765863585663723424
/record_1765863586952610590
/rosapi_sport_4222_2754248827174598445
/rosbridge_websocket_sport_4222_6839454880686718657
/rosout
/test_hw_unit
/x_rosbridge
nav@nav:~$
```



```bash
nav@nav:~$ rostopic list 
/agent_msgs/event/launch
/agent_skill/do_action/control/cancel
/agent_skill/do_action/control/feedback
/agent_skill/do_action/control/goal
/agent_skill/do_action/control/result
/agent_skill/do_action/control/status
/agent_skill/do_action/control_status
/agent_skill/do_action/execute/cancel
/agent_skill/do_action/execute/feedback
/agent_skill/do_action/execute/goal
/agent_skill/do_action/execute/result
/agent_skill/do_action/execute/status
/agent_skill/do_action/execute_status
/agent_skill/do_action/ext_actions
/agent_skill/do_action/version
/agent_skill/do_dog_behavior/control/cancel
/agent_skill/do_dog_behavior/control/feedback
/agent_skill/do_dog_behavior/control/goal
/agent_skill/do_dog_behavior/control/result
/agent_skill/do_dog_behavior/control/status
/agent_skill/do_dog_behavior/control_status
/agent_skill/do_dog_behavior/dog_behaviors
/agent_skill/do_dog_behavior/execute/cancel
/agent_skill/do_dog_behavior/execute/feedback
/agent_skill/do_dog_behavior/execute/goal
/agent_skill/do_dog_behavior/execute/result
/agent_skill/do_dog_behavior/execute/status
/agent_skill/do_dog_behavior/execute_status
/agent_skill/do_dog_behavior/version
/agent_skill/set_fan/control/cancel
/agent_skill/set_fan/control/feedback
/agent_skill/set_fan/control/goal
/agent_skill/set_fan/control/result
/agent_skill/set_fan/control/status
/agent_skill/set_fan/control_status
/agent_skill/set_fan/execute/cancel
/agent_skill/set_fan/execute/feedback
/agent_skill/set_fan/execute/goal
/agent_skill/set_fan/execute/result
/agent_skill/set_fan/execute/status
/agent_skill/set_fan/execute_status
/agent_skill/set_fan/parameter/duty_cycle
/agent_skill/set_fan/parameter/enable
/agent_skill/set_fan/version
/agent_skill/set_motion_params/control/cancel
/agent_skill/set_motion_params/control/feedback
/agent_skill/set_motion_params/control/goal
/agent_skill/set_motion_params/control/result
/agent_skill/set_motion_params/control/status
/agent_skill/set_motion_params/control_status
/agent_skill/set_motion_params/execute/cancel
/agent_skill/set_motion_params/execute/feedback
/agent_skill/set_motion_params/execute/goal
/agent_skill/set_motion_params/execute/result
/agent_skill/set_motion_params/execute/status
/agent_skill/set_motion_params/execute_status
/agent_skill/set_motion_params/version
/agent_skill/smart_action/control/cancel
/agent_skill/smart_action/control/feedback
/agent_skill/smart_action/control/goal
/agent_skill/smart_action/control/result
/agent_skill/smart_action/control/status
/agent_skill/smart_action/control_status
/agent_skill/smart_action/execute/cancel
/agent_skill/smart_action/execute/feedback
/agent_skill/smart_action/execute/goal
/agent_skill/smart_action/execute/result
/agent_skill/smart_action/execute/status
/agent_skill/smart_action/execute_status
/agent_skill/smart_action/version
/alpha_ota/app_hbevt
/alpha_ota/checkver
/alpha_ota/current_version
/alpha_ota/do_ntpdate
/alpha_ota/download_package
/alpha_ota/download_progress
/alpha_ota/heart_beat
/alpha_ota/internet_access
/alpha_ota/internet_access_info
/alpha_ota/internet_access_self_info
/alpha_ota/internet_state
/alpha_ota/module_version
/alpha_ota/network_exception
/alpha_ota/ntpdate_fail
/alpha_ota/reset_wifiap_psk
/alpha_ota/restore_default
/alpha_ota/set_download_options
/alpha_ota/stop_download
/alpha_ota/system_update_status
/alpha_ota/update
/alpha_ota/update_result
/alpha_ota/version_info_list
/alpha_ota/wifi_scan
/alpha_ota/wifi_scan_list
/alpha_ota/wifiap_info
/alphadog_aux/alphadog_sys_config/parameter_descriptions
/alphadog_aux/alphadog_sys_config/parameter_updates
/alphadog_aux/battery_state
/alphadog_aux/ble_gatt_server/event
/alphadog_aux/ble_gatt_server/joy
/alphadog_aux/teleop_robot/control/cancel
/alphadog_aux/teleop_robot/control/feedback
/alphadog_aux/teleop_robot/control/goal
/alphadog_aux/teleop_robot/control/result
/alphadog_aux/teleop_robot/control/status
/alphadog_aux/teleop_robot/control_status
/alphadog_aux/teleop_robot/up_down_mode
/alphadog_aux/teleop_robot/version
/alphadog_node/available_actions
/alphadog_node/battery_state
/alphadog_node/body_status
/alphadog_node/boot_up_state
/alphadog_node/delete_record_action/cancel
/alphadog_node/delete_record_action/feedback
/alphadog_node/delete_record_action/goal
/alphadog_node/delete_record_action/result
/alphadog_node/delete_record_action/status
/alphadog_node/desired_joint_states
/alphadog_node/do_action/cancel
/alphadog_node/do_action/feedback
/alphadog_node/do_action/goal
/alphadog_node/do_action/result
/alphadog_node/do_action/status
/alphadog_node/dog_ctrl_config
/alphadog_node/dog_ctrl_state
/alphadog_node/event
/alphadog_node/event_data/battery_state
/alphadog_node/event_data/dog_ctrl_config
/alphadog_node/event_data/robot_ctrl_status
/alphadog_node/ext_force_status
/alphadog_node/finish_record_action/cancel
/alphadog_node/finish_record_action/feedback
/alphadog_node/finish_record_action/goal
/alphadog_node/finish_record_action/result
/alphadog_node/finish_record_action/status
/alphadog_node/ground_status
/alphadog_node/imu
/alphadog_node/joint_states
/alphadog_node/parameter_descriptions
/alphadog_node/parameter_updates
/alphadog_node/record_video
/alphadog_node/robot_ctrl_status
/alphadog_node/robot_ready
/alphadog_node/robot_system_info
/alphadog_node/save_record_action/cancel
/alphadog_node/save_record_action/feedback
/alphadog_node/save_record_action/goal
/alphadog_node/save_record_action/result
/alphadog_node/save_record_action/status
/alphadog_node/sbus
/alphadog_node/set_body_position
/alphadog_node/set_collision_protect
/alphadog_node/set_controller_type
/alphadog_node/set_decelerate
/alphadog_node/set_dynamic_params
/alphadog_node/set_foot_height
/alphadog_node/set_free_leg
/alphadog_node/set_friction
/alphadog_node/set_gait
/alphadog_node/set_ground_model
/alphadog_node/set_jump_angle
/alphadog_node/set_jump_distance
/alphadog_node/set_led_screen
/alphadog_node/set_model_scale
/alphadog_node/set_remote_controller_config
/alphadog_node/set_rpy
/alphadog_node/set_swaying_duration
/alphadog_node/set_swing_duration
/alphadog_node/set_swing_traj_type
/alphadog_node/set_user_mode
/alphadog_node/set_velocity
/alphadog_node/set_velocity_decay
/alphadog_node/spi_status
/alphadog_node/spine_info
/alphadog_node/start_record_action/cancel
/alphadog_node/start_record_action/feedback
/alphadog_node/start_record_action/goal
/alphadog_node/start_record_action/result
/alphadog_node/start_record_action/status
/alphadog_node/statistics
/alphadog_node/track_trajectory
/alphadog_node/update_height_map
/alphadog_node/version
/alphadog_node/wifi
/alphago_slam/slam_pose
/client_count
/connected_clients
/rosout
/rosout_agg
/test_hw_unit/test/cancel
/test_hw_unit/test/feedback
/test_hw_unit/test/goal
/test_hw_unit/test/result
/test_hw_unit/test/status
/test_hw_unit/version
/x_rosbridge/incoming
nav@nav:~$
```



## 智能体技能相关

（`/agent_skill/`）

- `/agent_skill/do_action/control/cancel`：取消`do_action`技能的控制指令
- `/agent_skill/do_action/control/feedback`：`do_action`技能控制过程中的反馈
- `/agent_skill/do_action/control/goal`：发送`do_action`技能的控制目标
- `/agent_skill/do_action/control/result`：`do_action`技能控制的结果（成功 / 失败）
- `/agent_skill/do_action/control/status`：`do_action`技能的控制状态（如等待中 / 执行中）
- `/agent_skill/do_action/control_status`：`do_action`技能的整体控制状态
- `/agent_skill/do_action/execute/cancel`：取消`do_action`技能的执行
- `/agent_skill/do_action/execute/feedback`：`do_action`技能执行过程中的反馈
- `/agent_skill/do_action/execute/goal`：发送`do_action`技能的执行目标
- `/agent_skill/do_action/execute/result`：`do_action`技能执行的结果
- `/agent_skill/do_action/execute/status`：`do_action`技能的执行状态
- `/agent_skill/do_action/execute_status`：`do_action`技能的整体执行状态
- `/agent_skill/do_action/ext_actions`：`do_action`技能支持的扩展动作列表
- `/agent_skill/do_action/version`：`do_action`技能的版本信息
- `/agent_skill/do_dog_behavior/control/*`：机器狗行为技能的控制相关（结构同`do_action`）
- `/agent_skill/do_dog_behavior/execute/*`：机器狗行为技能的执行相关（结构同`do_action`）
- `/agent_skill/do_dog_behavior/control_status`：机器狗行为技能的控制状态
- `/agent_skill/do_dog_behavior/execute_status`：机器狗行为技能的执行状态
- `/agent_skill/do_dog_behavior/dog_behaviors`：可用的机器狗行为列表（如行走、跳跃）
- `/agent_skill/do_dog_behavior/version`：机器狗行为技能的版本信息
- `/agent_skill/set_fan/control/*`：风扇控制技能的控制相关
- `/agent_skill/set_fan/execute/*`：风扇控制技能的执行相关
- `/agent_skill/set_fan/control_status`：风扇控制的整体控制状态
- `/agent_skill/set_fan/execute_status`：风扇控制的整体执行状态
- `/agent_skill/set_fan/parameter/duty_cycle`：风扇占空比（转速）参数
- `/agent_skill/set_fan/parameter/enable`：风扇开关状态
- `/agent_skill/set_fan/version`：风扇控制技能的版本信息
- `/agent_skill/set_motion_params/*`：运动参数设置技能相关（控制、执行、状态等，用于配置机器狗运动参数）
- `/agent_skill/smart_action/*`：智能动作技能相关（高阶智能动作如自主避障的控制、执行等）

## OTA 升级相关

（`/alpha_ota/`）

- `/alpha_ota/app_hbevt`：应用程序心跳事件
- `/alpha_ota/checkver`：检查版本更新
- `/alpha_ota/current_version`：当前系统版本
- `/alpha_ota/do_ntpdate`：执行 NTP 时间同步
- `/alpha_ota/download_package`：下载升级包
- `/alpha_ota/download_progress`：下载进度
- `/alpha_ota/heart_beat`：系统心跳
- `/alpha_ota/internet_access`：网络访问状态
- `/alpha_ota/internet_access_info`：网络访问详细信息
- `/alpha_ota/internet_access_self_info`：本地网络信息
- `/alpha_ota/internet_state`：网络连接状态
- `/alpha_ota/module_version`：各模块版本信息
- `/alpha_ota/network_exception`：网络异常通知
- `/alpha_ota/ntpdate_fail`：NTP 同步失败通知
- `/alpha_ota/reset_wifiap_psk`：重置 Wi-Fi 热点密码
- `/alpha_ota/restore_default`：恢复出厂设置
- `/alpha_ota/set_download_options`：设置下载选项
- `/alpha_ota/stop_download`：停止下载
- `/alpha_ota/system_update_status`：系统升级状态
- `/alpha_ota/update`：触发系统升级
- `/alpha_ota/update_result`：升级结果
- `/alpha_ota/version_info_list`：版本信息列表
- `/alpha_ota/wifi_scan`：触发 Wi-Fi 扫描
- `/alpha_ota/wifi_scan_list`：Wi-Fi 扫描结果列表
- `/alpha_ota/wifiap_info`：Wi-Fi 热点信息

## 机器狗辅助功能

（`/alphadog_aux/`）

- `/alphadog_aux/alphadog_sys_config/parameter_descriptions`：系统配置参数描述
- `/alphadog_aux/alphadog_sys_config/parameter_updates`：系统配置参数更新
- `/alphadog_aux/battery_state`：电池状态（辅助模块）
- `/alphadog_aux/ble_gatt_server/event`：BLE GATT 服务器事件
- `/alphadog_aux/ble_gatt_server/joy`：BLE 手柄控制指令
- `/alphadog_aux/teleop_robot/control/*`：远程控制相关（取消、反馈、目标等）
- `/alphadog_aux/teleop_robot/control_status`：远程控制状态
- `/alphadog_aux/teleop_robot/up_down_mode`：上下模式切换
- `/alphadog_aux/teleop_robot/version`：远程控制模块版本

## 机器狗核心功能

（`/alphadog_node/`）

- `/alphadog_node/available_actions`：可用的动作列表
- `/alphadog_node/battery_state`：电池状态（核心模块）
- `/alphadog_node/body_status`：身体状态（如姿态、受力）
- `/alphadog_node/boot_up_state`：启动状态
- `/alphadog_node/delete_record_action/*`：删除记录动作的控制相关
- `/alphadog_node/desired_joint_states`：期望的关节状态
- `/alphadog_node/do_action/*`：执行动作的控制相关
- `/alphadog_node/dog_ctrl_config`：机器狗控制配置
- `/alphadog_node/dog_ctrl_state`：机器狗控制状态
- `/alphadog_node/event`：系统事件
- `/alphadog_node/event_data/*`：事件数据（电池、控制配置等）
- `/alphadog_node/ext_force_status`：外部受力状态
- `/alphadog_node/finish_record_action/*`：结束记录动作的控制相关
- `/alphadog_node/ground_status`：地面状态（如平整度）
- `/alphadog_node/imu`：IMU（惯性测量单元）数据
- `/alphadog_node/joint_states`：关节状态（角度、速度等）
- `/alphadog_node/parameter_descriptions`：参数描述
- `/alphadog_node/parameter_updates`：参数更新
- `/alphadog_node/record_video`：录像控制
- `/alphadog_node/robot_ctrl_status`：机器人控制状态
- `/alphadog_node/robot_ready`：机器人就绪状态
- `/alphadog_node/robot_system_info`：机器人系统信息（CPU、内存等）
- `/alphadog_node/save_record_action/*`：保存记录动作的控制相关
- `/alphadog_node/sbus`：SBUS 遥控器信号
- `/alphadog_node/set_*`：各类设置指令（身体位置、碰撞保护、步态等）
- `/alphadog_node/spi_status`：SPI 通信状态
- `/alphadog_node/spine_info`：脊柱信息
- `/alphadog_node/start_record_action/*`：开始记录动作的控制相关
- `/alphadog_node/statistics`：系统统计信息
- `/alphadog_node/track_trajectory`：轨迹跟踪指令
- `/alphadog_node/update_height_map`：更新高度图
- `/alphadog_node/version`：核心模块版本
- `/alphadog_node/wifi`：Wi-Fi 状态

## 其他话题

- `/client_count`：客户端连接数量
- `/connected_clients`：已连接的客户端信息
- `/rosout`：ROS 日志输出
- `/rosout_agg`：聚合的 ROS 日志
- `/test_hw_unit/test/*`：硬件单元测试相关（控制、反馈等）
- `/test_hw_unit/version`：硬件测试模块版本
- `/x_rosbridge/incoming`：rosbridge 的输入数据
- `/alphago_slam/slam_pose`：SLAM（同步定位与地图构建）的位姿信息







----





































