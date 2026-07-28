---
title: 大黄蜂4WD底盘（二）
published: 2024-03-19
updated: 2026-07-27
description: 大黄蜂4WD底盘的ROS自动导航构建
image: /assets/bolg_cover/hornet-base-02.webp
tags: [ROS, Jetson, 自动导航]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

原先是一个文档，现在分开为两个：**[大黄蜂4WD底盘（一）](/posts/project/hornet-base-01/)**

后续可能在更新一个新的文档, 重新定义这个功能包和写一个对应的上位机软件

> 这个文档是在已经导航实现差不多的情况下，想优化一下导航的实现方法，换一种能够3D建图，重定位方法，结果导致系统崩盘的重新装系统的惨痛教训！！ 以后新的项目写文档！！ 别轻易编译系统构建工具，别升级cmake ！！ 啊啊啊啊！！或者说我还是太菜了？—— ？

`无从下手！`



![212](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260727160230109.gif)

# 1. ROS 

## a. ROS安装

### i. 安装

使用 [鱼香 ROS](https://fishros.org.cn/forum/topic/20/%E5%B0%8F%E9%B1%BC%E7%9A%84%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85%E7%B3%BB%E5%88%97) 安装（非常好用！！）

![image-20260728122011167](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728122012046.webp)

这个很久之前的了，23年了估计，现在换了

![截图 2026-07-28 12-21-35](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728122238765.webp)

```bash
source <(wget -qO- http://fishros.com/install)
```

![image-20260728122324723](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728122325088.webp)

**依次选择（最新的有所出入，但大致一样）：**

- `[ 1 ]`： 一键安装(推荐):ROS(支持ROS/ROS2,树莓派Jetson) 
- `[ 1 ]`：更换系统源再继续安装				
- `[ 2 ]`：更换系统源并清理第三方源
- `[ 5 ]`：melodic(ROS1)
- `[ 1 ]`：melodic(ROS1)桌面版

### ii. 验证

```bash
roscore
rosrun turtlesim turtlesim_node
rosrun turtlesim turtle_teleop_key
```

![image-20260728122720409](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728122720680.webp)

## b. Cartographer 

参考 [Cartographer 安装](/posts/ros/ros-package/#a-cartographer)

## c. autolabor_pro1_driver

### i. 下载

下载**autolabor_pro1_driver** 底盘驱动包，**下载地址：**[http://www.autolabor.com.cn/download](http://www.autolabor.com.cn/download)，**选择 Autolabor Pro1 ROS驱动包**，放到工作空间下编译，编译通过。

### ii. 运行

`roslaunch autolabor_pro1_driver driver.launch`  驱动节点发布

`rosrun teleop_twist_keyboard teleop_twist_keyboard.py`   键盘控制节点发布

接下来应该可以控制运动。如有问题，先进行本文档中的`系统设置 - ④ ⑦`

### iii. 问题

- **P1：/dev/autoe 不存在**

  在进行实际通信控制室，提示

  ```bash
  process[autolabor_driver-2]: started with pid [31366]
  [ INFO] [1722399078.621346528]: error : port_->open() failed...port_name=/dev/autoe, e=No such file or directory
  terminate called after throwing an instance of 'boost::exception_detail::clone_impl<boost::exception_detail::error_info_injector<boost::system::system_error> >'
    what():  cancel: Bad file descriptor
  [autolabor_driver-2] process has died [pid 31366, exit code -6, cmd /home/esteam/autolabor_ws/devel/lib/autolabor_pro1_driver/autolabor_pro1_driver __name:=autolabor_driver __log:=/home/esteam/.ros/log/edd2565c-4ef2-11ef-9065-0242c9352d79/autolabor_driver-2.log].
  log file: /home/esteam/.ros/log/edd2565c-4ef2-11ef-9065-0242c9352d79/autolabor_driver-2*.log
  ^C[rosout-1] killing on exit
  [master] killing on exit
  shutting down processing monitor...
  ... shutting down processing monitor complete
  done
  ```

- **原因：/dev/autoe设备文件不存在**

- **解决方法：**

  打开终端，执行以下命令

  ```bash
  cat <<EOL > ./98-sensors.rules
  
  # 后面用到的 IMU 设备
  KERNEL=="ttyUSB*", ATTRS{idVendor}=="10c4", ATTRS{idProduct}=="ea60", MODE:="0666", SYMLINK+="ah100b"
  # 底盘设备
  KERNEL=="ttyCH341USB*", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", MODE:="0666", SYMLINK+="autoe"
  EOL
  
  sudo mv ./98-sensors.rules /etc/udev/rules.d/
  ```

  ![image-20260728144744241](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728144744425.webp)

- **验证**

  ```bash
  # 1.重新加载 udev 规则
  sudo udevadm control --reload-rules
  
  # 2.触发udev事件
  sudo udevadm trigger
  
  # 3.验证规则：拔下USB重新连接，检查是否已经创建了符号链接
  ls -l /dev/autoe
  
  # 应该看到 /dev/autoe 指向正确的 ttyCH341USB 设备。
  ```

  ![image-20260728144940338](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728144940503.webp)

## d. rslidar_sdk

  这个是3D雷达的驱动包，3D雷达型号是 `·RSHELIOS_16P·` 或者 `·RS-Hellos-16P·`,一样意思

[参考网址 1](https://blog.csdn.net/weixin_44444810/article/details/121659270)	|	[参考网址 2](https://blog.csdn.net/weixin_44444810/article/details/121512088?spm=1001.2014.3001.5502)	|	[参考网址 3](https://blog.csdn.net/m0_61463856/article/details/129960984?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_utm_term~default-0-129960984-blog-121512088.235^v43^pc_blog_bottom_relevance_base2&spm=1001.2101.3001.4242.1&utm_relevant_index=3)

### i. 设置网口

**进入 System Settings (设置)界面，选择 Network (网络)**

![image-20260728145112417](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728145112675.webp)

进入Network (网络)后，选择`Wired(有线)`，注意查看2的位置，是否是 100Mb/s

点击**Options选项**，**Connection name** 更改为`3D-RS-Hellos-16P`，**Method**选择`Manual`.  

![image-20260728145231655](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728145231875.webp)  

点击**Add**,依次添加 `192.168.1.102` -> `255.255.255.0` -> `192.168.1.1` 

**DNS servers**：`223.5.5.5` ,最后点击保存，可以看到已经显示对应 IP

![image-20260728145249342](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728145249567.webp)

使用`ifconfig` 与 `ping 192.168.1.102` ,命令测试查看

![image-20260728145305566](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728145305859.webp)

### ii. rslidar_sdk 配置

#### 1. 下载

[Github 官网地址](https://github.com/RoboSense-LiDAR/rslidar_sdk)   |   [Release-版本](https://github.com/RoboSense-LiDAR/rslidar_sdk/releases/tag/v1.5.16)

根据官网的介绍，点击**Release-版本**，下载 `rslidar_sdk.tar.gz `压缩包，**这个版本过后的，下面的配置不一样**

![image-20260728145429684](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728145429840.webp)

> [!CAUTION]
>
> **注意：不要下载Source code。 因为Source code压缩包内不包含子模块 rs_driver的代码， 还需自行下载rs_driver的代码放入其中才行。**

打开工作空间进入src文件夹下将压缩包解压到此处，先不要编译。

#### 2. 驱动环境

安装`pcap`、`Yaml`、`parmetis`：

```bash
sudo apt-get install -y libpcap-dev
sudo apt-get install -y libyaml-cpp-dev #若已安装ROS desktop-full, 可跳过
sudo apt-get install libparmetis-dev
```

#### 3. 修改 CMakeLists.txt 和 package.xml

1. 将文件顶部的<font style="background-color:#f3bb2f;">set(COMPILE_METHOD ORIGINAL)</font>改为`set(COMPILE_METHOD CATKIN)`（这一步骤可省略）

2. 将<font style="background-color:#f3bb2f;">set(POINT_TYPE XYZI)</font>改为`set(POINT_TYPE XYZIRT)`
3. 将rslidar_sdk工程目录下的<font style="background-color:#f3bb2f;">package_ros1.xml</font>文件粘贴复制，将复制的文件重命名为`package.xml`（这一步骤可省略）

#### 4. 修改 config.yaml 参数

`rslidar_sdk`只有一份参数文件 `config.yaml`， 储存于`rslidar_sdk/config`文件夹内。打开此文件，找到以下部分：

```bash
common:
  msg_source: 1                                         #0: not use Lidar
                                                        #1: packet message comes from online Lidar
                                                        #2: packet message comes from ROS or ROS2
                                                        #3: packet message comes from Pcap file
  send_packet_ros: false                                #true: Send packets through ROS or ROS2(Used to record packet)
  send_point_cloud_ros: true                            #true: Send point cloud through ROS or ROS2
lidar:
  - driver:
      lidar_type: RSM1             #LiDAR type - RS16, RS32, RSBP, RSHELIOS, RSHELIOS_16P, RS128, RS80, RS48, RSP128, RSP80, RSP48, 
                                   #             RSM1, RSM1_JUMBO, RSM2, RSM3, RSE1, RSMX.
      msop_port: 6699              #Msop port of lidar
      difop_port: 7788             #Difop port of lidar
      start_angle: 0               #Start angle of point cloud
      end_angle: 360               #End angle of point cloud 
      wait_for_difop: true
      min_distance: 0.2            #Minimum distance of point cloud
      max_distance: 200            #Maximum distance of point cloud
      use_lidar_clock: false       #True--Use the lidar clock as the message timestamp
```

激光雷达型号默认RSM1，修改为自己的激光雷达型号即可,不修改则会报错，并且读取不到激光扫描参数：

![image-20260728145655925](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728145656163.webp)

这里使用的是16线的激光雷达，将 `RSM1` 改为 `RSHELIOS_16P`修改如下，

```bash
common:
  msg_source: 1                                         #0: not use Lidar
                                                        #1: packet message comes from online Lidar
                                                        #2: packet message comes from ROS or ROS2
                                                        #3: packet message comes from Pcap file
  send_packet_ros: false                                #true: Send packets through ROS or ROS2(Used to record packet)
  send_point_cloud_ros: true                            #true: Send point cloud through ROS or ROS2
lidar:
  - driver:
      lidar_type: RSHELIOS_16P             #LiDAR type - RS16, RS32, RSBP, RSHELIOS, RSHELIOS_16P, RS128, RS80, RS48, RSP128, RSP80, RSP48, 
                                   #             RSM1, RSM1_JUMBO, RSM2, RSM3, RSE1, RSMX.
      msop_port: 6699              #Msop port of lidar
      difop_port: 7788             #Difop port of lidar
      start_angle: 0               #Start angle of point cloud
      end_angle: 360               #End angle of point cloud 
      wait_for_difop: true
      min_distance: 0.2            #Minimum distance of point cloud
      max_distance: 200            #Maximum distance of point cloud
      use_lidar_clock: false       #True--Use the lidar clock as the message timestamp
```

> [!IMPORTANT]
>
> 这里有个注意的地方：`config.yaml`文件有几个参数
>
> 这里的**ros_frame_id**与**ros_send_point_cloud_topic**需要注意对应的设置是什么，前者可作为后面的urdf文件的基础，后者是3D雷达发送的点云数据订阅信息。（以前疏忽了！！有阵子一直找这个雷达的frame_id是什么。）

```bash
ros:
      ros_frame_id: rslidar                           #Frame id of packet message and point cloud message
      ros_recv_packet_topic: /rslidar_packets          #Topic used to receive lidar packets from ROS
      ros_send_packet_topic: /rslidar_packets          #Topic used to send lidar packets through ROS
      ros_send_point_cloud_topic: /rslidar_points      #Topic used to send point cloud through ROS
```

**工作空间下编译**

```bash
catkin_make
source devel/setup.bash
```

### iii. 运行

`roslaunch rslidar_sdk start.launch`

![image-20260728145832523](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728145833168.webp)

这里启动命令，启动的文件默认是启动**rviz**的，为了以后只启动驱动，而不启动**rviz**,粘贴复制`start.launch`文件到同级目录下，并修改名称为`start_rviz.launch`,将`start.launch`中的

```bash
  <!-- rviz -->
  <node pkg="rviz" name="rviz" type="rviz" args="-d $(find rslidar_sdk)/rviz/rviz.rviz" />
```

删除即可。

## e. rs_to_velodyne

这个功能是作为将 速腾 3D激光雷达的信号转换为另一款 威力登 3D雷达信号的

 [维基百科介绍（英文)](https://en.wikipedia.org/wiki/Velodyne)

Velodyne Acoustics GmbH（俗称Velodyne）是一家生产低音炮及相关产品的公司，最初由David Hall在1983年成立于加利福尼亚州硅谷，随后于2019年被德国汉堡的Audio Reference公司及其所有者收购。曼苏尔·玛格哈尼（Mansour Mamaghani）。

### i. 下载

[Github 官网地址](https://github.com/HViktorTsoi/rs_to_velodyne.git)  

或者  `git clone https://github.com/HViktorTsoi/rs_to_velodyne.git`

然后放到**`src`**目录下进行编译 `catkin_make`

### ii. 修改

这里以后可能使用的 LeGO-LOAM 需要的雷达点云是`XYZIR`格式的，话题还是velodyne_points, 所以这里为了方便把启动节点的方式改为启动launch文件。

也就是把`rosrun rs_to_velodyne rs_tovelodyne XYZIRT XYZIR `命令，在rs_to_velodyne功能的launch文件夹写一个launch文件集成一下，例如建立launch文件夹，在其中创建rs_to_velodyne.launch 文件，在其中写入内容

```bash
<launch>
 <node pkg="rs_to_velodyne" name="rs_to_velodyne" type="rs_to_velodyne"  args="XYZIRT XYZIR"   output="screen">
 </node>
</launch>
```

![image-20260728150044978](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728150045275.webp)

### iii. 运行

打开终端，在工作空间下，依次输入以下命令

```bash
roslaunch rslidar_sdk start.launch
roslaunch rs_to_velodyne rs_to_velodyne.launch
rostopic list
```

![image-20260728150102985](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728150103620.webp) 

可以看到`rostopic list`打印的有转换之前rslidar_point 点云订阅信息,与转换之后的velodyne_point 点云订阅信息。

### iv. 问题

上图中运行`roslaunch rs_to_velodyne rs_to_velodyne.launch`会出现警告 **<font style="background-color:#f3bb2f;">Failed to find match for field 'intensuty'</font>**

`解决方法：`[使用rs_to_velodyne功能包时遇到Failed to find match for field ‘intensity‘解决方案](https://blog.csdn.net/2301_77494869/article/details/140229774)

修改这个文件rs_to_velodyne.cpp，地址如下：

![image-20260728150206113](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728150206276.webp)

修改内容如下,将红色框中的内容替换如下图所示：

![image-20260728150227031](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728150227241.webp)

其他不变即可,重新编译，再次运行，就没有这种警告了。

![image-20260728150240419](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728150240974.webp)

## f. pointcloud_to_laserscan

这是一个3D Point数据转换为2D Scan数据的功能包，主要用于3D转2D的建图、导航使用。

### i. 下载

[GitHub - BluewhaleRobot/pointcloud_to_laserscan: Converts a 3D Point Cloud into a 2D laser scan.](https://github.com/BluewhaleRobot/pointcloud_to_laserscan)

或者 `git clone https://github.com/BluewhaleRobot/pointcloud_to_laserscan.git`

然后发到**`src`**目录下进行编译。

### ii. 修改

在对应功能包的launch文件夹中添加文件 rslidar2scan.launch,并在其中添加内容

```bash
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

### iii. 运行

打开终端，在工作空间下，依次输入以下命令

```bash
roslaunch rslidar_sdk start.launch
roslaunch pointcloud_to_laserscan rslidar2scan.launch
rostopic list
```

可以看到`rostopic list`打印的有转换之前rslidar_point 点云订阅信息,与转换之后的 Scan 雷达订阅信息。

![image-20260728150435497](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728150436014.webp)

## g. wit_ros_imu

这个是10轴IMU的ROS驱动包，买的是亚博的一个产品，用于提供IMU数据的一个组件。

### i. 下载

在Github上找到的,不确定是不是，REANME文件说的是维特智能IMU的ROS驱动  [Github 官网地址](https://github.com/finn-wang/wit_ros_imu?tab=readme-ov-file) 

或者  `git clone https://github.com/finn-wang/wit_ros_imu.git`

然后放到**`src`**目录下进行编译

### ii. 修改

因为在 `c. autolabor_pro1_driver` -> `问题 `中，设置过了 IMU的**udev** 规则,所以IMU的识别设备名称就是 `/dev/ah100b`, 可以使用 `ls -l /dev/ah100b` 来查看是否有设备存在。

![image-20260728150647324](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728150647580.webp)

可以看到 /dev/ah100b 对应的是 ttyUSB0。我们相应的修改供我们使用，在对应功能包的launch文件夹中添加文件 **ah100b_rviz.launch**,并在其中添加内容

```bash
<!-- open imu and rviz -->
<launch>

    <!-- imu type, default normal -->
    <arg name="type" default="normal" doc="type [normal, modbus]"/>

    <!-- imu python -->
    <node pkg="wit_ros_imu" type="wit_$(arg type)_ros.py" name="imu" output="screen">
        <param name="port"               type = "str"    value="/dev/ah100b"/>
        <param name="baud"               type = "int"    value="115400"/>
    <remap from="/wit/imu" to="/imu"/>
    </node>

    <!-- load rviz -->
    <node name="rviz" pkg="rviz" type="rviz" args="-d $(find wit_ros_imu)/rviz/wit_ros_imu.rviz">
    </node>

</launch>   
```

再添加一个只启动 IMU，不启动rviz的文件 ah100b.launch

```bash
<!-- open imu and rviz -->
<launch>

    <!-- imu type, default normal -->
    <arg name="type" default="normal" doc="type [normal, modbus]"/>

    <!-- imu python -->
    <node pkg="wit_ros_imu" type="wit_$(arg type)_ros.py" name="imu" output="screen">
        <param name="port"               type = "str"    value="/dev/ah100b"/>
        <param name="baud"               type = "int"    value="115400"/>
    <remap from="/wit/imu" to="/imu"/>
    </node>

</launch>   
```

![image-20260728150716731](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728150717097.webp)

### iii. 运行

#### 1. 安装与修改

在运行前，需要安装**wit_ros_imu包**中运行节点的对应python库

```bash
pip3 install pyserial
pip3 install rospkg
```

并把对应功能包中 **scripts**目录下的**wit_normal_ros.py**文件

<font style="background-color:#f3bb2f;">#!/usr/bin/env python3</font>  改为 `#!/usr/bin/env python`

#### 2. 运行

为了数据可视化，可以打开**ah100b_rviz.launch**进行查看

```bash
roslaunch wit_ros_imu ah100b_rviz.launch
rostopic list 
rostopic echo /imu
```

![image-20260728150752872](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728150753588.webp)

可以看到IMU正常运行，并且有`rostopic echo`数据打印,然后将**rviz**中的IMU组件选择话题 /imu,遥控底盘可看到rviz中模型相应移动。

## h. esteam_multi_navi_plugin

这个功能包是用于多点导航的一个rviz组件包，修改自Autolabor官方提供的一个多点导航包。

### i. 下载原版

 Autolabor官方开发的  [Github 官网地址](https://github.com/autolaborcenter/rviz_navi_multi_goals_pub_plugin)

或者 `git clone https://github.com/autolaborcenter/rviz_navi_multi_goals_pub_plugin.git`

- [功能包代码开发背景与说明](http://www.autolabor.com.cn/usedoc/navigationKit2/version_two/development/multiGoalintro)
- [功能包如何使用](http://www.autolabor.com.cn/usedoc/navigationKit2/version_two/user_guide/quick_start/multi_slam_doc)

依照[功能包如何使用](http://www.autolabor.com.cn/usedoc/navigationKit2/version_two/user_guide/quick_start/multi_slam_doc)实现后的效果

![image-20260728151810037](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728151810250.webp)

### ii. 修改

#### 1. 思路

因为实际使用需要一个功能，在导航整个过程中，

<font style="background-color:#f3bb2f;">静止时（导航结束）</font>--- 语音播报`结束`，交通灯`亮绿色`

<font style="background-color:#f3bb2f;">导航过程中（导航运行）</font>--- 语音播报`运行`，交通灯`亮黄色`

<font style="background-color:#f3bb2f;">遇到障碍物时（导航运行）</font>--- 语音播报`运行`，交通灯`亮红色`

所以可以修改这个导航包的功能定义，添加Qt按钮，实现逻辑。~~现在有个问题是遇到障碍物怎么触发，~~~~**静止时**~~~~，如标注的可以有一个变量False，代表是~~~~**导航结束**~~~~，~~~~**导航过程中**~~~~，可以理解为导航还未结束，也就是变量True，那么遇到障碍该如何判断呢？/move_base/status 话题可能有帮助。~~

<font style="background-color:#f3bb2f;">实现逻辑是依据代码中的多个bool值状态检测，来切换传感器的状态的信息。大致添加了两个按钮</font>`语音播报`<font style="background-color:#f3bb2f;">与</font>`交通灯`<font style="background-color:#f3bb2f;">，而多个bool值包括导航的开始与结束、是否前方有障碍物、是否打开语音播放按钮、是否打开交通灯按钮。</font>

**<font style="color:#68be8d;">qt5_rviz 交通灯大致实现思路</font>**

```ini
交通灯 是一个条件 还是说 开启这个条件 就让交通灯这个机制运行呢？
但是运行有三种状态：

1. 红灯： 红灯表示 前方有障碍物  符合导航过程中前方遇到障碍情况
2. 黄灯：黄灯表示 正常行驶  符合导航正在运行的状态。
3. 绿灯：绿灯表示 静止  符合导航结束的状态

那么，可以使用 ·开始导航·做触发（亮黄灯）·取消导航/导航完成·做触发（亮绿灯）

点击 ·交通灯· 初始发送命令 亮绿灯，并且将交通灯标志设为 True
当点击 ·开始导航· 检测交通灯标志是否为 True，如果为 True 则发送命令 亮黄灯，如果为 False 则不发送命令
当点击 ·取消导航/导航完成· 检测交通灯标志是否为 True，如果为 True 则发送命令 亮绿灯，如果为 False 则不发送命令
而交通灯红灯则在 点击 ·交通灯·就打开设置，
因为导航也有一个标志，代表导航是否在运行
所以可以利用这个，来进行交通灯的切换。
假设导航标志为 A，交通灯标志为 B，则：

当 B为 True 且 A为 False 时，相当于初始 亮绿灯
当 B为 True 且 A为 True 时，相当于 亮黄灯

当 B为 True 且 A为 False 或True 时，初始 亮绿灯或亮黄灯，
但当有障碍物靠近时，灭掉另两个变红，
障碍物离开时，检测A的状态，如果A为True，则亮黄灯，否则亮绿灯。

当 B为 False 时，无论 A为 True 还是 False，都灭掉三个灯 
```

**<font style="color:#68be8d;">qt5_rviz 定时器实现思路</font>**

```c++
// 在构造函数中添加一个新的 QTimer
MultiNaviGoalsPanel::MultiNaviGoalsPanel(QWidget *parent)
        : rviz::Panel(parent), nh_(), maxNumGoal_(1) {

    process_ = new QProcess(this);  // 声明一个QProcess对象

    // ... 其他初始化代码 ...

    // 创建一个新的定时器
    QTimer *audio_timer = new QTimer(this);
    audio_timer->start(5000);  // 设置触发间隔，例如每5秒触发一次

    // 连接定时器的 timeout() 信号到槽函数
    connect(audio_timer, SIGNAL(timeout()), this, SLOT(triggerAudioScript()));

    // ... 其他初始化代码 ...
}

// 创建一个新的槽函数，用于定时器触发
void MultiNaviGoalsPanel::triggerAudioScript() {
    executeAudioScript();  // 定时器触发调用 executeAudioScript()
}

// 修改 executeAudioScript 函数，移除 start_script 参数
void MultiNaviGoalsPanel::executeAudioScript() {
    // 判断是否启动了音频按钮，如果启动了则执行下面语句，若未启动则不执行
    if (audio_ && permit_) {
        // 启动脚本
        if (process_->state() == QProcess::NotRunning) {
            process_->start(script_path);
            if (!process_->waitForStarted()) {
                ROS_ERROR("Failed to start the script.");
                qDebug() << ("---------启动音频脚本失败_qDebug");
            } else {
                ROS_INFO("Script started successfully.");
                qDebug() << ("---------音频脚本启动成功_qDebug");
            }
        } else {
            ROS_INFO("Script is already running.");
            qDebug() << ("---------音频脚本已在运行了_qDebug");
        }
    } else {
        // 停止脚本
        if (process_->state() == QProcess::Running) {
            process_->terminate();
            process_->waitForFinished();
            ROS_INFO("Script terminated successfully.");
            qDebug() << ("---------音频脚本已成功终止_qDebug");
        } else {
            ROS_INFO("No script is running to terminate.");
            qDebug() << ("---------没有音频脚本正在运行以终止_qDebug");
        }
    }
}
```

**`交通灯`**

| 颜色/状态 |                                                  |                                                  |                                                  |                                                  |                                                  |                                                  |      |      |
| :-------: | :----------------------------------------------: | :----------------------------------------------: | :----------------------------------------------: | :----------------------------------------------: | :----------------------------------------------: | :----------------------------------------------: | :--: | :--: |
|           |                     开始导航                     |                     结束导航                     |                    交通灯开启                    |                    交通灯关闭                    |                     有障碍物                     |                     无障碍物                     |      |      |
|   全灭    |                                                  |                                                  |                                                  | <font style="background-color:#f3bb2f;">✓</font> |                                                  |                                                  |      |      |
|  绿灯亮   |                                                  | <font style="background-color:#f3bb2f;">✓</font> | <font style="background-color:#f3bb2f;">✓</font> |                                                  |                                                  | <font style="background-color:#f3bb2f;">✓</font> |      |      |
|  黄灯亮   | <font style="background-color:#f3bb2f;">✓</font> |                                                  | <font style="background-color:#f3bb2f;">✓</font> |                                                  |                                                  | <font style="background-color:#f3bb2f;">✓</font> |      |      |
|  红灯亮1  | <font style="background-color:#f3bb2f;">✓</font> |                                                  | <font style="background-color:#f3bb2f;">✓</font> |                                                  | <font style="background-color:#f3bb2f;">✓</font> |                                                  |      |      |
|  红灯亮2  |                                                  | <font style="background-color:#f3bb2f;">✓</font> | <font style="background-color:#f3bb2f;">✓</font> |                                                  | <font style="background-color:#f3bb2f;">✓</font> |                                                  |      |      |

`语音播报`

| 声音/状态 |                                                  |                                                  |                                                  |                                                  |
| :-------: | :----------------------------------------------: | :----------------------------------------------: | :----------------------------------------------: | :----------------------------------------------: |
|           |                     开始导航                     |                     结束导航                     |                   语音播报打开                   |                   语音播报关闭                   |
|   开启    | <font style="background-color:#f3bb2f;">✓</font> |                                                  | <font style="background-color:#f3bb2f;">✓</font> |                                                  |
|   关闭1   |                                                  | <font style="background-color:#f3bb2f;">✓</font> |                                                  |                                                  |
|   关闭2   |                                                  |                                                  |                                                  | <font style="background-color:#f3bb2f;">✓</font> |

#### 2. 代码

功能包目录分布

+ `esteam_multi_navi_plugin`

  - **src/**	

    * **<font style="color:#2ca9e1;">multi_navi_goal_panel.cpp(功能实现与UI)  </font>**

      ```c++
      #include <cstdio>
      
      #include <ros/console.h>
      
      #include <fstream>
      #include <sstream>
      #include <cmath>
      #include <iostream>
      #include <vector>
      #include <sensor_msgs/LaserScan.h>
      
      #include <QPainter>
      #include <QLineEdit>
      #include <QVBoxLayout>
      #include <QLabel>
      #include <QTimer>
      #include <QDebug>
      #include <QtWidgets/QTableWidget>
      #include <QtWidgets/qheaderview.h>
      
      #include "multi_navi_goal_panel.h"
      
      namespace esteam_multi_navi_plugin {
      
          EsteamMultiNaviGoalsPanel::EsteamMultiNaviGoalsPanel(QWidget *parent)
                  : rviz::Panel(parent), nh_(), maxNumGoal_(1) {
      
              goal_sub_ = nh_.subscribe<geometry_msgs::PoseStamped>("move_base_simple/goal_temp", 1,
                                                                    boost::bind(&EsteamMultiNaviGoalsPanel::goalCntCB, this, _1));
      
              status_sub_ = nh_.subscribe<actionlib_msgs::GoalStatusArray>("move_base/status", 1, boost::bind(&EsteamMultiNaviGoalsPanel::statusCB, this,_1));
      
              // 添加激光雷达订阅者
              laser_sub_ = nh_.subscribe<sensor_msgs::LaserScan>("/scan", 1,boost::bind(&EsteamMultiNaviGoalsPanel::registerScan, this,_1));
      
              goal_pub_ = nh_.advertise<geometry_msgs::PoseStamped>("move_base_simple/goal", 1);
      
              cancel_pub_ = nh_.advertise<actionlib_msgs::GoalID>("move_base/cancel", 1);
      
              marker_pub_ = nh_.advertise<visualization_msgs::Marker>("visualization_marker", 1);
      
              QVBoxLayout *root_layout = new QVBoxLayout;
              // create a panel about "maxNumGoal"
              QHBoxLayout *maxNumGoal_layout = new QHBoxLayout;
              maxNumGoal_layout->addWidget(new QLabel("目标最大数量"));
              output_maxNumGoal_editor_ = new QLineEdit;
              maxNumGoal_layout->addWidget(output_maxNumGoal_editor_);
              output_maxNumGoal_button_ = new QPushButton("确定");
              maxNumGoal_layout->addWidget(output_maxNumGoal_button_);
              root_layout->addLayout(maxNumGoal_layout);
      		
      
              
      
              // ----------------------------新添加的部分---------------------
              audioProcess_ = new QProcess(this);  // 声明一个QProcess对象
              trafficProcess_ = new QProcess(this);  // 声明一个QProcess对象
              // 创建一个 QGridLayout 以网格方式排列复选框
              QGridLayout *checkbox_grid_layout = new QGridLayout;
              cycle_checkbox_ = new QCheckBox("循环");
              audio_checkbox_ = new QCheckBox("语音播报");
              traffic_checkbox_ = new QCheckBox("交通灯");
      
      
              // 将复选框添加到网格布局中（每行最多两个）
              checkbox_grid_layout->addWidget(cycle_checkbox_, 0, 0);
              checkbox_grid_layout->addWidget(audio_checkbox_, 0, 1);
              checkbox_grid_layout->addWidget(traffic_checkbox_, 0, 2);
      
      
              // 将网格布局添加到根布局中
              root_layout->addLayout(checkbox_grid_layout);
              // ----------------------------新添加的部分---------------------
      
      
              // creat a QTable to contain the poseArray
              poseArray_table_ = new QTableWidget;
              initPoseTable();
              root_layout->addWidget(poseArray_table_);
              //creat a manipulate layout
              QHBoxLayout *manipulate_layout = new QHBoxLayout;
              output_reset_button_ = new QPushButton("重置");
              manipulate_layout->addWidget(output_reset_button_);
              output_cancel_button_ = new QPushButton("取消");
              manipulate_layout->addWidget(output_cancel_button_);
              output_startNavi_button_ = new QPushButton("开始导航!");
              manipulate_layout->addWidget(output_startNavi_button_);
              root_layout->addLayout(manipulate_layout);
      
      
              // ----------------------------新添加的部分---------------------
              // 创建一个 QGridLayout 以网格方式排列复选框
              QGridLayout *button_grid_layout = new QGridLayout;
              output_test_button_ = new QPushButton("1(模拟开始导航)");
              output_test1_button_ = new QPushButton("2(模拟取消导航/导航到达目标点)");
              output_test2_button_ = new QPushButton("3(模拟障碍物出现)");
              output_test3_button_ = new QPushButton("4(模拟障碍物消失)");
      
      
              button_grid_layout->addWidget(output_test_button_, 0, 0);
              button_grid_layout->addWidget(output_test1_button_, 0, 1);
              button_grid_layout->addWidget(output_test2_button_, 1, 0);
              button_grid_layout->addWidget(output_test3_button_, 1, 1);
              
      
              root_layout->addLayout(button_grid_layout);
              // ----------------------------新添加的部分---------------------
      
      
      
              setLayout(root_layout);
              // set a Qtimer to start a spin for subscriptions
              QTimer *output_timer = new QTimer(this);
              output_timer->start(200);
      
      
              // ----------------------------新添加的部分---------------------
              // 创建一个新的定时器
              QTimer *while_timer = new QTimer(this);
              while_timer->start(500);  // 设置触发间隔，例如每0.5秒触发一次
              // ----------------------------新添加的部分---------------------
      
      
              // 设置信号与槽的连接
              connect(output_maxNumGoal_button_, SIGNAL(clicked()), this,
                      SLOT(updateMaxNumGoal()));
              connect(output_maxNumGoal_button_, SIGNAL(clicked()), this,
                      SLOT(updatePoseTable()));
              connect(output_reset_button_, SIGNAL(clicked()), this, SLOT(initPoseTable()));
              connect(output_cancel_button_, SIGNAL(clicked()), this, SLOT(cancelNavi()));
              connect(output_startNavi_button_, SIGNAL(clicked()), this, SLOT(startNavi()));
      
      
              // ----------------------------新添加的部分---------------------
              connect(output_test_button_, SIGNAL(clicked()), this, SLOT(testButton()));
              connect(output_test1_button_, SIGNAL(clicked()), this, SLOT(test1Button()));
              connect(output_test2_button_, SIGNAL(clicked()), this, SLOT(test2Button()));
              connect(output_test3_button_, SIGNAL(clicked()), this, SLOT(test3Button()));
              // ----------------------------新添加的部分---------------------
      
      
              connect(cycle_checkbox_, SIGNAL(clicked(bool)), this, SLOT(checkCycle()));
              // ----------------------------新添加的部分---------------------
              // 音频 信号到槽函数
              connect(audio_checkbox_, SIGNAL(clicked(bool)), this, SLOT(checkCycle()));
              // 交通灯 信号到槽函数
              connect(traffic_checkbox_, SIGNAL(clicked(bool)), this, SLOT(checkCycle()));
              // 连接定时器的 timeout() 信号到槽函数
              connect(while_timer, SIGNAL(timeout()), this, SLOT(triggerAudioTraffic()));
              // ----------------------------新添加的部分---------------------
              connect(output_timer, SIGNAL(timeout()), this, SLOT(startSpin()));
      
      
          }
          // 用于Rviz停止以后，关闭交通灯， // 当插件对象被销毁时，启动交通灯全灭
          EsteamMultiNaviGoalsPanel::~EsteamMultiNaviGoalsPanel() {
              // 固定脚本路径为内参
              const QString traffic_script_path = "/home/esteam/.econfig/traffic-light";
              QStringList arguments;
      
      
              // 确保进程已停止
              if (trafficProcess_->state() == QProcess::Running) {
                  trafficProcess_->terminate();  // 尝试优雅地停止进程
                  if (!trafficProcess_->waitForFinished(100)) {  // 等待最多0.1秒
                      trafficProcess_->kill();  // 强制停止进程
                  }
              }
              arguments << "11-1" << "13-1" << "15-1";  // 绿灭、黄灭、红灭
              executeTrafficScript(traffic_script_path, arguments);  // 执行参数
              qDebug() << "---------退出Rviz，关闭交通灯--------";
          }
      
      
          void EsteamMultiNaviGoalsPanel::testButton() {
              qDebug() << "------模拟开始导航_qDebug";
              permit_ = true;
          }
      
      
          void EsteamMultiNaviGoalsPanel::test1Button() {
              qDebug() << "------模拟取消导航/导航到达目标点_qDebug ";
              permit_ = false;
          }
      
      
          void EsteamMultiNaviGoalsPanel::test2Button() {
              qDebug() << "------模拟障碍物出现_qDebug";
              obstacle_ = true;
          }
      
      
          void EsteamMultiNaviGoalsPanel::test3Button() {
              qDebug() << "------模拟障碍物消失_qDebug";
              obstacle_ = false;
          }
      
      
      // 更新maxNumGoal命名
          void EsteamMultiNaviGoalsPanel::updateMaxNumGoal() {
              setMaxNumGoal(output_maxNumGoal_editor_->text());
          }
              
      
      // set up the maximum number of goals
          void EsteamMultiNaviGoalsPanel::setMaxNumGoal(const QString &new_maxNumGoal) {
              // 检查maxNumGoal是否发生改变.
              if (new_maxNumGoal != output_maxNumGoal_) {
                  output_maxNumGoal_ = new_maxNumGoal;
      
      
                  // 如果命名为空，不发布任何信息
                  if (output_maxNumGoal_ == "") {
                      nh_.setParam("maxNumGoal_", 1);
                      maxNumGoal_ = 1;
                  } else {
      //                velocity_publisher_ = nh_.advertise<geometry_msgs::Twist>(output_maxNumGoal_.toStdString(), 1);
                      nh_.setParam("maxNumGoal_", output_maxNumGoal_.toInt());
                      maxNumGoal_ = output_maxNumGoal_.toInt();
                  }
                  Q_EMIT configChanged();
              }
          }
      
      
          // initialize the table of pose
          void EsteamMultiNaviGoalsPanel::initPoseTable() {
              ROS_INFO("Initialize");
              curGoalIdx_ = 0, cycleCnt_ = 0;
              permit_ = false, cycle_ = false,audio_ = false, traffic_ = false,trafficsure_ = false;
              poseArray_table_->clear();
              pose_array_.poses.clear();
              deleteMark();
              poseArray_table_->setRowCount(maxNumGoal_);
              poseArray_table_->setColumnCount(3);
              poseArray_table_->setEditTriggers(QAbstractItemView::NoEditTriggers);
              poseArray_table_->horizontalHeader()->setSectionResizeMode(QHeaderView::Stretch);
              QStringList pose_header;
              pose_header << "x" << "y" << "yaw";
              poseArray_table_->setHorizontalHeaderLabels(pose_header);
              cycle_checkbox_->setCheckState(Qt::Unchecked);
              audio_checkbox_->setCheckState(Qt::Unchecked);
              traffic_checkbox_->setCheckState(Qt::Unchecked);
          }
      
      
          // delete marks in the map
          void EsteamMultiNaviGoalsPanel::deleteMark() {
              visualization_msgs::Marker marker_delete;
              marker_delete.action = visualization_msgs::Marker::DELETEALL;
              marker_pub_.publish(marker_delete);
          }
      
      
          //update the table of pose
          void EsteamMultiNaviGoalsPanel::updatePoseTable() {
              poseArray_table_->setRowCount(maxNumGoal_);
      //        pose_array_.poses.resize(maxNumGoal_);
              QStringList pose_header;
              pose_header << "x" << "y" << "yaw";
              poseArray_table_->setHorizontalHeaderLabels(pose_header);
              poseArray_table_->show();
          }
      
      
          // call back function for counting goals
          void EsteamMultiNaviGoalsPanel::goalCntCB(const geometry_msgs::PoseStamped::ConstPtr &pose) {
              if (pose_array_.poses.size() < maxNumGoal_) {
                  pose_array_.poses.push_back(pose->pose);
                  pose_array_.header.frame_id = pose->header.frame_id;
                  writePose(pose->pose);
                  markPose(pose);
              } else {
                  ROS_ERROR("Beyond the maximum number of goals: %d", maxNumGoal_);
              }
          }
      
      
          // write the poses into the table
          void EsteamMultiNaviGoalsPanel::writePose(geometry_msgs::Pose pose) {
      
      
              poseArray_table_->setItem(pose_array_.poses.size() - 1, 0,
                                        new QTableWidgetItem(QString::number(pose.position.x, 'f', 2)));
              poseArray_table_->setItem(pose_array_.poses.size() - 1, 1,
                                        new QTableWidgetItem(QString::number(pose.position.y, 'f', 2)));
              poseArray_table_->setItem(pose_array_.poses.size() - 1, 2,
                                        new QTableWidgetItem(
                                                QString::number(tf::getYaw(pose.orientation) * 180.0 / 3.14, 'f', 2)));
          }
      
      
          // when setting a Navi Goal, it will set a mark on the map
          void EsteamMultiNaviGoalsPanel::markPose(const geometry_msgs::PoseStamped::ConstPtr &pose) {
              if (ros::ok()) {
                  visualization_msgs::Marker arrow;
                  visualization_msgs::Marker number;
                  arrow.header.frame_id = number.header.frame_id = pose->header.frame_id;
                  arrow.ns = "navi_point_arrow";
                  number.ns = "navi_point_number";
                  arrow.action = number.action = visualization_msgs::Marker::ADD;
                  arrow.type = visualization_msgs::Marker::ARROW;
                  number.type = visualization_msgs::Marker::TEXT_VIEW_FACING;
                  arrow.pose = number.pose = pose->pose;
                  number.pose.position.z += 1.0;
                  arrow.scale.x = 1.0;
                  arrow.scale.y = 0.2;
                  number.scale.z = 1.0;
                  arrow.color.r = number.color.r = 1.0f;
                  arrow.color.g = number.color.g = 0.98f;
                  arrow.color.b = number.color.b = 0.80f;
                  arrow.color.a = number.color.a = 1.0;
                  arrow.id = number.id = pose_array_.poses.size();
                  number.text = std::to_string(pose_array_.poses.size());
                  marker_pub_.publish(arrow);
                  marker_pub_.publish(number);
              }
          }
      
      
          // check whether it is in the cycling situation
          void EsteamMultiNaviGoalsPanel::checkCycle() {
              cycle_ = cycle_checkbox_->isChecked();
              audio_ = audio_checkbox_->isChecked();
              traffic_ = traffic_checkbox_->isChecked();
          }
      
      
          // start to navigate, and only command the first goal
          void EsteamMultiNaviGoalsPanel::startNavi() {
      
      
              curGoalIdx_ = curGoalIdx_ % pose_array_.poses.size();
              if (!pose_array_.poses.empty() && curGoalIdx_ < maxNumGoal_) {
                  geometry_msgs::PoseStamped goal;
                  goal.header = pose_array_.header;
                  goal.pose = pose_array_.poses.at(curGoalIdx_);
                  goal_pub_.publish(goal);
                  ROS_INFO("Navi to the Goal%d", curGoalIdx_ + 1);
                  poseArray_table_->item(curGoalIdx_, 0)->setBackgroundColor(QColor(255, 69, 0));
                  poseArray_table_->item(curGoalIdx_, 1)->setBackgroundColor(QColor(255, 69, 0));
                  poseArray_table_->item(curGoalIdx_, 2)->setBackgroundColor(QColor(255, 69, 0));
                  curGoalIdx_ += 1;
                  permit_ = true;
              } else {
                  ROS_ERROR("Something Wrong");
              }
          }
      
      
          // complete the remaining goals
          void EsteamMultiNaviGoalsPanel::completeNavi() {
              if (curGoalIdx_ < pose_array_.poses.size()) {
                  geometry_msgs::PoseStamped goal;
                  goal.header = pose_array_.header;
                  goal.pose = pose_array_.poses.at(curGoalIdx_);
                  goal_pub_.publish(goal);
                  ROS_INFO("Navi to the Goal%d", curGoalIdx_ + 1);
                  poseArray_table_->item(curGoalIdx_, 0)->setBackgroundColor(QColor(255, 69, 0));
                  poseArray_table_->item(curGoalIdx_, 1)->setBackgroundColor(QColor(255, 69, 0));
                  poseArray_table_->item(curGoalIdx_, 2)->setBackgroundColor(QColor(255, 69, 0));
                  curGoalIdx_ += 1;
                  permit_ = true;
              } else {
                  ROS_ERROR("All goals are completed");
                  permit_ = false;
              }
          }
      
      
          // command the goals cyclically
          void EsteamMultiNaviGoalsPanel::cycleNavi() {
              if (permit_) {
                  geometry_msgs::PoseStamped goal;
                  goal.header = pose_array_.header;
                  goal.pose = pose_array_.poses.at(curGoalIdx_ % pose_array_.poses.size());
                  goal_pub_.publish(goal);
                  ROS_INFO("Navi to the Goal%lu, in the %dth cycle", curGoalIdx_ % pose_array_.poses.size() + 1,
                           cycleCnt_ + 1);
                  bool even = ((cycleCnt_ + 1) % 2 != 0);
                  QColor color_table;
                  if (even) color_table = QColor(255, 69, 0); else color_table = QColor(100, 149, 237);
                  poseArray_table_->item(curGoalIdx_ % pose_array_.poses.size(), 0)->setBackgroundColor(color_table);
                  poseArray_table_->item(curGoalIdx_ % pose_array_.poses.size(), 1)->setBackgroundColor(color_table);
                  poseArray_table_->item(curGoalIdx_ % pose_array_.poses.size(), 2)->setBackgroundColor(color_table);
                  curGoalIdx_ += 1;
                  cycleCnt_ = curGoalIdx_ / pose_array_.poses.size();
              }
          }
      
      
          // cancel the current command
          void EsteamMultiNaviGoalsPanel::cancelNavi() {
              if (!cur_goalid_.id.empty()) {
                  cancel_pub_.publish(cur_goalid_);
                  ROS_ERROR("Navigation have been canceled");
              }
          }
      
      
          // call back for listening current state
          void EsteamMultiNaviGoalsPanel::statusCB(const actionlib_msgs::GoalStatusArray::ConstPtr &statuses) {
              bool arrived_pre = arrived_;
              arrived_ = checkGoal(statuses->status_list);
              if (arrived_) { ROS_ERROR("%d,%d", int(arrived_), int(arrived_pre)); }
              if (arrived_ && arrived_ != arrived_pre && ros::ok() && permit_) {
                  if (cycle_) cycleNavi();
                  else completeNavi();
              }
          }
      
      
          //check the current state of goal
          bool EsteamMultiNaviGoalsPanel::checkGoal(std::vector<actionlib_msgs::GoalStatus> status_list) {
              bool done;
              if (!status_list.empty()) {
                  for (auto &i : status_list) {
                      if (i.status == 3) {
                          done = true;
                          ROS_INFO("completed Goal%d", curGoalIdx_);
                      } else if (i.status == 4) {
                          ROS_ERROR("Goal%d is Invalid, Navi to Next Goal%d", curGoalIdx_, curGoalIdx_ + 1);
                          return true;
                      } else if (i.status == 0) {
                          done = true;
                      } else if (i.status == 1) {
                          cur_goalid_ = i.goal_id;
                          done = false;
                      } else done = false;
                  }
              } else {
                  ROS_INFO("Please input the Navi Goal");
                  done = false;
              }
              return done;
          }
      
      
      // spin for subscribing
          void EsteamMultiNaviGoalsPanel::startSpin() {
              if (ros::ok()) {
                  ros::spinOnce();
              }
          }
      
      
          // -----------------------------------------------------------------------------------新添加的部分（订阅 /scan的处理）----------------------------------------------------------------------------------------
              // 用于检测障碍物，如果检测到障碍物则改变障碍物标志位为true，否则为false
          void EsteamMultiNaviGoalsPanel::registerScan(const sensor_msgs::LaserScan::ConstPtr &scan_msg) {
              // 提取激光雷达扫描的最小角度（通常是负值）
              const float angle_min = scan_msg->angle_min;
              // 提取激光雷达每个扫描角度的增量
              const float angle_increment = scan_msg->angle_increment;
              // 提取激光雷达扫描的距离数据
              const std::vector<float> ranges = scan_msg->ranges;
      
      
              // 设置最大检测距离（单位：米）
              const float max_distance = 0.4;
              // 设置检测角度范围：正前方左右各40度，转换为弧度
              const float detection_angle = 20.0 * M_PI / 180.0; 
              // 获取扫描数据的点数
              const int range_size = ranges.size();
              // 默认没有检测到障碍物
              bool detected = false;
      
      
              // 遍历每个扫描点
              for (int i = 0; i < range_size; ++i) {
                  // 计算当前扫描点的角度
                  const float angle = angle_min + i * angle_increment;
                  // 检查当前点的角度是否在正前方左右各40度的范围内
                  if (angle >= -detection_angle && angle <= detection_angle) {
                      // 获取当前点的距离
                      const float distance = ranges[i];
      
      
                      // 检查距离是否小于最大检测距离
                      if (distance < max_distance) {
                          // 如果距离小于最大检测距离，设置检测到障碍物标志
                          detected = true;
                          // 输出障碍物信息
                          ROS_INFO("在距离：%.2f m，角度：%.2f °检测到障碍物", distance, angle * 180.0 / M_PI);
                          // 如果检测到一个障碍物，可以停止进一步的检查
                          break; 
                      }
                  }
              }
              // 根据检测结果更新全局障碍物标志位
              obstacle_ = detected;
          }
          // -----------------------------------------------------------------------------------新添加的部分（订阅 /scan的处理）----------------------------------------------------------------------------------------
      
      
          // -----------------------------------------------------------------------------------新添加的部分（处理定时器触发的音频脚本、交通灯控制）----------------------------------------------------------       
          // 创建一个新的槽函数，用于定时器触发
          void EsteamMultiNaviGoalsPanel::triggerAudioTraffic() {
              checkVariableChanges();  // 定时器触发调用 checkVariableChanges()  在第一位，用于更新 trafficsure_ 标志，trafficsure_ 标志用于判断是否需要交通灯脚本
              executeAudio();  // 定时器触发调用 executeAudio()
              executeTrafficLight();  // 定时器触发调用 executeTrafficLight()
          }
      
      
          void EsteamMultiNaviGoalsPanel::checkVariableChanges() {
              static bool lastTraffic = traffic_;
              static bool lastPermit = permit_;
              static bool lastObstacle = obstacle_;
      
       
              // 如果三个变量中有任何一个发生变化
              if (traffic_ != lastTraffic || permit_ != lastPermit || obstacle_ != lastObstacle) {
                  trafficsure_ = true;  // 更新 trafficsure_ 标志
      
      
                  // 记录当前状态
                  lastTraffic = traffic_;
                  lastPermit = permit_;
                  lastObstacle = obstacle_;
              }
          }
      
      
          // 用于启动音频脚本文件
          void EsteamMultiNaviGoalsPanel::executeAudio() {
              // 固定脚本路径为内参
              const QString audio_script_path =  "/home/esteam/.econfig/play-audio";
      
      
              // 判断是否启动了音频按钮，如果启动了则执行下面语句，若未启动则不执行
              if (audio_ && permit_) {
                  // 启动脚本
                  if (audioProcess_->state() == QProcess::NotRunning) {
                      audioProcess_->start(audio_script_path);
                      if (!audioProcess_->waitForStarted()) {
                          // ROS_ERROR("Failed to start the script.");
                          qDebug() << ("---------启动音频脚本失败_qDebug");
                      } 
                      else {
                          // ROS_INFO("Script started successfully.");
                          qDebug() << ("---------音频脚本启动成功_qDebug");
                      }
                  }
                  else {
                      // ROS_INFO("Script is already running.");
                      qDebug() << ("---------音频脚本正在运行中_qDebug");
                  }
              } 
              else {
                  // 停止脚本
                  if (audioProcess_->state() == QProcess::Running) {
                      audioProcess_->terminate();
                      audioProcess_->waitForFinished();
                      // ROS_INFO("Script terminated successfully.");
                      qDebug() << ("---------音频脚本已成功终止_qDebug");
                  } 
                  else {
                      // ROS_INFO("No script is running to terminate.");
                      qDebug() << ("---------没有音频脚本正在运行以终止_qDebug");
                  }
              }
          }
      
      
          // 用于启动交通灯脚本文件
          void EsteamMultiNaviGoalsPanel::executeTrafficLight() {
              // 固定脚本路径为内参
              const QString traffic_script_path = "/home/esteam/.econfig/traffic-light";
              QStringList arguments;
      
      
              // 如果traffic_、permit_、obstacle_三个条件任意一个变化，则执行下面语句
              if (trafficsure_)
              {
                  trafficsure_ = false;  // 重置标志位，防止重复执行
      
      
                  // 确保进程已停止
                  if (trafficProcess_->state() == QProcess::Running) {
                      trafficProcess_->terminate();  // 尝试优雅地停止进程
                      if (!trafficProcess_->waitForFinished(300)) {  // 等待最多3秒
                          trafficProcess_->kill();  // 强制停止进程
                      }
                  }
      
      
                  // 根据不同的条件设置参数并执行
                  if (!traffic_) {
                      arguments << "11-1" << "13-1" << "15-1";  // 绿灭、黄灭、红灭
                      qDebug() << "---------交通灯标志没有开启";
                      executeTrafficScript(traffic_script_path, arguments);  // 执行第一个参数
                  } else if (traffic_ && !permit_ && !obstacle_) {
                      arguments << "11-1" << "13-1" << "15-1";  // 红灭、黄灭、绿灭
                      executeTrafficScript(traffic_script_path, arguments);  // 执行第一个参数
                      arguments.clear();
                      arguments << "11-0";  // 绿亮
                      qDebug() << "---------交通灯标志开启，没有在导航中，没有检测到障碍物";
                      executeTrafficScript(traffic_script_path, arguments);  // 执行第二个参数
                  } else if (traffic_ && !permit_ && obstacle_) {
                      arguments << "11-1" << "13-1" << "15-1";  // 红灭、黄灭、绿灭
                      executeTrafficScript(traffic_script_path, arguments);  // 执行第一个参数
                      arguments.clear();
                      arguments << "15-0";  // 红亮
                      qDebug() << "---------交通灯标志开启，没有在导航中，检测到障碍物";
                      executeTrafficScript(traffic_script_path, arguments);  // 执行第二个参数
                  } else if (traffic_ && permit_ && !obstacle_) {
                      arguments << "11-1" << "13-1" << "15-1";  // 红灭、黄灭、绿灭
                      executeTrafficScript(traffic_script_path, arguments);  // 执行第一个参数
                      arguments.clear();
                      arguments << "13-0";  // 黄亮
                      qDebug() << "---------交通灯标志开启，在导航中，没有检测到障碍物";
                      executeTrafficScript(traffic_script_path, arguments);  // 执行第二个参数
                  } else if (traffic_ && permit_ && obstacle_) {
                      arguments << "11-1" << "13-1" << "15-1";  // 红灭、黄灭、绿灭
                      executeTrafficScript(traffic_script_path, arguments);  // 执行第一个参数
                      arguments.clear();
                      arguments << "15-0";  // 红亮
                      qDebug() << "---------交通灯标志开启，在导航中，检测到障碍物";
                      executeTrafficScript(traffic_script_path, arguments);  // 执行第二个参数
                  }
              }
          }
      
      
          // 执行交通灯脚本
          void EsteamMultiNaviGoalsPanel::executeTrafficScript(const QString &scriptPath, const QStringList &args) {
              // 启动脚本并传入参数
              trafficProcess_->start(scriptPath, args);
      
      
              if (!trafficProcess_->waitForStarted()) {
                  // ROS_ERROR("启动交通灯脚本失败。");
                  return; // 如果启动失败，则不进行后续处理
              }
      
      
              if (!trafficProcess_->waitForFinished()) {
                  // ROS_ERROR("交通灯脚本未成功完成。");
              } else {
                  // ROS_INFO("交通灯脚本已成功完成。");
              }
          }
      
      
          // -----------------------------------------------------------------------------------新添加的部分（处理定时器触发的音频脚本、交通灯控制）----------------------------------------------------------
      
      } // end namespace navi-multi-goals-pub-rviz-plugin
      
      // 声明此类是一个rviz的插件
      
      #include <pluginlib/class_list_macros.h>
      
      PLUGINLIB_EXPORT_CLASS(esteam_multi_navi_plugin::EsteamMultiNaviGoalsPanel, rviz::Panel)
          
      ```

    * **<font style="color:#a59aca;">multi_navi_goal_panel.h(变量名声明)</font>**

      ```h
      #ifndef MULTI_NAVI_GOAL_PANEL_H
      #define MULTI_NAVI_GOAL_PANEL_H
      
      
      #include <string>
      
      #include <ros/ros.h>
      #include <ros/console.h>
      
      #include <rviz/panel.h>
      
      #include <QProcess>
      #include <QPushButton>
      #include <QTableWidget>
      #include <QCheckBox>
      
      #include <visualization_msgs/Marker.h>
      #include <geometry_msgs/PoseArray.h>
      #include <geometry_msgs/Point.h>
      #include <geometry_msgs/PoseStamped.h>
      #include <std_msgs/String.h>
      #include <actionlib_msgs/GoalStatus.h>
      #include <actionlib_msgs/GoalStatusArray.h>
      #include <tf/transform_datatypes.h>
      #include <sensor_msgs/LaserScan.h>
      
      
      namespace esteam_multi_navi_plugin {
      
      
      
          class EsteamMultiNaviGoalsPanel : public rviz::Panel {
          Q_OBJECT
          public:
              explicit EsteamMultiNaviGoalsPanel(QWidget *parent = 0);
       	virtual ~EsteamMultiNaviGoalsPanel();  // 显式声明虚析构函数
      
          public Q_SLOTS:
      
              void setMaxNumGoal(const QString &maxNumGoal);
      
              void writePose(geometry_msgs::Pose pose);
              void markPose(const geometry_msgs::PoseStamped::ConstPtr &pose);
              void deleteMark();
      
              void registerScan(const sensor_msgs::LaserScan::ConstPtr &scan_msg);
              void triggerAudioTraffic();  // 声明 triggerAudioTraffic 函数
              void checkVariableChanges();  // 声明 checkVariableChanges 函数
              void executeAudio();  // 声明 executeAudio 函数
              void executeTrafficLight();  // 声明 executeTrafficLight 函数
              void executeTrafficScript(const QString &scriptPath, const QStringList &args);  // 声明 executeTrafficScript 函数
      
              void testButton();                  // test button
              void test1Button();                  // test button1
              void test2Button();                  // test button2
              void test3Button();                  // test button3
      
          protected Q_SLOTS:
      
              void updateMaxNumGoal();             // update max number of goal
              void initPoseTable();               // initialize the pose table
      
              void updatePoseTable();             // update the pose table
              void startNavi();                   // start navigate for the first pose
              void cancelNavi();
      
              void goalCntCB(const geometry_msgs::PoseStamped::ConstPtr &pose);  //goal count sub callback function
      
              void statusCB(const actionlib_msgs::GoalStatusArray::ConstPtr &statuses); //status sub callback function
      
              void checkCycle();
      
              void completeNavi();               //after the first pose, continue to navigate the rest of poses
              void cycleNavi();
      
              bool checkGoal(std::vector<actionlib_msgs::GoalStatus> status_list);  // check whether arrived the goal
      
              static void startSpin(); // spin for sub
          protected:
              QLineEdit *output_maxNumGoal_editor_;
              QPushButton *output_maxNumGoal_button_, *output_reset_button_, *output_startNavi_button_, *output_cancel_button_;
              QPushButton  *output_test_button_,*output_test1_button_,*output_test2_button_,*output_test3_button_;
      
              QTableWidget *poseArray_table_;
              QCheckBox *cycle_checkbox_;
              QCheckBox *audio_checkbox_;
              QCheckBox *traffic_checkbox_;
      
              QString output_maxNumGoal_;
      
              // The ROS node handle.
              ros::NodeHandle nh_;
              ros::Publisher goal_pub_, cancel_pub_, marker_pub_;
              ros::Subscriber goal_sub_, status_sub_,laser_sub_;
      
      
              int maxNumGoal_;
              int curGoalIdx_ = 0, cycleCnt_ = 0;
              //  新添加 变量 音频、交通灯、障碍物检测 标志位
              bool permit_ = false, cycle_ = false, audio_ = false,traffic_ = false, arrived_ = false,obstacle_ = false,trafficsure_ = false;
              geometry_msgs::PoseArray pose_array_;
      
              actionlib_msgs::GoalID cur_goalid_;
      
             // 添加两个 QProcess 对象作为成员变量
              QProcess *audioProcess_, *trafficProcess_;
      
          };
      
      } // end namespace navi-multi-goals-pub-rviz-plugin
      
      
      #endif // MULTI_NAVI_GOAL_PANEL_H
      ```

  - **<font style="color:#2ca9e1;">CMakeLists.txt(功能包配置)</font>**

    ```txt
    cmake_minimum_required(VERSION 2.8.3)
    project(esteam_multi_navi_plugin)
    
    ## Find Catkin and any catkin packages
    find_package(catkin REQUIRED COMPONENTS
      rviz
      geometry_msgs
      std_msgs
      actionlib_msgs
      sensor_msgs
    )
    
    ## Declare a catkin package
    catkin_package(
      CATKIN_DEPENDS message_runtime sensor_msgs
    )
    
    ## Specify additional locations of header files
    include_directories(
      ${catkin_INCLUDE_DIRS}
    )
    
    ## This setting causes Qt's "MOC" generation to happen automatically.
    set(CMAKE_AUTOMOC ON)
    
    ## This plugin includes Qt widgets, so we must include Qt.
    ## We'll use the version that rviz used so they are compatible.
    if(rviz_QT_VERSION VERSION_LESS "5")
      message(STATUS "Using Qt4 based on the rviz_QT_VERSION: ${rviz_QT_VERSION}")
      find_package(Qt4 ${rviz_QT_VERSION} EXACT REQUIRED QtCore QtGui)
      include(${QT_USE_FILE})
    else()
      message(STATUS "Using Qt5 based on the rviz_QT_VERSION: ${rviz_QT_VERSION}")
      find_package(Qt5 ${rviz_QT_VERSION} EXACT REQUIRED Core Widgets)
      set(QT_LIBRARIES Qt5::Widgets)
    endif()
    add_definitions(-DQT_NO_KEYWORDS)
    
    ## Specify the list of source files
    set(SOURCE_FILES
      src/multi_navi_goal_panel.cpp
      ${MOC_FILES}
    )
    
    ## Declare a library
    add_library(${PROJECT_NAME} ${SOURCE_FILES})
    
    ## Link the library with Qt and Catkin libraries
    target_link_libraries(${PROJECT_NAME} ${QT_LIBRARIES} ${catkin_LIBRARIES})
    
    ## Install rules
    install(TARGETS ${PROJECT_NAME}
      ARCHIVE DESTINATION ${CATKIN_PACKAGE_LIB_DESTINATION}
      LIBRARY DESTINATION ${CATKIN_PACKAGE_LIB_DESTINATION}
      RUNTIME DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION}
    )
    
    install(FILES 
      plugin_description.xml
      DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION})
    
    install(DIRECTORY icons/
      DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/icons)
    
    install(DIRECTORY media/
      DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/media)
    ```

  - **<font style="color:#f1bf99;">package.xml(功能包配置)</font>**

    ```xml
    <package>
    <name>esteam_multi_navi_plugin</name>
    <version>0.0.0</version>
    <description>The navi_multi_goals_pub_rviz_plugin package</description>
    <!--  One maintainer tag required, multiple allowed, one person per tag  -->
    <!--  Example:   -->
    <!--  <maintainer email="jane.doe@example.com">Jane Doe</maintainer>  -->
    <maintainer email="ryoo@todo.todo">ryoo</maintainer>
    <!--  One license tag required, multiple allowed, one license per tag  -->
    <!--  Commonly used license strings:  -->
    <!--    BSD, MIT, Boost Software License, GPLv2, GPLv3, LGPLv2.1, LGPLv3  -->
    <license>TODO</license>
    <!--  Url tags are optional, but mutiple are allowed, one per tag  -->
    <!--  Optional attribute type can be: website, bugtracker, or repository  -->
    <!--  Example:  -->
    <!--  <url type="website">http://wiki.ros.org/navi_multi_goals_pub_rviz_plugin</url>  -->
    <!--  Author tags are optional, mutiple are allowed, one per tag  -->
    <!--  Authors do not have to be maintianers, but could be  -->
    <!--  Example:  -->
    <!--  <author email="jane.doe@example.com">Jane Doe</author>  -->
    <!--  The *_depend tags are used to specify dependencies  -->
    <!--  Dependencies can be catkin packages or system dependencies  -->
    <!--  Examples:  -->
    <!--  Use build_depend for packages you need at compile time:  -->
    <!--    <build_depend>message_generation</build_depend>  -->
    <!--  Use buildtool_depend for build tool packages:  -->
    <!--    <buildtool_depend>catkin</buildtool_depend>  -->
    <!--  Use run_depend for packages you need at runtime:  -->
    <!--    <run_depend>message_runtime</run_depend>  -->
    <!--  Use test_depend for packages you need only for testing:  -->
    <!--    <test_depend>gtest</test_depend>  -->
    <buildtool_depend>catkin</buildtool_depend>
    <build_depend>roscpp</build_depend>
    <build_depend>geometry_msgs</build_depend>
    <build_depend>actionlib_msgs</build_depend>
    <build_depend>rviz</build_depend>
    <build_depend>std_msgs</build_depend>
    <build_depend>message_generation</build_depend>
    <build_depend>sensor_msgs</build_depend>
    
    <run_depend>roscpp</run_depend>
    <run_depend>rviz</run_depend>
    <run_depend>std_msgs</run_depend>
    <run_depend>geometry_msgs</run_depend>
    <run_depend>message_runtime</run_depend>
    <run_depend>actionlib_msgs</run_depend>
    <run_depend>sensor_msgs</run_depend>
    <export>
    <rviz plugin="${prefix}/plugin_description.xml"/>
    </export>
    </package>
    ```

  - **<font style="color:#f1bf99;">plugin_description.xml(定义为Rviz插件)</font>**

    ```xml
    <library path="lib/libesteam_multi_navi_plugin">
        <class name="esteam_multi_navi_plugin/EsteamMultiNaviGoalsPanel"
               type="esteam_multi_navi_plugin::EsteamMultiNaviGoalsPanel"
               base_class_type="rviz::Panel">
            <description>A panel widget allowing multi-goals navigation.</description>
        </class>
    </library>
    ```

### iii. 运行

依据[Autolabor官方同样的配置](http://www.autolabor.com.cn/usedoc/navigationKit2/version_two/user_guide/quick_start/multi_slam_doc),然后运行效果。这里还加了几个测试按钮，用来改变Bool值状态。

![image-20260728155000546](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728155000906.webp)

这里使用的交通灯仿真，在`附录 | 系统设置 -> ①各种脚本 ->5）GPIO控制测试`,实际使用中需要替换multi_navi_goal_panel.cpp代码中音频（audio_script_path）与交通灯（traffic_script_path）的控制脚本文件路径。

### iv. 更新

`2024-10-17 更新` 加了一堆传感器，然后重新写了一下逻辑，现阶段搭配脚本读取串口数据、处理数据。脚本位于 **附录 | 系统设置** -> **① 脚本** -> **6）UART 通信-引脚**,效果图如下

![image-20260728155110480](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728155111207.webp)

更新的代码，这里只更新 **.cpp文件** 与对应的 **.h文件**，其他未动。

+ **src/**

  - **<font style="color:#68be8d;">multi_navi_goal_panel.cpp</font>**

    ```
    #include <cstdio>
    
    #include <ros/console.h>
    
    #include <fstream>
    #include <sstream>
    #include <cmath>
    #include <iostream>
    #include <vector>
    #include <sensor_msgs/LaserScan.h>
    
    #include <QPainter>
    #include <QLineEdit>
    #include <QVBoxLayout>
    #include <QLabel>
    #include <QTimer>
    #include <QDebug>
    #include <QtWidgets/QTableWidget>
    #include <QtWidgets/qheaderview.h>
    
    #include "multi_navi_goal_panel.h"
    
    // 定义静态常量
    const QString esteam_multi_navi_plugin::EsteamMultiNaviGoalsPanel::audio_script_path = "/home/esteam/.econfig/play-audio";
    const QString esteam_multi_navi_plugin::EsteamMultiNaviGoalsPanel::ser_edit_script_path = "/home/esteam/.econfig/ser-edit";
    
    namespace esteam_multi_navi_plugin {
    
        EsteamMultiNaviGoalsPanel::EsteamMultiNaviGoalsPanel(QWidget *parent)
                : rviz::Panel(parent), nh_(), maxNumGoal_(1) {
    
            goal_sub_ = nh_.subscribe<geometry_msgs::PoseStamped>("move_base_simple/goal_temp", 1,
                                                                  boost::bind(&EsteamMultiNaviGoalsPanel::goalCntCB, this, _1));
    
            status_sub_ = nh_.subscribe<actionlib_msgs::GoalStatusArray>("move_base/status", 1,
                                                                         boost::bind(&EsteamMultiNaviGoalsPanel::statusCB, this,
                                                                                     _1));
    
    
            // 添加激光雷达订阅者
            laser_sub_ = nh_.subscribe<sensor_msgs::LaserScan>("/scan", 1,
                                                                        boost::bind(&EsteamMultiNaviGoalsPanel::registerScan, this,_1));
    
    
            goal_pub_ = nh_.advertise<geometry_msgs::PoseStamped>("move_base_simple/goal", 1);
    
    
            cancel_pub_ = nh_.advertise<actionlib_msgs::GoalID>("move_base/cancel", 1);
    
    
            marker_pub_ = nh_.advertise<visualization_msgs::Marker>("visualization_marker", 1);
    
    
            QVBoxLayout *root_layout = new QVBoxLayout;
            // create a panel about "maxNumGoal"
            QHBoxLayout *maxNumGoal_layout = new QHBoxLayout;
            maxNumGoal_layout->addWidget(new QLabel("目标最大数量"));
            output_maxNumGoal_editor_ = new QLineEdit;
            maxNumGoal_layout->addWidget(output_maxNumGoal_editor_);
            output_maxNumGoal_button_ = new QPushButton("确定");
            maxNumGoal_layout->addWidget(output_maxNumGoal_button_);
            root_layout->addLayout(maxNumGoal_layout);
    
    
            // ----------------------------新添加的部分---------------------
            audioProcess_ = new QProcess(this);  // 声明一个QProcess对象
            trafficProcess_ = new QProcess(this);  // 声明一个QProcess对象
            envProcess_ = new QProcess(this);  // 声明一个QProcess对象
            // 创建一个 QGridLayout 以网格方式排列复选框
            QGridLayout *checkbox_grid_layout = new QGridLayout;
            cycle_checkbox_ = new QCheckBox("循环");
            audio_checkbox_ = new QCheckBox("语音播报");
            traffic_checkbox_ = new QCheckBox("警示灯障碍监测");
            env_checkbox_ = new QCheckBox("环境监测");
    
    
            // 将复选框添加到网格布局中（每行最多两个）
            checkbox_grid_layout->addWidget(cycle_checkbox_, 0, 0);
            checkbox_grid_layout->addWidget(audio_checkbox_, 0, 1);
            checkbox_grid_layout->addWidget(traffic_checkbox_, 1, 0);
            checkbox_grid_layout->addWidget(env_checkbox_, 1, 1);
    
    
            // 将网格布局添加到根布局中
            root_layout->addLayout(checkbox_grid_layout);
            // ----------------------------新添加的部分---------------------
    
    
            // creat a QTable to contain the poseArray
            poseArray_table_ = new QTableWidget;
            initPoseTable();
            root_layout->addWidget(poseArray_table_);
            //creat a manipulate layout
            QHBoxLayout *manipulate_layout = new QHBoxLayout;
            output_reset_button_ = new QPushButton("重置");
            manipulate_layout->addWidget(output_reset_button_);
            output_cancel_button_ = new QPushButton("取消");
            manipulate_layout->addWidget(output_cancel_button_);
            output_startNavi_button_ = new QPushButton("开始导航!");
            manipulate_layout->addWidget(output_startNavi_button_);
            root_layout->addLayout(manipulate_layout);
    
    
            // ----------------------------新添加的部分---------------------
            // 创建一个 QGridLayout 以网格方式排列复选框
            QGridLayout *button_grid_layout = new QGridLayout;
            output_test_button_ = new QPushButton("1(模拟开始导航)");
            output_test1_button_ = new QPushButton("2(模拟取消导航/导航到达目标点)");
            output_test2_button_ = new QPushButton("3(模拟障碍物出现)");
            output_test3_button_ = new QPushButton("4(模拟障碍物消失)");
    
    
            button_grid_layout->addWidget(output_test_button_, 0, 0);
            button_grid_layout->addWidget(output_test1_button_, 0, 1);
            button_grid_layout->addWidget(output_test2_button_, 1, 0);
            button_grid_layout->addWidget(output_test3_button_, 1, 1);
    
    
            root_layout->addLayout(button_grid_layout);
            // ----------------------------新添加的部分---------------------
    
    
    
            setLayout(root_layout);
            // set a Qtimer to start a spin for subscriptions
            QTimer *output_timer = new QTimer(this);
            output_timer->start(200);
    
    
            // ----------------------------新添加的部分---------------------
            // 创建一个新的定时器
            QTimer *while_timer = new QTimer(this);
            while_timer->start(500);  // 设置触发间隔，例如每0.5秒触发一次
            // ----------------------------新添加的部分---------------------
    
    
            // 设置信号与槽的连接
            connect(output_maxNumGoal_button_, SIGNAL(clicked()), this,
                    SLOT(updateMaxNumGoal()));
            connect(output_maxNumGoal_button_, SIGNAL(clicked()), this,
                    SLOT(updatePoseTable()));
            connect(output_reset_button_, SIGNAL(clicked()), this, SLOT(initPoseTable()));
            connect(output_cancel_button_, SIGNAL(clicked()), this, SLOT(cancelNavi()));
            connect(output_startNavi_button_, SIGNAL(clicked()), this, SLOT(startNavi()));
    
    
            // ----------------------------新添加的部分---------------------
            connect(output_test_button_, SIGNAL(clicked()), this, SLOT(testButton()));
            connect(output_test1_button_, SIGNAL(clicked()), this, SLOT(test1Button()));
            connect(output_test2_button_, SIGNAL(clicked()), this, SLOT(test2Button()));
            connect(output_test3_button_, SIGNAL(clicked()), this, SLOT(test3Button()));
            // ----------------------------新添加的部分---------------------
    
    
            connect(cycle_checkbox_, SIGNAL(clicked(bool)), this, SLOT(checkCycle()));
            // ----------------------------新添加的部分---------------------
            // 音频 信号到槽函数
            connect(audio_checkbox_, SIGNAL(clicked(bool)), this, SLOT(checkCycle()));
            // 障碍物检测 信号到槽函数
            connect(traffic_checkbox_, SIGNAL(clicked(bool)), this, SLOT(checkCycle()));
            // 环境监测 信号到槽函数
            connect(env_checkbox_, SIGNAL(clicked(bool)), this, SLOT(checkCycle()));
            // 连接定时器的 timeout() 信号到槽函数
            connect(while_timer, SIGNAL(timeout()), this, SLOT(triggerAudioTraffic()));
            // ----------------------------新添加的部分---------------------
            connect(output_timer, SIGNAL(timeout()), this, SLOT(startSpin()));
    
    
        }
    
    
        // 用于Rviz停止以后，关闭交通灯， // 当插件对象被销毁时，启动交通灯全灭
        EsteamMultiNaviGoalsPanel::~EsteamMultiNaviGoalsPanel() {
            // 固定脚本路径为内参
            QStringList traffic_args;
    
    
            // 确保进程已停止
            if (trafficProcess_->state() == QProcess::Running) {
                trafficProcess_->terminate();  // 尝试优雅地停止进程
                if (!trafficProcess_->waitForFinished(100)) {  // 等待最多0.1秒
                    trafficProcess_->kill();  // 强制停止进程
                }
            }
            traffic_args  << "E-03@" << "E-13@" << "E-04@"  << "E-14@" << "A-1@" << "B-1@" << "C-1@" << "F1-1!" << "F2-1!" << "F3-1!" << "G-1!";  // 绿灭、黄灭、红灭
            executeTrafficScript(ser_edit_script_path, traffic_args);  // 执行参数
            qDebug() << "---------退出Rviz，关闭所有参数设置，--------";
    
    
    
        }
    
    
    
    
        void EsteamMultiNaviGoalsPanel::testButton() {
            qDebug() << "------模拟开始导航_qDebug";
            permit_ = true;
    
    
        }
    
    
        void EsteamMultiNaviGoalsPanel::test1Button() {
            qDebug() << "------模拟取消导航/导航到达目标点_qDebug ";
            permit_ = false;
    
    
        }
    
    
        void EsteamMultiNaviGoalsPanel::test2Button() {
            qDebug() << "------模拟障碍物出现_qDebug";
            obstacle_ = true;
        }
    
    
        void EsteamMultiNaviGoalsPanel::test3Button() {
            qDebug() << "------模拟障碍物消失_qDebug";
            obstacle_ = false;
        }
    
    
        // 更新maxNumGoal命名
        void EsteamMultiNaviGoalsPanel::updateMaxNumGoal() {
            setMaxNumGoal(output_maxNumGoal_editor_->text());
        }
    
    
        // set up the maximum number of goals
        void EsteamMultiNaviGoalsPanel::setMaxNumGoal(const QString &new_maxNumGoal) {
            // 检查maxNumGoal是否发生改变.
            if (new_maxNumGoal != output_maxNumGoal_) {
                output_maxNumGoal_ = new_maxNumGoal;
    
    
                // 如果命名为空，不发布任何信息
                if (output_maxNumGoal_ == "") {
                    nh_.setParam("maxNumGoal_", 1);
                    maxNumGoal_ = 1;
                } else {
                    //   velocity_publisher_ = nh_.advertise<geometry_msgs::Twist>(output_maxNumGoal_.toStdString(), 1);
                    nh_.setParam("maxNumGoal_", output_maxNumGoal_.toInt());
                    maxNumGoal_ = output_maxNumGoal_.toInt();
                }
                Q_EMIT configChanged();
            }
        }
    
    
        // initialize the table of pose
        void EsteamMultiNaviGoalsPanel::initPoseTable() {
            ROS_INFO("Initialize");
            curGoalIdx_ = 0, cycleCnt_ = 0;
            permit_ = false, cycle_ = false,audio_ = false, traffic_ = false,trafficsure_ = false,env_ = false;
            poseArray_table_->clear();
            pose_array_.poses.clear();
            deleteMark();
            poseArray_table_->setRowCount(maxNumGoal_);
            poseArray_table_->setColumnCount(3);
            poseArray_table_->setEditTriggers(QAbstractItemView::NoEditTriggers);
            poseArray_table_->horizontalHeader()->setSectionResizeMode(QHeaderView::Stretch);
            QStringList pose_header;
            pose_header << "x" << "y" << "yaw";
            poseArray_table_->setHorizontalHeaderLabels(pose_header);
            cycle_checkbox_->setCheckState(Qt::Unchecked);
            audio_checkbox_->setCheckState(Qt::Unchecked);
            traffic_checkbox_->setCheckState(Qt::Unchecked);
            env_checkbox_->setCheckState(Qt::Unchecked);
    
    
        }
    
    
        // delete marks in the map
        void EsteamMultiNaviGoalsPanel::deleteMark() {
            visualization_msgs::Marker marker_delete;
            marker_delete.action = visualization_msgs::Marker::DELETEALL;
            marker_pub_.publish(marker_delete);
        }
    
    
        //update the table of pose
        void EsteamMultiNaviGoalsPanel::updatePoseTable() {
            poseArray_table_->setRowCount(maxNumGoal_);
    //        pose_array_.poses.resize(maxNumGoal_);
            QStringList pose_header;
            pose_header << "x" << "y" << "yaw";
            poseArray_table_->setHorizontalHeaderLabels(pose_header);
            poseArray_table_->show();
        }
    
    
        // call back function for counting goals
        void EsteamMultiNaviGoalsPanel::goalCntCB(const geometry_msgs::PoseStamped::ConstPtr &pose) {
            if (pose_array_.poses.size() < maxNumGoal_) {
                pose_array_.poses.push_back(pose->pose);
                pose_array_.header.frame_id = pose->header.frame_id;
                writePose(pose->pose);
                markPose(pose);
            } else {
                ROS_ERROR("Beyond the maximum number of goals: %d", maxNumGoal_);
            }
        }
    
    
        // write the poses into the table
        void EsteamMultiNaviGoalsPanel::writePose(geometry_msgs::Pose pose) {
    
    
            poseArray_table_->setItem(pose_array_.poses.size() - 1, 0,
                                      new QTableWidgetItem(QString::number(pose.position.x, 'f', 2)));
            poseArray_table_->setItem(pose_array_.poses.size() - 1, 1,
                                      new QTableWidgetItem(QString::number(pose.position.y, 'f', 2)));
            poseArray_table_->setItem(pose_array_.poses.size() - 1, 2,
                                      new QTableWidgetItem(
                                              QString::number(tf::getYaw(pose.orientation) * 180.0 / 3.14, 'f', 2)));
    
    
        }
    
    
        // when setting a Navi Goal, it will set a mark on the map
        void EsteamMultiNaviGoalsPanel::markPose(const geometry_msgs::PoseStamped::ConstPtr &pose) {
            if (ros::ok()) {
                visualization_msgs::Marker arrow;
                visualization_msgs::Marker number;
                arrow.header.frame_id = number.header.frame_id = pose->header.frame_id;
                arrow.ns = "navi_point_arrow";
                number.ns = "navi_point_number";
                arrow.action = number.action = visualization_msgs::Marker::ADD;
                arrow.type = visualization_msgs::Marker::ARROW;
                number.type = visualization_msgs::Marker::TEXT_VIEW_FACING;
                arrow.pose = number.pose = pose->pose;
                number.pose.position.z += 1.0;
                arrow.scale.x = 1.0;
                arrow.scale.y = 0.2;
                number.scale.z = 1.0;
                arrow.color.r = number.color.r = 1.0f;
                arrow.color.g = number.color.g = 0.98f;
                arrow.color.b = number.color.b = 0.80f;
                arrow.color.a = number.color.a = 1.0;
                arrow.id = number.id = pose_array_.poses.size();
                number.text = std::to_string(pose_array_.poses.size());
                marker_pub_.publish(arrow);
                marker_pub_.publish(number);
            }
        }
    
    
        // check whether it is in the cycling situation
        void EsteamMultiNaviGoalsPanel::checkCycle() {
            cycle_ = cycle_checkbox_->isChecked();
            audio_ = audio_checkbox_->isChecked();
            traffic_ = traffic_checkbox_->isChecked();
            env_ = env_checkbox_->isChecked();
        }
    
    
        // start to navigate, and only command the first goal
        void EsteamMultiNaviGoalsPanel::startNavi() {
    
    
            curGoalIdx_ = curGoalIdx_ % pose_array_.poses.size();
            if (!pose_array_.poses.empty() && curGoalIdx_ < maxNumGoal_) {
                geometry_msgs::PoseStamped goal;
                goal.header = pose_array_.header;
                goal.pose = pose_array_.poses.at(curGoalIdx_);
                goal_pub_.publish(goal);
                ROS_INFO("Navi to the Goal%d", curGoalIdx_ + 1);
                poseArray_table_->item(curGoalIdx_, 0)->setBackgroundColor(QColor(255, 69, 0));
                poseArray_table_->item(curGoalIdx_, 1)->setBackgroundColor(QColor(255, 69, 0));
                poseArray_table_->item(curGoalIdx_, 2)->setBackgroundColor(QColor(255, 69, 0));
                curGoalIdx_ += 1;
                permit_ = true;
            } else {
                ROS_ERROR("Something Wrong");
            }
        }
    
    
        // complete the remaining goals
        void EsteamMultiNaviGoalsPanel::completeNavi() {
            if (curGoalIdx_ < pose_array_.poses.size()) {
                geometry_msgs::PoseStamped goal;
                goal.header = pose_array_.header;
                goal.pose = pose_array_.poses.at(curGoalIdx_);
                goal_pub_.publish(goal);
                ROS_INFO("Navi to the Goal%d", curGoalIdx_ + 1);
                poseArray_table_->item(curGoalIdx_, 0)->setBackgroundColor(QColor(255, 69, 0));
                poseArray_table_->item(curGoalIdx_, 1)->setBackgroundColor(QColor(255, 69, 0));
                poseArray_table_->item(curGoalIdx_, 2)->setBackgroundColor(QColor(255, 69, 0));
                curGoalIdx_ += 1;
                permit_ = true;
            } else {
                ROS_ERROR("All goals are completed");
                permit_ = false;
            }
        }
    
    
        // command the goals cyclically
        void EsteamMultiNaviGoalsPanel::cycleNavi() {
            if (permit_) {
                geometry_msgs::PoseStamped goal;
                goal.header = pose_array_.header;
                goal.pose = pose_array_.poses.at(curGoalIdx_ % pose_array_.poses.size());
                goal_pub_.publish(goal);
                ROS_INFO("Navi to the Goal%lu, in the %dth cycle", curGoalIdx_ % pose_array_.poses.size() + 1,
                         cycleCnt_ + 1);
                bool even = ((cycleCnt_ + 1) % 2 != 0);
                QColor color_table;
                if (even) color_table = QColor(255, 69, 0); else color_table = QColor(100, 149, 237);
                poseArray_table_->item(curGoalIdx_ % pose_array_.poses.size(), 0)->setBackgroundColor(color_table);
                poseArray_table_->item(curGoalIdx_ % pose_array_.poses.size(), 1)->setBackgroundColor(color_table);
                poseArray_table_->item(curGoalIdx_ % pose_array_.poses.size(), 2)->setBackgroundColor(color_table);
                curGoalIdx_ += 1;
                cycleCnt_ = curGoalIdx_ / pose_array_.poses.size();
            }
        }
    
    
        // cancel the current command
        void EsteamMultiNaviGoalsPanel::cancelNavi() {
            if (!cur_goalid_.id.empty()) {
                cancel_pub_.publish(cur_goalid_);
                ROS_ERROR("Navigation have been canceled");
            }
        }
    
    
        // call back for listening current state
        void EsteamMultiNaviGoalsPanel::statusCB(const actionlib_msgs::GoalStatusArray::ConstPtr &statuses) {
            bool arrived_pre = arrived_;
            arrived_ = checkGoal(statuses->status_list);
            if (arrived_) { ROS_ERROR("%d,%d", int(arrived_), int(arrived_pre)); }
            if (arrived_ && arrived_ != arrived_pre && ros::ok() && permit_) {
                if (cycle_) cycleNavi();
                else completeNavi();
            }
        }
    
    
        //check the current state of goal
        bool EsteamMultiNaviGoalsPanel::checkGoal(std::vector<actionlib_msgs::GoalStatus> status_list) {
            bool done;
            if (!status_list.empty()) {
                for (auto &i : status_list) {
                    if (i.status == 3) {
                        done = true;
                        ROS_INFO("completed Goal%d", curGoalIdx_);
                    } else if (i.status == 4) {
                        ROS_ERROR("Goal%d is Invalid, Navi to Next Goal%d", curGoalIdx_, curGoalIdx_ + 1);
                        return true;
                    } else if (i.status == 0) {
                        done = true;
                    } else if (i.status == 1) {
                        cur_goalid_ = i.goal_id;
                        done = false;
                    } else done = false;
                }
            } else {
                ROS_INFO("Please input the Navi Goal");
                done = false;
            }
            return done;
        }
    
    
    // spin for subscribing
        void EsteamMultiNaviGoalsPanel::startSpin() {
            if (ros::ok()) {
                ros::spinOnce();
            }
        }
    
    
        // -----------------------------------------------------------------------------------新添加的部分（订阅 /scan的处理）----------------------------------------------------------------------------------------
            // 用于检测障碍物，如果检测到障碍物则改变障碍物标志位为true，否则为false
        void EsteamMultiNaviGoalsPanel::registerScan(const sensor_msgs::LaserScan::ConstPtr &scan_msg) {
            // 提取激光雷达扫描的最小角度（通常是负值）
            const float angle_min = scan_msg->angle_min;
            // 提取激光雷达每个扫描角度的增量
            const float angle_increment = scan_msg->angle_increment;
            // 提取激光雷达扫描的距离数据
            const std::vector<float> ranges = scan_msg->ranges;
    
    
            // 设置最大检测距离（单位：米）
            const float max_distance = 0.4;
            // 设置检测角度范围：正前方左右各40度，转换为弧度
            const float detection_angle = 20.0 * M_PI / 180.0; 
            // 获取扫描数据的点数
            const int range_size = ranges.size();
            // 默认没有检测到障碍物
            bool detected = false;
    
    
            // 遍历每个扫描点
            for (int i = 0; i < range_size; ++i) {
                // 计算当前扫描点的角度
                const float angle = angle_min + i * angle_increment;
                // 检查当前点的角度是否在正前方左右各40度的范围内
                if (angle >= -detection_angle && angle <= detection_angle) {
                    // 获取当前点的距离
                    const float distance = ranges[i];
    
    
                    // 检查距离是否小于最大检测距离
                    if (distance < max_distance) {
                        // 如果距离小于最大检测距离，设置检测到障碍物标志
                        detected = true;
                        // 输出障碍物信息
                        ROS_INFO("在距离：%.2f m，角度：%.2f °检测到障碍物", distance, angle * 180.0 / M_PI);
                        // 如果检测到一个障碍物，可以停止进一步的检查
                        break; 
                    }
                }
            }
            // 根据检测结果更新全局障碍物标志位
            obstacle_ = detected;
        }
        // -----------------------------------------------------------------------------------新添加的部分（订阅 /scan的处理）----------------------------------------------------------------------------------------
    
    
        // -----------------------------------------------------------------------------------新添加的部分（处理定时器触发的音频脚本、交通灯控制）----------------------------------------------------------       
        // 创建一个新的槽函数，用于定时器触发
        void EsteamMultiNaviGoalsPanel::triggerAudioTraffic() {
            checkVariableChanges();  // 定时器触发调用 checkVariableChanges()  在第一位，用于更新 trafficsure_ 标志，trafficsure_ 标志用于判断是否需要交通灯脚本
            executeAudio();  // 定时器触发调用 executeAudio()
            executeTrafficLight();  // 定时器触发调用 executeTrafficLight()
            executeEnv();  // 定时器触发调用 executeEnv()
        }
    
    
        void EsteamMultiNaviGoalsPanel::checkVariableChanges() {
            static bool lastTraffic = traffic_;
            static bool lastPermit = permit_;
            static bool lastObstacle = obstacle_;
    
    
            // 如果三个变量中有任何一个发生变化
            if (traffic_ != lastTraffic || permit_ != lastPermit || obstacle_ != lastObstacle) {
                trafficsure_ = true;  // 更新 trafficsure_ 标志
    
    
                // 记录当前状态
                lastTraffic = traffic_;
                lastPermit = permit_;
                lastObstacle = obstacle_;
            }
        }
    
    
        // 用于启动音频脚本文件
        void EsteamMultiNaviGoalsPanel::executeAudio() { 
            // 判断是否启动了音频按钮，如果启动了则执行下面语句，若未启动则不执行
            if (audio_ && permit_) {
                // 启动脚本
                if (audioProcess_->state() == QProcess::NotRunning) {
                    audioProcess_->start(audio_script_path);
                    if (!audioProcess_->waitForStarted()) {
                        // ROS_ERROR("Failed to start the script.");
                        qDebug() << ("---------启动音频脚本失败_qDebug");
                    } 
                    else {
                        // ROS_INFO("Script started successfully.");
                        qDebug() << ("---------音频脚本启动成功_qDebug");
                    }
                }
                else {
                    // ROS_INFO("Script is already running.");
                    qDebug() << ("---------音频脚本正在运行中_qDebug");
                }
            } 
            else {
                // 停止脚本
                if (audioProcess_->state() == QProcess::Running) {
                    audioProcess_->terminate();
                    audioProcess_->waitForFinished();
                    // ROS_INFO("Script terminated successfully.");
                    qDebug() << ("---------音频脚本已成功终止_qDebug");
                } 
                else {
                    // ROS_INFO("No script is running to terminate.");
                    qDebug() << ("---------没有音频脚本正在运行以终止_qDebug");
                }
            }
        }
    
    
        // 用于启动交通灯脚本文件
        void EsteamMultiNaviGoalsPanel::executeTrafficLight() {
            // 固定脚本路径为内参
            QStringList traffic_args;
            // 如果traffic_、permit_、obstacle_三个条件任意一个变化，则执行下面语句
            if (trafficsure_)
            {
                trafficsure_ = false;  // 重置标志位，防止重复执行
    
    
                // 确保进程已停止
                if (trafficProcess_->state() == QProcess::Running) {
                    trafficProcess_->terminate();  // 尝试优雅地停止进程
                    if (!trafficProcess_->waitForFinished(100)) {  // 等待最多0.1秒
                        trafficProcess_->kill();  // 强制停止进程
                    }
                }
    
    
                // 根据不同的条件设置参数并执行
                if (!traffic_) {
                    traffic_args << "G-1!" << "F1-1!" << "F2-1!" << "F3-1!";   // 绿灭、黄灭、红灭
                    qDebug() << "---------交通灯标志没有开启";
                    executeTrafficScript(ser_edit_script_path, traffic_args);  //  执行交通灯脚本
                } 
    
    
                else if (traffic_ && !permit_ && !obstacle_) {
                    traffic_args << "G-1!" << "F1-1!" << "F2-1!" << "F3-0!";  // 红灭、黄灭、绿亮
                    qDebug() << "---------交通灯标志开启，没有在导航中，没有检测到障碍物";
                    executeTrafficScript(ser_edit_script_path, traffic_args);  //  执行交通灯脚本
                    traffic_args.clear();
                } 
     
    
                else if (traffic_ && !permit_ && obstacle_) {
                    traffic_args << "G-0!" << "F1-0!" << "F2-1!" << "F3-1!";  // 红亮、黄灭、绿灭
                    qDebug() << "---------交通灯标志开启，没有在导航中，检测到障碍物";
                    executeTrafficScript(ser_edit_script_path, traffic_args);  // 执行交通灯脚本
                    traffic_args.clear();
                } 
     
    
                else if (traffic_ && permit_ && !obstacle_) {
                    traffic_args << "G-1!" << "F1-1!" << "F2-0!" << "F3-1!";   // 红灭、黄亮、绿灭
                    qDebug() << "---------交通灯标志开启，在导航中，没有检测到障碍物";
                    executeTrafficScript(ser_edit_script_path, traffic_args);   //执行交通灯脚本
                    traffic_args.clear();
    
    
                } 
    
    
                else if (traffic_ && permit_ && obstacle_) {
                    traffic_args << "G-0!" << "F1-0!" << "F2-1!" << "F3-1!";  // 红亮、黄灭、绿灭
                    qDebug() << "---------交通灯标志开启，在导航中，检测到障碍物";
                    executeTrafficScript(ser_edit_script_path, traffic_args);  //执行交通灯脚本
                    traffic_args.clear();
                }
            }
        }
    
    
        // 执行交通灯脚本
        void EsteamMultiNaviGoalsPanel::executeTrafficScript(const QString &scriptPath, const QStringList &args) {
            // 启动脚本并传入参数
            trafficProcess_->start(scriptPath, args);
    
    
            if (!trafficProcess_->waitForStarted()) {
                // ROS_ERROR("启动交通灯脚本失败。");
                return; // 如果启动失败，则不进行后续处理
            }
    
    
            if (!trafficProcess_->waitForFinished()) {
                // ROS_ERROR("交通灯脚本未成功完成。");
            } else {
                // ROS_INFO("交通灯脚本已成功完成。");
            }
        }
    
    
        // 用于启动环境监测脚本文件
        void EsteamMultiNaviGoalsPanel::executeEnv() {
            // 固定脚本路径为内参
            QStringList env_args;
    
    
            // 确保进程已停止
            if (envProcess_->state() == QProcess::Running) {
                envProcess_->terminate();  // 尝试优雅地停止进程
                if (!envProcess_->waitForFinished(100)) {  // 等待最多0.1秒
                    envProcess_->kill();  // 强制停止进程
                }
            }
    
    
            // 判断是否启动了环境监测按钮，如果启动了则执行下面语句，若未启动则不执行
            if (env_ ) {
                // 启动环境监测
                env_args << "E-03!" << "E-13!" << "E-04!" << "E-14!" << "A-1!" << "B-1!" << "C-1!";  //3、4号温湿度，烟雾，酒精，空气
                executeEnvScript(ser_edit_script_path, env_args);  // 执行脚本
                env_args.clear();
            }
            else {
                // 停止环境监测
                env_args << "E-03@" << "E-13@" << "E-04@"  << "E-14@" << "A-1@" << "B-1@" << "C-1@" ;   //3、4号温湿度，烟雾，酒精，空气
                executeEnvScript(ser_edit_script_path, env_args);  // 执行脚本
                env_args.clear();
            }
    
    
        }
    
    
        // 启动环境监测脚本的辅助函数
        void EsteamMultiNaviGoalsPanel::executeEnvScript(const QString& scriptPath, const QStringList& args) {
            // 启动脚本并传入参数
            envProcess_->start(scriptPath, args);
    
    
            if (!envProcess_->waitForStarted()) {
                // ROS_ERROR("启动交通灯脚本失败。");
                return; // 如果启动失败，则不进行后续处理
            }
    
    
            if (!envProcess_->waitForFinished()) {
                // ROS_ERROR("交通灯脚本未成功完成。");
            } else {
                // ROS_INFO("交通灯脚本已成功完成。");
            }
        }
    
    
        // -----------------------------------------------------------------------------------新添加的部分（处理定时器触发的音频脚本、交通灯控制）----------------------------------------------------------       
    
    
    } // end namespace navi-multi-goals-pub-rviz-plugin
    
    
    // 声明此类是一个rviz的插件
    
    
    #include <pluginlib/class_list_macros.h>
    
    
    PLUGINLIB_EXPORT_CLASS(esteam_multi_navi_plugin::EsteamMultiNaviGoalsPanel, rviz::Panel)
        
    ```

  - **<font style="color:#68be8d;">multi_navi_goal_panel.h</font>**

    ```h
    #ifndef MULTI_NAVI_GOAL_PANEL_H
    #define MULTI_NAVI_GOAL_PANEL_H
    
    
    #include <string>
    
    #include <ros/ros.h>
    #include <ros/console.h>
    
    #include <rviz/panel.h>
    
    #include <QProcess>
    #include <QPushButton>
    #include <QTableWidget>
    #include <QCheckBox>
    
    #include <visualization_msgs/Marker.h>
    #include <geometry_msgs/PoseArray.h>
    #include <geometry_msgs/Point.h>
    #include <geometry_msgs/PoseStamped.h>
    #include <std_msgs/String.h>
    #include <actionlib_msgs/GoalStatus.h>
    #include <actionlib_msgs/GoalStatusArray.h>
    #include <tf/transform_datatypes.h>
    #include <sensor_msgs/LaserScan.h>
    
    namespace esteam_multi_navi_plugin {
    
    
    
        class EsteamMultiNaviGoalsPanel : public rviz::Panel {
        Q_OBJECT
        public:
            explicit EsteamMultiNaviGoalsPanel(QWidget *parent = 0);
            virtual ~EsteamMultiNaviGoalsPanel();  // 显式声明虚析构函数
    
    
            // 声明静态常量成员
            static const QString audio_script_path;  // 音乐播放脚本路径
            static const QString ser_edit_script_path;  // 串口协议修改脚本路径
    
    
        public Q_SLOTS:
    
    
            void setMaxNumGoal(const QString &maxNumGoal);
    
    
            void writePose(geometry_msgs::Pose pose);
            void markPose(const geometry_msgs::PoseStamped::ConstPtr &pose);
            void deleteMark();
    
    
            void registerScan(const sensor_msgs::LaserScan::ConstPtr &scan_msg);
            void triggerAudioTraffic();  // 声明 triggerAudioTraffic 函数
            void checkVariableChanges();  // 声明 checkVariableChanges 函数
            void executeAudio();  // 声明 executeAudio 函数
            void executeTrafficLight();  // 声明 executeTrafficLight 函数
            void executeEnv();  // 声明 executeEnv 函数
    
    
            void executeTrafficScript(const QString &scriptPath, const QStringList &args);  // 声明 executeTrafficScript 函数
            void executeEnvScript(const QString &scriptPath, const QStringList &args);  // 声明 executeEnvScript 函数
    
    
            void testButton();                  // test button
            void test1Button();                  // test button1
            void test2Button();                  // test button2
            void test3Button();                  // test button3
    
    
        protected Q_SLOTS:
    
    
            void updateMaxNumGoal();             // update max number of goal
            void initPoseTable();               // initialize the pose table
    
    
            void updatePoseTable();             // update the pose table
            void startNavi();                   // start navigate for the first pose
            void cancelNavi();
    
    
            void goalCntCB(const geometry_msgs::PoseStamped::ConstPtr &pose);  //goal count sub callback function
    
    
            void statusCB(const actionlib_msgs::GoalStatusArray::ConstPtr &statuses); //status sub callback function
    
    
            void checkCycle();
    
    
            void completeNavi();               //after the first pose, continue to navigate the rest of poses
            void cycleNavi();
    
    
            bool checkGoal(std::vector<actionlib_msgs::GoalStatus> status_list);  // check whether arrived the goal
    
    
            static void startSpin(); // spin for sub
        protected:
            QLineEdit *output_maxNumGoal_editor_;
            QPushButton *output_maxNumGoal_button_, *output_reset_button_, *output_startNavi_button_, *output_cancel_button_;
            QPushButton  *output_test_button_,*output_test1_button_,*output_test2_button_,*output_test3_button_;
    
    
            QTableWidget *poseArray_table_;
            QCheckBox *cycle_checkbox_;
            QCheckBox *audio_checkbox_;
            QCheckBox *traffic_checkbox_;
            QCheckBox *env_checkbox_;
    
    
            QString output_maxNumGoal_;
    
    
            // The ROS node handle.
            ros::NodeHandle nh_;
            ros::Publisher goal_pub_, cancel_pub_, marker_pub_;
            ros::Subscriber goal_sub_, status_sub_,laser_sub_;
    
    
            int maxNumGoal_;
            int curGoalIdx_ = 0, cycleCnt_ = 0;
            //  新添加 变量 音频、交通灯、障碍物检测 标志位
            bool permit_ = false, cycle_ = false, audio_ = false,traffic_ = false, arrived_ = false,obstacle_ = false,trafficsure_ = false,env_ = false;
            geometry_msgs::PoseArray pose_array_;
    
    
            actionlib_msgs::GoalID cur_goalid_;
    
    
           // 添加两个 QProcess 对象作为成员变量
            QProcess *audioProcess_, *trafficProcess_, *envProcess_;
    
    
        };
    
    
    } // end namespace navi-multi-goals-pub-rviz-plugin
    
    
    #endif // MULTI_NAVI_GOAL_PANEL_H
    ```

## i. 其他

### i. 单独依赖安装

1. **键盘控制**

`sudo apt-get install ros-melodic-teleop-twist-keyboard`

2. **tf2 消息包**

`sudo apt-get install ros-melodic-tf2-sensor-msgs`

3. **rviz中imu-plugin组件**

`sudo apt-get install ros-melodic-imu-tools ros-melodic-rviz-imu-plugin`

4. **map服务**

`sudo apt-get install ros-melodic-map-server`

5. **导航相关**

`sudo apt-get install ros-melodic-navigation`

`sudo apt-get install ros-melodic-teb-local-planner`

### ii. 没说明的包

- **autolabor_description** 改了改模型文件		

  `autolabor_description包：` [http://www.autolabor.com.cn/download](http://www.autolabor.com.cn/download) 选择Autolabor OS系统镜像中

- **autolabor_keyboard_control** 没有使用	

  `autolabor_keyboard_control：`[http://www.autolabor.com.cn/download](http://www.autolabor.com.cn/download)  选择 Autolabor ROS键盘控制包。

- **cartographer_initialpose** 使用了，但是用的地方很少，只在3D导航重定位时，对应的launch文件调用了

  `cartographer_initialpose ：` [http://www.autolabor.com.cn/download](http://www.autolabor.com.cn/download) 选择 Autolabor OS 系统镜像中。

- **rviz_keyboard_twist** 使用了，主要是在rviZ中，使用键盘建图，省去了打开`rosrun teleop_twist_keyboard teleop_twist_keyboard.py`。

  `rviz_keyboard_twist ：` [http://www.autolabor.com.cn/download](http://www.autolabor.com.cn/download) 选择 Autolabor OS 系统镜像中。

![img](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728155459608.webp)



---



# 2. esteam_ws

**打开终端，输入以下命令创建工作空间**

```bash
mkdir -p esteam_ws/src
cd esteam_ws/src/ && catkin_init_workspace 
cd .. && catkin_make
echo "source ~/esteam_ws/devel/setup.bash" >> ~/.bashrc
```

`这个工作空间作为最基本的工作空间，以后所有的驱动包、建图包、导航包等等，只要与导航相关的，都放在这个包中。`

## src 目录规划

规划_**src**_目录下文件夹（标红为**功能包**）

+ _**src/**_
  - `autoe_config` (2D、3D 建图、导航的所有配置文件以及建图的地图保存处)
  - `autoe_navigation`(2D、3D 导航的launch文件启动处)
  - **autoe_pack/** (3D 建图、导航配置包)
  - **autoe_ros/** (底盘驱动、底盘模型、底盘总控制)
    * `autoe_bringup` (用于统一启动底盘与所有传感器)
    * `autolabor_description` （底盘模型）
    * `autolabor_keyboard_control` （底盘键盘控制）
    * `autolabor_pro1_driver` （底盘驱动）
  - `autoe_slam`(2D、3D 建图的launch文件启动处)
  - **autoe_tools/** (传感器、转换信号等等)
    * `rslidar_sdk` (速腾3D激光雷达驱动包-RSHELIOS_16P)
    * `rs_to_velodyne` (速腾3D激光雷达信号转换包-velodyne)
    * `pointcloud_to_laserscan` (3D Point数据转换为2D Scan数据)
    * `wit_ros_imu` (IMU ROS驱动包)
    * `cartographer_initialpose` (cartographer 初始定位补丁)
    * `esteam_multi_navi_plugin`(多点导航Rviz插件包)
    * `rviz_keyboard_twist` (键盘控制Rviz插件包-W/S/A/D控制)

## a. autoe_bringup 

`catkin_create_pkg autoe_bringup roscpp rospy std_msgs`

用于存储2D、3D建图的启动文件功能包。用于存储底盘启动，各种传感器启动文件的功能包。包下面有各种传感器的launch,以及总启动的launch文件

+ `autoe_bringup/`
  - **launch/**
    * **include/**
      + **<font style="color:#f19072;">autolabor_driver.launch（底盘驱动）</font>**
      + **<font style="color:#f19072;">camera.launch（摄像头节点）</font>**
      + **<font style="color:#f19072;">imu.launch（ah100b_IMU）</font>**
      + **<font style="color:#f19072;">rslidar.launch（速腾3D激光雷达）</font>**
    * **<font style="color:#f19072;">robot.launch（总启动）</font>**
  - **scripts/**
    * **<font style="color:#68be8d;">pub_usbcam.py（摄像头节点发布）</font>**

**`启动命令示例`**

```bash
# 1.启动底盘、雷达、IMU
roslaunch autoe_bringup robot.launch

# 2.启动底盘、雷达、IMU、摄像头
roslaunch autoe_bringup robot.launch use_cam:=true

# 3.启动底盘、雷达、IMU、摄像头、point转scan
roslaunch autoe_bringup robot.launch use_cam:=true change_lidar:=rs2scan
```

## b. autoe_slam

`catkin_create_pkg autoe_slam roscpp rospy std_msgs`

用于存储2D、3D建图的启动与地图的保存功能包。

+ `autoe_slam`
  - **launch/**
    * **2d/**
      + **include/** (建图使用的工具类型)
        - **<font style="color:#efab93;">2d_cartographer_lidar_imu.launch(雷达+IMU)</font>**
        - **<font style="color:#efab93;">2d_cartographer_lidar_odom_imu.launch(雷达+IMU+里程计)</font>**
        - **<font style="color:#efab93;">2d_cartographer_lidar_odom.launch(雷达+里程计)</font>**
      + **<font style="color:#efab93;">2d_cartographer.launch(2D建图)</font>**
    * **3d/**
      + **include/** (建图使用的工具类型)
        - **<font style="color:#efab93;">3d_cartographer_lidar_imu.launch(雷达+IMU)</font>**
        - **<font style="color:#efab93;">3d_cartographer_lidar_odom_imu.launch(雷达+IMU+里程计)</font>**
      + **<font style="color:#efab93;">3d_cartographer.launch(3D建图)</font>**
    * **<font style="color:#efab93;">save_pb_pgm.launch(启动save_pb_pgm.sh)</font>**
    * **<font style="color:#efab93;">save_pb.launch(启动save_pb.sh)</font>**
    * **<font style="color:#efab93;">save_pgm.launch(启动save_pgm.sh)</font>**
  - **scripts/** (存放保存地图操作的脚本文件)
    * **<font style="color:#68be8d;">save_pb_pgm.sh(保存为pgm与pbstream)</font>**
    * **<font style="color:#68be8d;">save_pb.sh(保存为pbstream)</font>**
    * **<font style="color:#68be8d;">save_pgm.sh(保存或读取pgm)</font>**
  - CMakeLists.txt
  - package.xml

**`启动命令示例`**

```bash
# 1.2D建图
# 1-1 默认使用 雷达+IMU 建图
roslaunch autoe_slam 2d_cartographer.launch

# 1-2 使用 雷达+里程计
roslaunch autoe_slam 2d_cartographer.launch slam_mode:=m2

# 1-3 使用 雷达+IMU+里程计
roslaunch autoe_slam 2d_cartographer.launch slam_mode:=m3

# 2.3D建图
#2-1 默认使用 雷达+IMU 建图
roslaunch autoe_slam 3d_cartographer.launch

# 2-2 使用 雷达+IMU+里程计
roslaunch autoe_slam 3d_cartographer.launch slam_mode:=m2
```

## c. autoe_navigation

`catkin_create_pkg autoe_navigation roscpp rospy std_msgs`



用于存储2D、3D导航的启动文件功能包。

+ `autoe_navigation`
  - **launch/**
    * **<font style="color:#efab93;">2d_cartographer.launch(2D导航)</font>**
    * **<font style="color:#efab93;">3d_cartographer.launch(3D导航)</font>**
  - CMakeLists.txt
  - package.xml



**`启动命令示例`**

```bash
# 1.2D导航
#地图默认为 map
roslaunch autoe_navigation 2d_cartographer.launch

# 可以自定义地图名称(前提得有)
roslaunch autoe_navigation 2d_cartographer.launch map_name:=TIANKAI_409

# 2.3D导航
# 地图默认为 map
roslaunch autoe_navigation 3d_cartographer.launch

# 可以自定义地图名称(前提得有)
roslaunch autoe_navigation 3d_cartographer.launch map_name:=TIANKAI_409
```

## d. autoe_config 包

`catkin_create_pkg autoe_config roscpp rospy std_msgs`

+ `autoe_config`
  - **config/** (谷歌导航的lua配置文件)
  - **launch/** (包括建图与导航的Rviz启动文件与一键启动的launch文件)
  - **maps/** (建图地图存放处、导航地图读取处)
  - **params/** (move_base 导航配置文件)
  - **rviz/** (建图与导航的Rviz)
  - **scripts/** (一键启动的脚本文件)
  - CMakeLists.txt
  - package.xml

这个文件的东西大多是一些配置文件，还有后面添加的桌面的一键建图、导航等等的配置文件，比较杂乱，这里放到同级目录下，以后想看或者以后可以直接放到Github或Gitee上。

**`启动命令示例`**

```bash
# 1.2D rviz
# 1-1 默认是启动 2D建图rviz的配置文件
roslaunch autoe_config 2d_rviz.launch

# 1-2 启动 2D导航rviz 的配置文件
roslaunch autoe_config 2d_rviz.launch rviz:=s2

# 1-3 启动 2D多点导航rviz 的配置文件
roslaunch autoe_config 2d_rviz.launch rviz:=s3

# 2.3D rviz
# 2-1 默认是启动 3D建图rviz 的配置文件
roslaunch autoe_config 3d_rviz.launch

# 2-2 启动 3D导航rviz 的配置文件
roslaunch autoe_config 3d_rviz.launch rviz:=s2

# 2-3 启动 3D多点导航rviz 的配置文件
roslaunch autoe_config 3d_rviz.launch rviz:=s3
```

还有一键启动的相关文件，看一看对应launch文件与scripts文件应该就可以了。

![img](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728144252319.gif)

# ~~3. Github(暂时作废)~~

完整代码功能包放到了Github

分为三个分支

+ **<font style="background-color:#f3bb2f;">main</font>**
+ `**BumblebeeChassis**`
+ `**XiaobaiChassis**`

## a. 大黄蜂底盘(BumblebeeChassis)

git clone -b BumblebeeChassis [https://github.com/plx00/esteam_ws.git](https://github.com/plx00/esteam_ws.git)



## b. 脚本

写了个脚本自动拉取

```bash
#!/bin/bash

# 检查是否提供了至少一个参数
if [ $# -lt 1 ]; then
    echo "Usage: $0 <repository-url> [branch-name]"
    exit 1
fi

# 参数
REPO_URL=$1
BRANCH=${2:-default}  # 如果第二个参数没有提供，使用默认分支
USERNAME="plx00" # GitHub用户名
PASSWORD="ghp_Y11jDngwF9dTnOApV

BgjM8NqP7tlp425zz6B" # GitHub个人访问令牌或密码

# 如果提供了分支名，则克隆指定分支；否则，克隆默认分支
if [ "$BRANCH" != "default" ]; then
    git clone --single-branch -b "$BRANCH" "https://$USERNAME:$PASSWORD@${REPO_URL#https://}"
else
    git clone --single-branch "https://$USERNAME:$PASSWORD@${REPO_URL#https://}"
fi
```

自己用的，不放在**`系统设置`**中,使用的话，·`脚本名称 + git地址 + 分支名称(可选，默认为main)`·

---

# 4. 备份系统

为了防止系统再次出现意外，这里会进行系统备份(应该说的是 M.2硬盘备份，因为系统在硬盘中)



----

# 5. Qt上位机



----

# 附录一 | 系统设置

系统设置不分先后，但是有的不设置会影响功能包使用

## a. 脚本

系统运行会用到各种脚本文件来运行，下面的是怎么配置，文件统一放到主目录下  `.econfig`文件夹下

创建文件夹，并将`.econfig`文件夹环境加到`.bashrc` 文件中

```bash
mkdir .econfig

echo '# .econfig 文件夹声明' >> ~/.bashrc && source ~/.bashrc
echo 'export PATH=$PATH:$HOME/.econfig' >> ~/.bashrc && source ~/.bashrc
```

### i. Nomachine 界面调整

#### 1. 添加脚本

打开终端，输入命令

```bash
cat <<EOL > ~/.econfig/NomachineDisplay
#!/bin/bash

gnome-terminal -x bash -c "xrandr --fb 1280x720"&

sleep 1
EOL

chmod +x ~/.econfig/NomachineDisplay
```

#### 2. 开机自启动

打开终端，输入命令

`gnome-session-properties`

在弹出窗口下，选择 **add**（添加）,依据提示添加自启动选项的**名字**、**脚本路径**、**说明**，最后点击 **Save**（保存）即可。

![image-20260728161521622](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728161522014.webp)

### ii. 音频文件播放

#### 1. 添加脚本

打开终端，输入命令，创建子脚本`play-audio`

```bash
cat <<EOL > ~/.econfig/play-audio
#!/bin/bash

# 默认音频文件路径
default_audio_file="\$HOME/.econfig/mp3/123.wav"

# 使用提供的音频文件路径参数，如果没有提供，则使用默认路径
audio_file=\${1:-\$default_audio_file}

# 初始化播放计数器
count=0

# 循环播放音频，每 15 秒播放一次
while true; do
    # 播放计数器累加
    count=\$((count + 1))

    # 提示即将播放音频和当前播放次数
    echo "第 \$count 次播放音频文件: \$audio_file"

    # 播放音频
    aplay "\$audio_file"

    # 提示等待 15 秒
    echo "等待 15 秒后再次播放..."

    # 等待 15 秒
    sleep 15
done
EOL

chmod +x ~/.econfig/play-audio
```

创建控制脚本`audio-control` （最终没有使用）

```bash
cat <<EOL > ~/.econfig/audio-control
#!/bin/bash

# 获取当前脚本所在的目录
script_dir=\$(dirname "\$0")

# 定义锁文件路径，用于控制播放状态
lock_file="/tmp/audio_playing.lock"
pid_file="/tmp/audio_playing.pid"

# 如果锁文件不存在，则启动播放脚本
if [ ! -e "\$lock_file" ]; then
    # 创建锁文件并启动子脚本
    touch "\$lock_file"
    echo "音频播放开始..."

    # 启动 play_audio.sh 并保存它的 PID 到文件
    "\$script_dir/play-audio" &  # 后台运行子脚本
    echo \$! > "\$pid_file"  # 保存子脚本的 PID
else
    # 如果锁文件存在，则终止子脚本并退出
    if [ -e "\$pid_file" ]; then
        pid=\$(cat "\$pid_file")
        echo "停止音频播放，PID: \$pid"

        # 杀死子脚本进程
        kill "\$pid"

        # 删除 PID 文件
        rm "\$pid_file"
    fi

    # 删除锁文件
    rm "\$lock_file"
    echo "音频播放已停止并退出。"
fi
EOL

chmod +x ~/.econfig/audio-control
```



#### 2. 使用示例

```bash
# 参数：音频文件地址
play-audio
play-audio /home/esteam/123.mp3

# 控制打开默认音频
audio-control

# 控制关闭默认音频
audio-control
```

### iii. 倒计时 工具

#### 1. 添加脚本

`time-countdown`

```bash
cat <<EOL > ~/.econfig/time-countdown
#!/bin/bash

# 默认时间为120分钟
default_minutes=120

# 使用提供的时间参数，如果没有提供，则使用默认值
minutes=\${1:-\$default_minutes}

# 将分钟转换为秒
secs=\$((\$minutes * 60))

while [ \$secs -gt 0 ]; do
   echo -ne "Time remaining: \$(date -u -d @\${secs} +%H:%M:%S)\r"
   sleep 1
   : \$((secs--))
done

echo "Time's up!"
EOL

chmod +x ~/.econfig/time-countdown
```

#### 2. 使用示例

```bash
# 参数：数字
time-countdown
time-countdown 30
```

### ~~iv. GPIO 控制~~

`2024-10-17 最后没有使用`

> [!TIP]
>
> `这个在后续中使用了驱动板来进行控制器，但可以使用这个GPIO控制,控制前提硬件连接好。`



#### 1. 添加脚本

`traffic-light`

```bash
cat <<EOL > ~/.econfig/traffic-light
#!/bin/bash

# 确保传递了至少一个引脚号和状态
if [ "\$#" -lt 1 ]; then
    echo "错误: 需要至少一个引脚号和状态。"
    exit 1
fi

# 创建一个 Python 脚本文件
PYTHON_SCRIPT=\$(mktemp /tmp/gpio_control.XXXXXX.py)

# 写入 Python 代码到文件
cat <<EOF > "\$PYTHON_SCRIPT"
import Jetson.GPIO as GPIO
import sys
import time

def control_gpios(pins_states):
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BOARD)

    for pin, state in pins_states:
        try:
            pin = int(pin)  # 确保 pin 是整数
            GPIO.setup(pin, GPIO.OUT)
            if state == "1":
                GPIO.output(pin, GPIO.HIGH)
                print(f"引脚 {pin} 设置为高电平")
                time.sleep(0.01)  # 延时 0.01 秒
            elif state == "0":
                GPIO.output(pin, GPIO.LOW)
                print(f"引脚 {pin} 设置为低电平")
                time.sleep(0.01)  # 延时 0.01 秒
            else:
                print(f"引脚 {pin} 状态无效: {state}")
        except ValueError as e:
            print(f"引脚 {pin} 无效: {e}")
        except Exception as e:
            print(f"操作引脚 {pin} 时发生错误: {e}")


if __name__ == "__main__":
    # 从命令行参数获取引脚号和状态
    args = sys.argv[1:]
    pins_states = [tuple(arg.split('-')) for arg in args]
    control_gpios(pins_states)
EOF

# 运行 Python 脚本
python3 "\$PYTHON_SCRIPT" "\$@"

# 删除 Python 脚本文件
rm "\$PYTHON_SCRIPT"

EOL

# 赋予脚本执行权限
chmod +x ~/.econfig/traffic-light
```

#### 2. 使用示例

```bash
# 控制GPIO引脚
traffic-light 11-0 13-0 15-0 7-0
```

### ~~v. GPIO控制测试~~

`2024-10-17 最后没有使用`

> [!TIP]
>
> `这个在后续中使用了驱动板来进行控制器，但可以使用这个GPIO控制，控制前提硬件连接好。`



一共两个脚本，第一个使用终端工具模拟交通灯(traffic-sim-light)，第二个控制这个模拟交通灯(traffic-sim-contral)，用于测试。只选择了三个状态，并且依据引脚设置，分别是 11(绿灯)，13(黄灯)，15(红灯)。

#### 1. 添加脚本

`traffic-sim-light`

```bash
cat <<EOL > ~/.econfig/traffic-sim-light
#!/bin/bash

# 状态文件
STATE_FILE="/tmp/traffic_light_state.txt"

# 初始化状态为 "off"
echo "red=off" > \$STATE_FILE
echo "yellow=off" >> \$STATE_FILE
echo "green=off" >> \$STATE_FILE

# 创建一个新的终端窗口来显示实时更新
gnome-terminal -- bash -c '
while true; do
    # 读取状态
    source /tmp/traffic_light_state.txt

    # 清除终端屏幕
    clear

    # 打印标题
    echo "交通灯状态"

    # 定义 6x6 方块字符
    BLOCK_ON="█"
    BLOCK_OFF="░"
    WHITE="░"

    # 红灯状态图案
    if [ "\$red" = "on" ]; then
        RED_PATTERN="\e[38;2;255;0;0m\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\e[0m"
    else
        RED_PATTERN="\e[37m\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\e[0m"
    fi

    # 黄灯状态图案
    if [ "\$yellow" = "on" ]; then
        YELLOW_PATTERN="\e[38;2;255;255;0m\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\e[0m"
    else
        YELLOW_PATTERN="\e[37m\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\e[0m"
    fi

    # 绿灯状态图案
    if [ "\$green" = "on" ]; then
        GREEN_PATTERN="\e[38;2;0;255;0m\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\n\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\$BLOCK_ON\e[0m"
    else
        GREEN_PATTERN="\e[37m\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\n\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\$WHITE\e[0m"
    fi

    # 打印状态图案
    echo -e "红灯:\n\$RED_PATTERN"
    echo -e "黄灯:\n\$YELLOW_PATTERN"
    echo -e "绿灯:\n\$GREEN_PATTERN"

    # 打印分隔线
    echo "=============="

    # 等待 0.4 秒再更新
    sleep 0.4
done
'

EOL

# 赋予脚本执行权限
chmod +x ~/.econfig/traffic-sim-light
```

`traffic-sim-contral`

```bash
cat <<EOL > ~/.econfig/traffic-sim-contral
#!/bin/bash

# 状态文件
STATE_FILE="/tmp/traffic_light_state.txt"

# 检查是否至少有一个输入参数
if [ \$# -lt 1 ]; then
    echo "用法: \$0 <灯光状态1> [<灯光状态2> ...]"
    echo "每个参数应为 <代码>-<状态>，例如 11-0、13-1、15-0。"
    exit 1
fi

# 解析输入参数
for param in "\$@"; do
    CODE=\$(echo \$param | cut -d'-' -f1)
    STATE=\$(echo \$param | cut -d'-' -f2)

    # 将状态值转换为 on 或 off
    if [ "\$STATE" == "0" ]; then
        STATUS="on"
    elif [ "\$STATE" == "1" ]; then
        STATUS="off"
    else
        echo "错误: 状态必须是 0 或 1。"
        exit 1
    fi

    # 更新状态文件
    case "\$CODE" in
        11)
            sed -i "s/^green=.*/green=\${STATUS}/" \$STATE_FILE
            ;;
        13)
            sed -i "s/^yellow=.*/yellow=\${STATUS}/" \$STATE_FILE
            ;;
        15)
            sed -i "s/^red=.*/red=\${STATUS}/" \$STATE_FILE
            ;;
        *)
            echo "错误: 无效的代码 \$CODE。有效的代码是 11（绿灯）、13（黄灯）、15（红灯）。"
            exit 1
            ;;
    esac
done

echo "交通灯状态已更新："
grep -E 'green|yellow|red' \$STATE_FILE | sed -e 's/^green/绿灯/; s/^yellow/黄灯/; s/^red/红灯/'

EOL

# 赋予脚本执行权限
chmod +x ~/.econfig/traffic-sim-contral
```

#### 2. 使用示例

```bash
# 先打开终端工具模拟交通灯
traffic-light-sim

# 在进行控制
traffic-light-contral 11-0 13-0 15-0
```

### vi. UART 通信-引脚

`因为改用了驱动板来进行传感器的控制与检测，所以使用了串口进行通信控制与接受返回的数据。`

最后又修改了`esteam_multi_navi_plugin`功能包，进行适配，呈现效果如下

![image-20260728162111219](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728162112129.webp)



#### 1. 添加脚本

`ser-init`

可以打开串口连接然后处理数据与发送对应文件中串口数据,太长了！！

**<font style="color:#68be8d;">ser-init 内容</font>**

```bash
cat <<EOL > ~/.econfig/ser-init
#!/bin/bash

export PATH=$PATH:$HOME/.econfig

# 状态文件路径
STATE_FILE="/tmp/sendcom.txt"

# 初始化协议并写入状态文件
echo "A-1@" > \$STATE_FILE
echo "B-1@" >> \$STATE_FILE
echo "C-1@" >> \$STATE_FILE
echo "E-03@" >> \$STATE_FILE
echo "E-13@" >> \$STATE_FILE
echo "E-04@" >> \$STATE_FILE
echo "E-14@" >> \$STATE_FILE
echo "F1-1!" >> \$STATE_FILE
echo "F2-1!" >> \$STATE_FILE
echo "F3-1!" >> \$STATE_FILE
echo "G-1!" >> \$STATE_FILE

echo "协议文件已创建: \$STATE_FILE"

# 创建临时 Python 脚本文件，命名为 send_receive.py
PYTHON_SCRIPT="/tmp/send_receive.py"

# 写入 Python 代码到文件
cat <<EOF > "\$PYTHON_SCRIPT"
import serial
import time
import os
import subprocess  # 用于调用外部脚本

# 状态文件路径
state_file_path = "/tmp/sendcom.txt"

# 蜂鸣器状态与数值
buzz_value = None
buzz_status = False

# 交通灯状态
RedLed_status = None
YellowLed_status = None
GreenLed_status = None

# 环境监测
Env_status = None

# 定义颜色
RED = "\033[31m"
YELLOW = "\033[33m"
GREEN = "\033[32m"
RESET = "\033[0m"  # 重置为默认颜色

# 定义传感器数据的字典
sensor_data = {
    "SmokeAoPPM": 0.00,
    "Air_QualityAoPPM": 0.00,
    "AlcoholAoPPM": 0.00,
    "temperature14": 0.00,
    "humidity14": 0.00,
    "temperature15": 0.00,
    "humidity15": 0.00,
}


# 定义传感器数据的上限
ceiling_sensor_data = {
    "SmokeAoPPM": 30.00,
    "Air_QualityAoPPM": 20.00,
    "AlcoholAoPPM": 30.00,
    "temperature14": 50.00,
    "humidity14": 50.00,
    "temperature15": 50.00,
    "humidity15": 50.00,
}
# 固定串口号和波特率
port = '/dev/ttyTHS0'  # 根据实际情况修改

   
baudrate = 9600  # 根据实际情况修改




# 串口配置
def configure_serial(port, baudrate):
    try:
        ser = serial.Serial(port, baudrate, timeout=1)
        # print(f"已连接到串口: {port}，波特率: {baudrate}")
        return ser
    except serial.SerialException as e:
        print(f"串口打开失败: {e}")
        return None


# 清理终端并打印整洁的状态
def clear_and_print_status():
    os.system('clear')  # 清理终端屏幕
    print(f"已连接到串口: {port}，波特率: {baudrate}")
    print("\n环境检测状态: {}\n".format(RED + "__█__█__█__█__█__" + RESET if Env_status else "__░__░__░__░__░__"))
    print("传感器数据状态：")
    print("{:<20} {:<20} {:<20}".format("传感器名称", "当前数值", "阈值"))
    print("-" * 60)
    for sensor, value in sensor_data.items():
        status = "正常" if value <= ceiling_sensor_data[sensor] else "超出阈值"
        print(f"{sensor:<20} {value:<20} {ceiling_sensor_data[sensor]:<20} [{status}]")


    print("\n蜂鸣器状态: {}\n".format(RED + "___触发___" + RESET if buzz_status else "___未触发___"))
    print(
    "红色警示灯: {}\t 黄色警示灯: {}\t 绿色警示灯: {}\n".format(
        RED + '█████' + RESET if RedLed_status else "░░░░░",
        YELLOW + '█████' + RESET if YellowLed_status else "░░░░░",
        GREEN + '█████' + RESET if GreenLed_status else "░░░░░",
            )
        )


# 发送数据并接收返回值
def send_and_receive(ser, data):
    global sensor_data,buzz_value, buzz_status,RedLed_status,YellowLed_status,GreenLed_status,Env_status


    if ser.is_open:
        # 发送数据
        ser.write(data.encode())
        # print(f"已发送: {data}")


        # 判断灯的状态变化
        if data == "F1-0!":
            if RedLed_status != True:  # 只有当红灯状态变化时触发
                RedLed_status = True
                clear_and_print_status()
        elif data == "F1-1!":
            if RedLed_status != False:  # 只有当红灯状态变化时触发
                RedLed_status = False
                clear_and_print_status()


        elif data == "F2-0!":
            if YellowLed_status != True:  # 只有当黄灯状态变化时触发
                YellowLed_status = True
                clear_and_print_status()


        elif data == "F2-1!":
            if YellowLed_status != False:  # 只有当黄灯状态变化时触发
                YellowLed_status = False
                clear_and_print_status()


        elif data == "F3-0!":
            if GreenLed_status != True:  # 只有当绿灯状态变化时触发
                GreenLed_status = True
                clear_and_print_status()
        elif data == "F3-1!":
            if GreenLed_status != False:  # 只有当绿灯状态变化时触发
                GreenLed_status = False
                clear_and_print_status()


        elif data == "G-0!":
            if buzz_status != True:  # 只有当蜂鸣器状态变化时触发
                buzz_status = True
                clear_and_print_status()


        elif data == "G-1!":
            if buzz_status != False:  # 只有当蜂鸣器状态变化时触发
                buzz_status = False
                clear_and_print_status()


        elif data in ["E-03!", "E-13!", "E-04!", "E-14!", "A-1!", "B-1!", "C-1!"]:
            if Env_status != True:  # 只有当环境状态变化时触发
                Env_status = True


        elif data in ["E-03@", "E-13@", "E-04@", "E-14@", "A-1@", "B-1@", "C-1@"]:
            if Env_status != False:  # 只有当环境状态变化时触发
                Env_status = False


                subprocess.call(["ser-edit", "G-1!", "F1-1!", "F2-1!", "F3-1!"])


                sensor_data = {
                    "SmokeAoPPM": 0.00,
                    "Air_QualityAoPPM": 0.00,
                    "AlcoholAoPPM": 0.00,
                    "temperature14": 0.00,
                    "humidity14": 0.00,
                    "temperature15": 0.00,
                    "humidity15": 0.00,
                }
                clear_and_print_status()



        # 等待接收返回值
        time.sleep(0.05)  # 等待下位机处理时间
        if ser.in_waiting > 0:
            time.sleep(0.15)  # 等待下位机处理时间
            response = ser.readline().decode('utf-8').strip()
            process_sensor_data(response)  # 处理返回的数据


            # 打印传感器状态更新到终端
            clear_and_print_status()


            # 根据状态和蜂鸣器判断调用脚本
            if buzz_value == "G-1!" and buzz_status is True:
                subprocess.call(["ser-edit", "G-0!","F1-0!","F2-0!","F3-0!"])  # 调用脚本，切换状态
            elif buzz_value == "G-0!" and buzz_status is False:
                subprocess.call(["ser-edit", "G-1!","F1-1!","F2-1!","F3-1!"])  # 调用脚本，切换状态            
    else:
        print("串口未打开")




# 读取状态文件中的协议
def read_commands_from_file():
    global buzz_value


    if os.path.exists(state_file_path):
        with open(state_file_path, 'r') as f:
            commands = [line.strip() for line in f.readlines()]
            # 查找以 'G-' 开头的命令，更新 buzz_value
            buzz_value = next((command for command in commands if command.startswith('G-')), None)


        return commands
    else:
        print("状态文件不存在，请先创建状态文件。")
        return []


# 处理传感器数据
def process_sensor_data(response):
    global buzz_status
    # 假设响应格式为 "SmokeAoPPM:xxxxxx"
    key, value = response.split(':')  # 分割键值对
    value = float(value)  # 将传感器值转换为浮点数


    if key in sensor_data:  # 如果键在字典中
        sensor_data[key] = value  # 更新对应的传感器值
        # print(f"更新传感器数据: {key} = {sensor_data[key]}")


        # 检查所有传感器是否都在阈值范围内
        for k in sensor_data:
            if sensor_data[k] > ceiling_sensor_data[k]:
                buzz_status = True
                # print(f"传感器 {k} 超过阈值，buzz_status: {buzz_status}")
                return  # 发现超出阈值，立即返回，不需要继续检查


        # 如果所有传感器数据都不超阈值，设置 buzz_status 为 False
        buzz_status = False
        # print(f"所有传感器数据均在阈值范围内，buzz_status: {buzz_status}")


    else:
        print(f"未知传感器数据: {response}")


def main():


    # 配置串口
    ser = configure_serial(port, baudrate)
    if ser is None:
        return


    # 读取状态文件中的协议
    commands = read_commands_from_file()
    if not commands:
        return


    # 逐个发送命令
    try:
        for command in commands:
            send_and_receive(ser, command)
    except KeyboardInterrupt:
        print("\n程序中止")
    finally:
        if ser.is_open:
            ser.close()
            # print("串口已关闭")


if __name__ == "__main__":
    # 确保状态文件已由外部脚本创建
    if not os.path.exists(state_file_path):
        print("状态文件不存在，程序将退出。")
    else:
        try:
            # 初始打印字体终端显示
            clear_and_print_status()
            while True:
                main()
        except KeyboardInterrupt:
            print("\n主程序中止")


EOF


# 运行 Python 脚本
python3 "\$PYTHON_SCRIPT" "\$@"


# 删除 Python 脚本文件
rm "\$STATE_FILE"
rm "\$PYTHON_SCRIPT"


EOL


# 赋予脚本执行权限
chmod +x ~/.econfig/ser-init
    
```

`ser-edit` 可以修改对应文件中串口数据，参数是修改对应的串口协议

```bash
cat <<EOL > ~/.econfig/ser-edit
#!/bin/bash

# 状态文件路径
STATE_FILE="/tmp/sendcom.txt"

# 检查状态文件是否存在
if [ ! -f "\$STATE_FILE" ]; then
    echo "状态文件不存在，请先创建它。"
    exit 1
fi

# 检查是否传入参数
if [ \$# -eq 0 ]; then
    echo "请提供要更新的协议作为参数。"
    exit 1
fi

# 定义协议的相互替换规则
declare -A replace_map=(
    ["F1-1!"]="F1-0!"
    ["F1-0!"]="F1-1!"
    ["F2-1!"]="F2-0!"
    ["F2-0!"]="F2-1!"
    ["F3-1!"]="F3-0!"
    ["F3-0!"]="F3-1!"
    ["G-1!"]="G-0!"
    ["G-0!"]="G-1!"

    ["A-1!"]="A-1@"
    ["A-1@"]="A-1!"
    ["B-1!"]="B-1@"
    ["B-1@"]="B-1!"
    ["C-1!"]="C-1@"
    ["C-1@"]="C-1!"

    ["E-03@"]="E-03!"
    ["E-03!"]="E-03@"
    ["E-13@"]="E-13!"
    ["E-13!"]="E-13@"
    ["E-04@"]="E-04!"
    ["E-04!"]="E-04@"
    ["E-14@"]="E-14!"
    ["E-14!"]="E-14@"
)

# 将状态文件内容读入数组
mapfile -t lines < "\$STATE_FILE"

# 遍历状态文件内容，进行替换
for i in "\${!lines[@]}"; do
    current_value="\${lines[\$i]}"
    for arg in "\$@"; do
        if [[ "\$arg" == "\$current_value" ]]; then
            # 如果输入参数与状态文件内容相同，则不变
            continue  # 跳过当前循环，保持当前值不变
        fi

        # 替换值
        if [[ "\${replace_map[\$current_value]}" == "\$arg" ]]; then
            lines[\$i]="\$arg"  # 用输入参数替换状态文件内容
        fi
    done
done

# 将更新后的内容写回状态文件
printf "%s\n" "\${lines[@]}" > "\$STATE_FILE"

echo "状态文件已更新。"
# cat "\$STATE_FILE"  # 打印更新后的状态文件内容

EOL

# 赋予脚本执行权限
chmod +x ~/.econfig/ser-edit
```

##### 2、使用示例

先打开`ser-init`

![image-20260728162237116](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728162237793.webp)

使用`ser-edit`修改串口协议 

![image-20260728162257794](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728162258504.webp)

![image-20260728162308941](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728162309608.webp)

```bash
'''
传感器与、交通灯相对应控制协议
'''

A-1@  ---  A-1!       # 烟雾浓度传感器的关闭与开启
B-1@  ---  B-1!       # 空气质量传感器的关闭与开启
C-1@  ---  C-1!       # 酒精浓度传感器的关闭与开启

E-03@  ---  E-03!   # 3号温度传感器的关闭与开启
E-13@  ---  E-13!   # 3号湿度传感器的关闭与开启
E-04@  ---  E-04!   # 4号温度传感器的关闭与开启
E-14@  ---  E-14!	# 4号湿度传感器的关闭与开启

F1-1!  ---  F1-0!     # 红灯的关闭与开启
F2-1!  ---  F2-0!     # 黄灯的关闭与开启
F3-1!  ---  F3-0!     # 绿灯的关闭与开启
G-1!  ---  G-0!        # 蜂鸣器的关闭与开启
```

## b. 工具

### i.Cutecom

`sudo apt install cutecom`

###  ii. 挂载 exfat 硬盘

`sudo apt-get install exfat-fuse exfat-utils`

## c. 设置从不锁屏

点击设置（两种方式） -> 点击锁屏管理  点击进去后按照图片所选点击 

![image-20260728162416149](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728162416676.webp)

##  d. 权限被拒

各种端口号被拒绝连接。

#### i. 暂时性使用

将对应的端口号赋予 `777` 权限，修改权限为可读可写可执行，但是这种设置在重启后，下次使用时，又会出现这种问题，还要重新设置一遍。

`sudo chmod 777 端口号 `

```bash
sudo chmod 777 /dev/ttyUSB0

sudo chmod 777 /dev/ttyCH341USB0

sudo chmod 777 /dev/gpiochip0

sudo chmod 777 /dev/ttyTHS0
```

#### ii. 永久性使用

将用户添加到对应组中，可通过 `ls -l 端口号`，查询对应组。



**这部分建议查看原文档**

-  **USB串口权限被拒**

**/dev/ttyUSB0** 权限被拒绝 或者  **/dev/ttyCH341USB0** 权限被拒绝，因为一般情况下不是root用户，对端口没有权限。

```bash
# 把用户名加入了dialout用户组。重启后，就可直接使用了。
sudo usermod -aG dialout $USER 
```

- **引脚权限被拒**

```bash
# 把用户名加入了 gpio 用户组。重启后，就可直接使用了。
sudo groupadd -f gpio
sudo usermod -aG gpio $USER
```

> 或者使用 sudo 运行程序

- ##### UART（引脚）串口权限被拒

  **使用引脚串口 TX(8号引脚)、RX(10号引脚)，进行串口通信，对应的 /dev/ttyTHS0 号端口。**

  ![image-20260728162928548](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728162929080.webp)

  与上面的删除线内的`tty` 不同，这里是`dialout`，可能只需要关闭 **nvgetty.service **，再把用户加入到`dialout`组中就可以。

- **验证是否加入**

  `groups $USER`

  这个命令会列出当前用户所属的所有组。如果`添加的对应组`(dialout)在输出的组列表中，那么说明用户已经成功加入了`对应组`(dialout)中。

  例如，输出可能类似于：

  ```bash
  username : username dialout sudo ...其他组
  ```

  其中，`username`是你的用户名。如果你在输出中看到了`对应组`(dialout)，则说明用户已经成功加入了该组。

  **重启生效！！**

## e. 4G模块 网络设置

Jetson Xavier NX 在使用4G网络模块时  ,他是先连接的**Ethernet**（有线）服务，这应该有一分钟是有网络的，但是过后有自动接上了**Mobile Broadband**（移动宽带）服务，这时就没有网络了。

因为每次上电后总是自动连接Mobile Broadband（移动宽带）服务，所以禁用这个服务，并且设置开机不启动这个服务。

`sudo systemctl stop ModemManager`

`sudo systemctl disable ModemManager`

```lua
--禁用 ModemManager 服务
--ModemManager 是 Linux 系统中管理移动宽带（如 3G/4G/5G）的一个后台服务。禁用 ModemManager 可以完全停止对 Mobile Broadband 设备的管理。

--停止 ModemManager:
sudo systemctl stop ModemManager

--禁用 ModemManager（防止开机自动启动）:
sudo systemctl disable ModemManager

--这样，系统就不会再尝试连接任何移动宽带设备。

--以后如果使用想要重新使用 移动宽带 服务
--重新启动 NetworkManager：
sudo systemctl restart NetworkManager

--启用并设置 ModemManager 开机自动启动:
sudo systemctl enable ModemManager
sudo systemctl start ModemManager
```

```lua
-- 一些网络接口命令查询
nmcli connection show  -- 显示所有接口 

-- nmcli connection show <UUID>
nmcli connection show 7fa34ccd-11b5-3994-933f-e115f3e88f98 --查看接口详细信息
--输出结果中查找 connection.interface-name 字段，这就是网络接口名称

--通过指定的网络接口进行 ping

ping -I <interface_name> www.baidu.com	--知道接口名称后，可以通过以下方式指定接口进行 ping 操作

ping -I wwan0 www.baidu.com  --接口名称是 wwan0，命令如下
-- ping 命令的 -I 选项：-I 选项用于指定源接口。所有数据包都将从此接口发出。
```

## f. frp 内网穿透

参考 [Frp](/posts/devbits/cloud-server/#1-frp)

## g. CH341驱动包升级

`详细问题`: 在官方系统中可以 ，但是在NX、Nano中不可以运动，通过串口助手连接查看，发现NX、Nano的传输过来信号有问题，不是波特率、硬件等其他的原因。

`原因/解决`: CH341驱动包太旧，导致通信不上，升级CH341驱动包

[CH341SER_LINUX.ZIP - 南京沁恒微电子股份有限公司 (wch.cn)](https://www.wch.cn/downloads/CH341SER_LINUX_ZIP.html)

![image-20260728163336049](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728163336475.webp)

移到主目录下，执行命令

```bash
unzip CH341SER_LINUX.ZIP
cd CH341SER_LINUX/driver
make

# 先卸载旧驱动
sudo make uninstall
# 动态加载驱动到内核中
sudo insmod ch341.ko
# 驱动在系统启动时自动加载
sudo make install
```

以下是驱动包内 README.md 大概的解释

1. `打开终端：首先需要打开Linux系统的终端。` 
2. `切换到驱动目录：将当前工作目录切换到包含驱动源码的文件夹。` 
3. `编译驱动：使用make命令编译驱动源码，如果成功，将生成ch341.ko模块文件。` 
4.  `加载驱动：使用sudo make load或sudo insmod ch341.ko命令动态加载驱动到内核中。` 
5. `卸载驱动：使用sudo make unload或sudo rmmod ch341.ko命令从内核中卸载驱动。` 
6. `安装驱动：使用sudo make install命令使得驱动在系统启动时自动加载。` 
7. `卸载驱动：使用sudo make uninstall命令从系统中完全移除驱动。`

重新上电，应该就可以了！

## h. 音频设置

上电后总是不选择有音频的USB设备，总是选择没有音频的系统设备。

**解决：终端输入 -> 输出设备 -> 配置**  : `pavucontrol`

[grid]
![image-20260728163532247](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728163532690.webp)
![image-20260728163540254](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728163540673.webp)
[/grid]



**查询音频设备号**：

1- `lsusb` 查询哪一个是音频设备

**Bus 001 Device 011: ID 0d8c:0014 C-Media Electronics, Inc**

2- `lsusb -v -d 0d8c:0014` 获取详细信息

3- `aplay -l` 获取所有声卡信息，得到USB声卡信息

**card 2: Device [USB Audio Device], device 0: USB Audio [USB Audio]  Subdevices: 0/1  Subdevice #0: subdevice #0**

4- `amixer -c 2`  列出所有控件来找到合适的名称

```lua
Simple mixer control 'Speaker',0  
Capabilities: pvolume pswitch pswitch-joined  
Playback channels: Front Left - Front Right
Limits: Playback 0 - 37 
Mono:  
Front Left: Playback 37 [100%] [0.00dB] [off]  
Front Right: Playback 37 [100%] [0.00dB] [off] 
Simple mixer control 'Mic',0  
Capabilities: pvolume pvolume-joined 
cvolume cvolume-joined pswitch pswitch-joined cswitch cswitch-joined 
Playback channels: Mono  
Capture channels: Mono  
Limits: Playback 0 - 31 Capture 0 - 35  
Mono: Playback 0 [0%] [-99999.99dB] [off] Capture 34 [97%] [22.00dB] [on] 
Simple mixer control 'Auto Gain Control',0  
Capabilities: pswitch pswitch-joined 
Playback channels: Mono 
Mono: Playback [on]
```

**Speaker** 控件：

+ **Playback channels**: Front Left - Front Right
+ **Limits**: Playback 0 - 37
+ 当前音量设置为 37（100%），但被标记为 `off`（静音）。

**Mic** 控件：

+ **Playback channels**: Mono
+ **Capture channels**: Mono
+ 当前录音音量设置为 34（97%），当前正在录制（`on`）。

---

使用 `amixer` 调整音量

对于 **Speaker** 控件，你可以使用 `amixer` 进行音量调整和取消静音：

+ **设置音量** 为最大并取消静音：

```lua
amixer -c 2 sset 'Speaker' 37
```

+ **取消静音**（如果设备支持）：

```lua
amixer -c 2 sset 'Speaker' unmute
```

+ **静音**（如果需要）：

```lua
amixer -c 2 sset 'Speaker' mute
```

## i. 关闭系统自动更新

![image-20260728163937916](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728163938191.webp)

**系统每次开机后，都会弹出更新管理器，提醒用户更新软件，但是如果本机已装的软件和要更新的软件冲突，那就比较麻烦，因为开发环境搭建好以后，不再希望去动它，下面通过禁止去掉系统通知服务，使之不在开机通知。**

`推荐方法一，方法二可能会把桌面环境卸载掉。`

### i. 方式一

改变通知程序名称，使之daemon程序启动后找不到它，自然无法通知

```bash
sudo mv /etc/apt/apt.conf.d/99update-notifier /etc/apt/apt.conf.d/99update-notifier.bak

sudo apt update
```

重启后生效

### ii. 方式二

卸载通知程序：**update-manager** 

```bash
sudo apt remove update-manager 
```

## j. 桌面一键启动

这里需要做到一键启动建图、导航等功能，写几个 .desktop文件然后对应到各自的脚本文件就可以。

脚本文件在功能包目录  `esteam_ws/src/autoe_config/scripts/` 下 

### i. 2D的启动

#### 1. 建图开始

```bash
cat <<EOL > $HOME/桌面/2d_slam_start.desktop

[Desktop Entry]
Name=2D建图开始
Exec=bash -c "\$HOME/esteam_ws/src/autoe_config/scripts/2d/slam_start"
Terminal=true
Type=Application

EOL

chmod u+x $HOME/桌面/2d_slam_start.desktop
```

#### 2. 建图结束

```bash
cat <<EOL > $HOME/桌面/2d_slam_stop.desktop

[Desktop Entry]
Name=2D建图结束
Exec=bash -c "\$HOME/esteam_ws/src/autoe_config/scripts/2d/slam_stop"
Terminal=true
Type=Application

EOL

chmod u+x $HOME/桌面/2d_slam_stop.desktop
```

#### 3. 导航开始

```bash
cat <<EOL > $HOME/桌面/2d_navigate_start.desktop

[Desktop Entry]
Name=2D导航开始
Exec=bash -c "\$HOME/esteam_ws/src/autoe_config/scripts/2d/navigate_start"
Terminal=true
Type=Application

EOL

chmod u+x $HOME/桌面/2d_navigate_start.desktop
```

#### 4. 多点导航开始

```bash
cat <<EOL > $HOME/桌面/2d_navigate_multi_start.desktop

[Desktop Entry]
Name=2D多点导航开始
Exec=bash -c "\$HOME/esteam_ws/src/autoe_config/scripts/2d/navigate_multi_start"
Terminal=true
Type=Application

EOL

chmod u+x $HOME/桌面/2d_navigate_multi_start.desktop
```

#### 5. 导航结束

```bash
cat <<EOL > $HOME/桌面/2d_navigate_stop.desktop

[Desktop Entry]
Name=2D导航结束
Exec=bash -c "\$HOME/esteam_ws/src/autoe_config/scripts/2d/navigate_stop"
Terminal=true
Type=Application

EOL

chmod u+x $HOME/桌面/2d_navigate_stop.desktop
```

### ii. 3D的启动

3D的启动与2D的同理，对应的脚本文件其实也已经写好了，但是对应的导航不大精准，所以没有在这里写对应的 .desktop 文件。

脚本文件在功能包目录 esteam_ws/src/autoe_config/scripts/3d 下

### iii. 图标

加了一些图标，可以使用`Icon=/path/to/icon`来进行使用。

- **1. 导航结束**

  ![image-20260728164429839](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728164430696.webp)

- **2. 开始单点导航**

  ![image-20260728164422968](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728164423856.webp)

- **3. 开始多点导航**

  ![image-20260728164412311](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728164413204.webp)

- **4. 开始建图**

  ![image-20260728164402388](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728164403426.webp)

- **5. 结束建图**

  ![image-20260728164351977](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728164353297.webp)









![img](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728164332847.gif)





---

# 附录二 | 待完成

- [ ] 上位机（这个Qt的 估计最后还是我来弄）
- [ ] 3D建图
- [ ] 3D导航（查了查资料与评论，好像是需要自己写导航框架，如果用3D导航的话）
- [ ] 2D导航（现在是使用谷歌的导航与建图，对NX系统占用极大）
- [ ] 传感器数据





