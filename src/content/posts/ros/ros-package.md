---
title: ROS 公共功能包
published: 2026-07-06
updated: 2026-07-06
description: ROS1/2 公共功能包配置
image: /assets/bolg_cover/ros-package.webp
tags: [ROS1/2, 功能包, 快速体验]
category: ros
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言
>本文用于汇总记录 ROS1/2 常用功能包，方便其他文章直接引用，避免内容重复赘述。



# 1. ROS1

## a. Cartographer

> Cartographer 为谷歌开源 ROS 实时 SLAM 库，支持 2D、3D 激光雷达同步建图定位，通过图优化闭环消除轨迹漂移，是移动机器人导航主流方案。
>
> Cartographer 2D 与 Cartographer 3D 建图导航功能均基于同一套 Cartographer 核心库，开发使用前必须完成 Cartographer 功能包整体安装；二者仅适配传感器、位姿求解维度与适用场景不同。

1. Cartographer 2D：搭配单线 2D 激光雷达，仅计算平面三轴位姿，生成二维栅格地图，多用于室内扫地机器人、仓储 AGV 平面导航；
2. Cartographer 3D：搭配多线 3D 激光雷达，结合 IMU 解算六自由度空间位姿，输出三维环境地图，适配室外小车、无人机、多楼层复杂场景建图。

### i. 安装

```bash
#1. 使用鱼香 ROS 一键安装（大概时间为 5分钟）
wget http://fishros.com/install -O fishros && . fishros

#2. 依次选择：
[ 9 ]一键安装:Cartographer(18 20测试通过,16未测. updateTime 20240125)

#3. 添加工作空间环境到 .bashrc 文件
echo "source ~/cartographer_ws/devel_isolated/setup.bash" >> ~/.bashrc
```

> [!TIP]
>
> `可能会出现的问题，因为版本不同，若未出现请跳过`
>
> 安装到最后可能会提示以下错误
>
> ![1774863619895-5de3470c-8291-407f-a172-79a2b64bd46b](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-package/20260706101212897.webp)
>
> **解决办法：**
>
> ```bash
> # 到主目录下创建的cartographer_ws目录下，输入
> catkin_make_isolated --install --use-ninja
> 
> # 等待编译成功，最后出现
> <== Finished processing package [4 of 4]: 'cartographer_rviz'
> ```
>
> ![1774863620006-bf29faff-5701-4a8d-a55e-c74325a9ea0a](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-package/20260706101355371.webp)

### ii. 验证运行

- **官网数据包（已失效）**
  - [Public Data — Cartographer ROS documentation](https://google-cartographer-ros.readthedocs.io/en/latest/data.html)
- 2D数据包
  - 在硬盘 中的 YSD -> ROS -> cartographer 数据包 -> 2D 中
- 3D数据包
  - 在硬盘 中的 YSD -> ROS -> cartographer 数据包 -> 3D 中

#### 1. 2D数据包

```bash
# 复制到系统主目录，然后运行测试命令
roslaunch cartographer_ros demo_backpack_2d.launch bag_filename:=${HOME}/Downloads/cartographer_paper_deutsches_museum.bag

# 自己数据包的实际路径
bag_filename:=${HOME}/Downloads/cartographer_paper_deutsches_museum.bag
```

运行示例

![1774863620090-0fc730b4-b510-4c13-8a5d-3e70f6113204](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-package/20260706101837354.webp)

#### 2. 3D数据包

```bash
# 复制到系统主目录，然后运行测试命令
roslaunch cartographer_ros demo_backpack_3d.launch bag_filename:=${HOME}/Downloads/cartographer_paper_deutsches_museum.bag

# 自己数据包的实际路径
bag_filename:=${HOME}/Downloads/cartographer_paper_deutsches_museum.bag
```

运行示例

![1774863620179-3426d416-cc52-4b9d-9933-ab63c3c147a1](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-package/20260706102018418.webp)

### iii. 记录

```bash
# 这些依赖包没用上，若有提示出错的时候，找方法安装的，记录一下
sudo apt-get install \
    clang \
    cmake \
    g++ \
    git \
    google-mock \
    libboost-all-dev \
    libcairo2-dev \
    libcurl4-openssl-dev \
    libeigen3-dev \
    libgflags-dev \
    libgoogle-glog-dev \
    liblua5.2-dev \
    libsuitesparse-dev \
    lsb-release \
    ninja-build \
    stow \
    python3-wstool \
    python3-rosdep \
    python3-sphinx \
    libatlas-base-dev
```

## b. pointcloud_to_laserscan

>pointcloud_to_laserscan 是 ROS 官方提供的转换工具包，核心作用是将三维点云话题（PointCloud2）截取单层高度数据，转换为二维激光扫描话题 /scan。
>
>常用于 3D 多线激光雷达、深度相机场景：3D 传感器输出点云无法直接给 Cartographer 2D、rf2o_laser_odometry 等 2D SLAM 算法使用，通过该包截取指定高度层点云，输出标准 LaserScan 格式数据，适配所有依赖 /scan 的建图、里程计功能包。
>
>可通过 launch 参数配置扫描上下高度范围、输出帧 ID、角度范围、测距阈值等，过滤地面、天花板干扰点云；搭配 3D 雷达时是 2D 平面建图的必备前置转换工具。

- 官网地址：[GitHub - BluewhaleRobot/pointcloud_to_laserscan](https://github.com/BluewhaleRobot/pointcloud_to_laserscan)

### i. 安装

#### 1. Git 源码克隆编译

```bash
# 进入ROS工作空间src/目录下
cd ~/navdgu_ws/src/

# 克隆 pointcloud_to_laserscan 代码到src/目录下
git clone https://github.com/BluewhaleRobot/pointcloud_to_laserscan.git

# 编译工作空间（跳过CATKIN_IGNORE标记的包）
cd ~/navdgu_ws && catkin build

# 刷新当前终端的ROS环境变量，使编译后的包生效
source devel/setup.bash
```

#### 2. 本地源码压缩包手动部署编译

1. 提前从官方仓库下载 pointcloud_to_laserscan 源码压缩包并解压；

2. 将解压后的完整功能包文件夹放入工作空间 src/ 目录；

3. 执行编译与环境刷新命令：

   ```bash
   # 切换至工作空间根目录编译
   cd ~/navdgu_ws && catkin build
   
   # 生效环境变量
   source devel/setup.bash
   ```

### ii. 修改

我这里使用的速腾 3D 雷达，他的 3D 点云话题名为 `/rslidar_points`,所以在功能包可以添加一个验证文件 

```xml title="rslidar2scan.launch"
<?xml version="1.0"?>
<launch>
 
    <!-- run pointcloud_to_laserscan node -->
    <node pkg="pointcloud_to_laserscan" type="pointcloud_to_laserscan_node" name="pointcloud_to_laserscan">
 
        <!-- 输入重定义的点云话题信息 -->
        <remap from="cloud_in" to="/rslidar_points"/>  
        
        <rosparam>
            # target_frame: rslidar # Leave disabled to output scan in pointcloud frame
            transform_tolerance: 0.01
            min_height: -0.4
            max_height: 1.0
 
            angle_min: -3.1415926 # -M_PI
            angle_max: 3.1415926 # M_PI
            angle_increment: 0.003 # 0.17degree
            scan_time: 0.1
            range_min: 0.2
            range_max: 100
            use_inf: true
            inf_epsilon: 1.0
 
            # Concurrency level, affects number of pointclouds queued for processing and number of threads used
            # 0 : Detect number of cores
            # 1 : Single threaded
            # 2->inf : Parallelism level
            concurrency_level: 1
        </rosparam>

    </node>

</launch>

```

### iii. 验证运行 

```bash
# 打开终端，在工作空间下，依次输入以下命令
roslaunch rslidar_sdk start.launch # 3D激光雷达启动节点
roslaunch pointcloud_to_laserscan rslidar2scan.launch
rostopic list
```

可以看到 `rostopic list` 打印的有转换之前 `rslidar_point ` 点云订阅信息,与转换之后的 `Scan` 雷达订阅信息。

![1774863621244-34642f48-737d-467c-bf74-061e79059a40](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-package/20260706114059453.webp)

## c. rf2o_laser_odometry

>rf2o_laser_odometry 是一款基于二维激光扫描数据的纯激光里程计 ROS1 功能包，无需轮式里程计、IMU 辅助，仅依靠 /scan 雷达点云实时解算机器人相对运动位姿，输出激光里程计信息，可弥补底盘里程计长距离累积漂移，常配合 Cartographer、gmapping 等 SLAM 算法使用。

- 参考文章：[基于rf2o_laser_odometry纯激光里程计的gmapping建图](https://zhuanlan.zhihu.com/p/500211757)
- 修改完毕代码包：[ROS1-rf2o_laser_odometry.zip(137 KB)](https://1831996731.cdn.123clouddisk.com/1831996731/a_PicBed/project/unitree/20260703003840437.zip)

### i. 安装

```bash
# 进入ROS工作空间src/目录下
cd ~/navdgu_ws/src/

# 克隆ROS1分支rf2o激光里程计源码
git clone -b ros1 https://github.com/MAPIRlab/rf2o_laser_odometry.git 

# 编译工作空间（跳过CATKIN_IGNORE标记的包）
cd ~/navdgu_ws && catkin build

# 刷新当前终端的ROS环境变量，使编译后的包生效
source devel/setup.bash
```

### ii.  Bug 修复

原生 rf2o_laser_odometry 源码直接搭配 RPLIDAR 雷达运行会出现报错，需手动修改两处源码，修复两类问题。

- **问题 1：TF 坐标变换查找失败报错**

  ```bash
  # 报错信息：
  ERROR: "base_link" passed to lookupTransform argument source_frame does not exist.
  ERROR:Invalid argument passed to lookupTrasform argument source_frame in tf2 frame_ids cannot be empty
  ```

  修复方案：

  文件路径：rf2o_laser_odometry/src/CLaserOdometry2DNode.cpp

  在第 126 行上方添加 TF 等待变换语句，延长坐标帧等待超时时间：

  ```c++
  tf_listener.waitForTransform(base_frame_id,"laser_link",ros::Time(),ros::Duration(5.0));
  ```

  原理：订阅 TF 数据存在延迟，增加等待时长避免查询帧时报错。

- **问题 2：激光数据非法导致里程计无法更新位姿**

  - 报错信息：

    ```bash
    [rf2o] ERROR: Eigensolver couldn't find a solution. Pose is not updated
    ```

  - 故障原因：RPLIDAR-A1 输出测距数据包含 Inf/NaN 非法数值；EAI-X4 雷达无该问题，为兼容各类雷达统一修复。

  - 修复方案：

    - 文件路径：rf2o_laser_odometry/src/CLaserOdometry2D.cpp

      修改第 292、316 行两处判断条件，过滤无效测距值：

      ```c++
      if (std::isfinite(dcenter) && dcenter > 0.f)
      ```

- 完成上述两处修改后可解决主要报错，运行时仍存在少量次要告警，对应修复代码已整合至工程源码内，可直接查阅工程文件。

### iii. 运行测试

```bash
#1. 提前启动激光雷达驱动；
#2. 执行 rf2o 激光里程计启动文件：
roslaunch rf2o_laser_odometry rf2o_laser_odometry.launch
```

## d. robot_localization

>ROS 官方多传感器融合定位包，基于 EKF/UKF 滤波算法，融合轮速里程计、IMU、SLAM 位姿、GPS 等数据，消除里程计累积漂移，输出平滑滤波里程。提供 ekf、ukf 定位节点与 GPS 坐标转换节点，可配合 Cartographer 给导航栈提供稳定定位数据，参数通过 yaml 灵活配置。

### i. 安装

#### 1. 系统安装

```bash
# 针对 ROS1 版本
sudo apt-get update
sudo apt-get install ros-$ROS_DISTRO-robot-localization

# 验证安装成功
rospack find robot_localization  # 输出路径则安装成功

sudo apt remove ros-$ROS_DISTRO-robot-localization
```

#### 2. 导包安装(noetic版本)

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

### ii. 示例

```xml title="ekf.xml"
<launch>
    <arg name="use_ekf" default="true" doc="是否启用IMU融合生成/odom" />
    <!-- 启动robot_localization -->
    <group if="$(arg use_ekf)">
        <node name="ekf_localization" 
              pkg="robot_localization" 
              type="ekf_localization_node" 
              output="screen"
              respawn="true">
            <rosparam command="load" file="$(find doge_bringup)/config/ekf.yaml"/>
        </node>
    </group>
</launch>
```

```yaml title="ekf.yaml"
ekf_localization_node:
  frequency: 50
  two_d_mode: true
  publish_tf: true
  publish_odometry: true
  odom_frame: odom
  base_link_frame: base_link
  world_frame: odom

  imu0: /imu
  imu0_type: imu
  imu0_config: [0,0,0, 1,1,1, 0,0,0, 1,1,1]
  imu0_remove_gravitational_acceleration: 1
```

## e. rplidar_ros

>rplidar_ros 为思岚 RPLIDAR 单线激光雷达官方 ROS1 驱动包，支持 A/S/T 全系列型号；节点输出标准/scan雷达话题，为 Cartographer 2D、gmapping 等 2D SLAM 算法提供环境测距数据源，机器人 2D 建图导航场景必备前置驱动包。

- GitHub：[GitHub - Slamtec/rplidar_ros](https://github.com/slamtec/rplidar_ros)
- 官网：[思岚科技（SLAMTEC）资源下载中心及技术支持联系方式](https://www.slamtec.com/cn/Support#rplidar-a-series)
- Wiki：[Home · robopeak/rplidar_ros Wiki · GitHub](https://github.com/robopeak/rplidar_ros/wiki)

### i. 安装

#### 1. Git 源码克隆编译

```bash
# 进入ROS工作空间src/目录下
cd ~/navdgu_ws/src/

# 克隆 rplidar_ros 代码到src/目录下
git clone https://github.com/Slamtec/rplidar_ros.git 

# 编译工作空间（跳过CATKIN_IGNORE标记的包）
cd ~/navdgu_ws && catkin build

# 刷新当前终端的ROS环境变量，使编译后的包生效
source devel/setup.bash
```

#### 2. 本地源码压缩包手动部署编译

1. 提前从官方仓库下载 rplidar_ros 源码压缩包并解压；
2. 将解压后的完整功能包文件夹放入工作空间 src/ 目录；
3. 执行编译与环境刷新命令：

   ```bash
   # 切换至工作空间根目录编译
   cd ~/navdgu_ws && catkin build
   
   # 生效环境变量
   source devel/setup.bash
   ```

### ii. 设置 LiDAR 端口

- **查看设备号**

    ```bash
    jetson@nano:~/Desktop$ lsusb 
    Bus 002 Device 002: ID 0bda:0411 Realtek Semiconductor Corp. 4-Port USB 3.1 Hub
    Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
    Bus 001 Device 003: ID 8087:0a2b Intel Corp. 
    Bus 001 Device 005: ID 10c4:ea60 Silicon Labs CP210x UART Bridge
    Bus 001 Device 002: ID 0bda:5411 Realtek Semiconductor Corp. 4-Port USB 2.1 Hub
    Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
    ```
- **查看是否端口识别**
    ```bash
    jetson@nano:~/Desktop$ ls -l /dev/ttyUSB*
    crw-rw---- 1 root dialout 188, 0 dec 25 07:16 /dev/ttyUSB0
    ```
- **创建或修改 udev 规则文件**
    ```bash
    sudo nano /etc/udev/rules.d/rplidar.rules 
    # 或（适合有图形界面的系统）
    sudo gedit /etc/udev/rules.d/rplidar.rules 
    ```
- **添加以下内容**
    ```bash
    # 为 RPLIDAR (Silicon Labs CP210x 芯片，ID 10c4:ea60) 创建固定设备名
    SUBSYSTEM=="tty", ATTRS{idVendor}=="10c4", ATTRS{idProduct}=="ea60", MODE="0666", SYMLINK+="rplidar"
    ```

    - `SUBSYSTEM=="tty"`：限定为串口设备。
    - `ATTRS{idVendor}=="10c4"` 和 `ATTRS{idProduct}=="ea60"`：匹配你的设备 ID。
    - `MODE="0666"`：赋予设备读写权限（避免权限问题）。
    - `SYMLINK+="rplidar"`：创建软链接 `/dev/rplidar` 指向实际设备（如 `/dev/ttyUSB0`）。
- **生效 udev 规则**
    ```bash
    sudo udevadm control --reload-rules
    sudo udevadm trigger
    ```

    如果设备已连接，拔插一次 USB 线，让规则生效。
- **验证映射结果**

    ```bash
    jetson@nano:~/Desktop$ ls -l /dev/rplidar
    lrwxrwxrwx 1 root root 7 dec 25 07:34 /dev/rplidar -> ttyUSB0
    ```

### iii. 验证运行

- **运行rplidar节点并在rviz中查看**

  ```bash
  roslaunch rplidar_ros view_rplidar_a1.launch
  ```

  应该能在rviz上看到rplidar的扫描结果。

  ![1774864322566-9a7a0a70-62e7-4b2a-940b-bd304535fd52](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-package/20260706104157595.webp)

- **运行rplidar节点并使用测试应用查看**

  ```bash
  roslaunch rplidar_ros rplidar_a1.launch
  rosrun rplidar_ros rplidarNodeClient
  ```

  应该能在控制台看到rplidar的扫描结果。

  ![1774864318838-a8ee9e6b-8f56-4a62-bb80-aaa9d0a2ed7f](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-package/20260706104640131.webp)

### iv. 雷达安装方向

![1774864318929-0b6b2034-c5ae-45d7-9296-056e97f98bd8](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-package/20260706104803835.webp)

## f. wit_ros_imu

>维特智能 IMU 的 ROS 驱动包，读取六轴 / 九轴惯性传感器原始数据，对外发布加速度、角速度、欧拉角及磁力计话题。常与 robot_localization 搭配融合里程计、SLAM 位姿，弥补底盘里程计漂移，为 Cartographer 建图与导航提供姿态数据。

- 维特官网：https://wit-motion.cn/#/witmotion/search
- 驱动GitHub：https://github.com/finn-wang/wit_ros_imu?tab=read
- 产品资料地址：https://wit-motion.yuque.com/wumwnr/docs/mkdwe1?singleDoc#
- ROS Python使用说明：https://wit-motion.yuque.com/wumwnr/ltst03/yqg5aeedmy9bu5er

  - 模块的校准、设置回传速率、设置波特率、记录与解析数据可以在这个中查到

- 产品图片

  ![1774864319054-8513611d-fa7c-45a5-b743-38c984fe25a6](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-package/20260706105845938.webp)

### i. 安装

```bash
# 需要用到的功能包
sudo apt-get install ros-$ROS_DISTRO-imu-tools ros-$ROS_DISTRO-rviz-imu-plugin
pip3 install pyserial
pip3 install rospkg
```

#### 1. Git 源码克隆编译

```bash
# 进入ROS工作空间src/目录下
cd ~/navdgu_ws/src/

# 克隆 wit_ros_imu 代码到src/目录下
git clone https://github.com/finn-wang/wit_ros_imu.git 

# 编译工作空间（跳过CATKIN_IGNORE标记的包）
cd ~/navdgu_ws && catkin build

# 刷新当前终端的ROS环境变量，使编译后的包生效
source devel/setup.bash
```

#### 2. 本地源码压缩包手动部署编译

1. 提前从官方仓库下载 wit_ros_imu 源码压缩包并解压；

2. 将解压后的完整功能包文件夹放入工作空间 src/ 目录；

3. 执行编译与环境刷新命令：

   ```bash
   # 切换至工作空间根目录编译
   cd ~/navdgu_ws && catkin build
   
   # 生效环境变量
   source devel/setup.bash
   ```

### ii. 设置 IMU 端口

- **创建 udev 规则文件**

  ```bash
  # 终端编辑器
  sudo nano /etc/udev/rules.d/imu.rules
  
  # 或使用图形界面编辑器
  sudo gedit /etc/udev/rules.d/imu.rules
  ```

- **添加规则内容**

  ```bash
  # 为 WT61C IMU 创建固定设备名
  # 设备信息：QinHeng Electronics HL-340 USB-Serial 适配器，ID 1a86:7523
  SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", MODE:="0666", SYMLINK+="wt61c"
  ```

  - `SUBSYSTEM=="tty"`：限定为串口设备。

  - `ATTRS{idVendor}=="1a86"` 和 `ATTRS{idProduct}=="7523"`：匹配 WT61C IMU 设备的实际 ID（原文档错误写为 10c4/ea60，与规则里的 1a86:7523 冲突）。

  - `MODE="0666"`：赋予所有用户读写权限，解决串口访问权限不足的问题。

  - `SYMLINK+="wt61c"`：创建固定软链接 `/dev/wt61c` 指向实际设备（如 `/dev/ttyUSB0`），与规则里的命名保持一致。


- **生效 udev 规则**

  ```bash
  sudo udevadm control --reload-rules
  sudo udevadm trigger
  ```

  **提示**：如果设备已连接，建议拔插一次 USB 线以确保规则生效。

- **验证映射结果**

  ```bash
  ls -l /dev/wt61c
  lrwxrwxrwx 1 root root 7 Dec 25 07:34 /dev/wt61c -> ttyUSB0
  ```

### iii. 验证运行

```bash
# 在对应功能包的launch文件夹中添加文件，并对应文件添加内容
touch ~/navdg_ws/src/doge_tools/wit_ros_imu/launch/wt61c_rviz.launch
touch ~/navdg_ws/src/doge_tools/wit_ros_imu/launch/wt61c.launch
```

```xml title="wt61c_rviz.launch"
<!-- open imu and rviz -->
<launch>

    <!-- imu type, default normal -->
    <arg name="type" default="normal" doc="type [normal, modbus]"/>

    <!-- imu python -->
    <node pkg="wit_ros_imu" type="wit_$(arg type)_ros.py" name="imu" output="screen">
        <param name="port"               type = "str"    value="/dev/wt61c"/>
        <param name="baud"               type = "int"    value="115200"/>
        <remap from="/wit/imu" to="/imu"/>
    </node>


    <!-- load rviz -->
    <node name="rviz" pkg="rviz" type="rviz" args="-d $(find wit_ros_imu)/rviz/wit_ros_imu.rviz">
    </node>

</launch>   
```

```xml title="wt61c.launch"
<!-- open imu and rviz -->
<launch>

    <!-- imu type, default normal -->
    <arg name="type" default="normal" doc="type [normal, modbus]"/>

    <!-- imu python -->
    <node pkg="wit_ros_imu" type="wit_$(arg type)_ros.py" name="imu" output="screen">
        <param name="port"               type = "str"    value="/dev/wt61c"/>
        <param name="baud"               type = "int"    value="115200"/>
        <remap from="/wit/imu" to="/imu"/>
    </node>


</launch>   
```

- **运行imu节点并在rviz中查看**

  ```bash
  roslaunch wit_ros_imu wt61c_rviz.launch
  ```

  ![1774864322680-4329020d-1aea-4e0d-ad55-bebad15171ca](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-package/20260706110826904.webp)

- **运行imu节点并查看数据**

  ```bash
  roslaunch wit_ros_imu wt61c.launch 
  
  rostopic echo /wit/imu  或者   rostopic echo /imu
  rostopic echo /wit/mag
  ```

  ![1774864322773-304c36d1-ed49-47d5-82da-2693abf35139](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-package/20260706110837211.webp)

### iv. 修改

文件一些小修改，若需要对应的功能可以修改

#### 1. **修改发布的 `frame_id`**

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



---

# 2. ROS2



















-----



































































