---
title: 速腾 Hellos-16P 基本测试
published: 2026-06-25
updated: 2026-06-25
description: 速腾 Hellos-16P 基本测试（通信、硬件连接等）
image: /assets/bolg_cover/rs-hellos-use.webp
tags: [激光雷达, 速腾, 3D]
category: 硬件调试
draft: false
author: larry
password: ""
passwordHint: ""
---

---



# 前言

> 这个是记录速腾 Hellos-16P（速腾16线激光雷达）怎么进行使用，从大黄蜂底盘文档摘录出来的



- **基础环境**
  1. 主机设备：
  2. 操作系统：Win 10、Ubuntu 18.04/20.04
  3. 传感器设备：RS-Hellos-16P
  4. ROS版本：ROS Melodic
- **参考链接**
  | [机器人 - RoboSense速腾聚创 \| 让世界更安全，让生活更智能](https://www.robosense.cn/product) |
  | ------------------------------------------------------------ |
  | [Welcome to RoboSense ! — RoboSense wiki 0.1 文档](https://robosense-wiki-cn.readthedocs.io/zh-cn/latest/) |
  | [Releases · RoboSense-LiDAR/rslidar_sdk](https://github.com/RoboSense-LiDAR/rslidar_sdk/releases) |
  | [Helios系列 - RoboSense速腾聚创 \| 让世界更安全，让生活更智能](https://www.robosense.cn/rslidar/Helios) |
  | [资源中心 - RoboSense速腾聚创 \| 让世界更安全，让生活更智能](https://www.robosense.cn/resources-81) |

速腾聚创的官网现在明面上不显示有关这个的信息，点击导航栏的 **`数字化激光雷达`** 才可以显示所有的

![img](https://vip.123pan.cn/1831996731/a_PicBed/hardware/rs-hellos-use/20260629000842708.webp)





- 3D雷达型号是 **`·RSHELIOS_16P·`** 或者 **`·RS-Hellos-16P·`**
  - [**参考网址 1**](https://blog.csdn.net/weixin_44444810/article/details/121659270)
  - [**参考网址 2**](https://blog.csdn.net/weixin_44444810/article/details/121512088?spm=1001.2014.3001.5502)
  - [**参考网址 3**](https://blog.csdn.net/m0_61463856/article/details/129960984?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_utm_term~default-0-129960984-blog-121512088.235^v43^pc_blog_bottom_relevance_base2&spm=1001.2101.3001.4242.1&utm_relevant_index=3)



# 1. 网络配置

1. **进入网络设置**
   打开Ubuntu **设置** → 选择 **网络** → 点击有线连接的 **选项** 按钮。
2. **配置IPv4**
   - 将 **名称** 改为 `3D-RS-Hellos-16P`（方便识别）。
   - 将 **IPv4方式** 改为 **手动**。
   - 点击 **地址** 旁边的 **+** 号，添加以下信息（这是RS-Helios系列雷达的默认配置）：
     - 地址: `192.168.1.102`
     - 子网掩码: `255.255.255.0`
     - 网关: `192.168.1.1`
   - DNS服务器 填写 `223.5.5.5`。
   - 点击 **保存**。
3. **验证网络连通性**
   - **检查IP**：在终端中运行 `ifconfig`，查看网口是否已正确获取到 `192.168.1.102` 的IP地址。
   - **网络测试**：运行 `ping 192.168.1.102`，若能ping通，则说明网络配置成功。

**注意**：PC的静态IP地址 `192.168.1.102` 需要与雷达自身IP（通常是 `192.168.1.200`）处于同一网段，即 `192.168.1.x`。

![img](https://vip.123pan.cn/1831996731/a_PicBed/hardware/rs-hellos-use/20260629001309693.webp)

![img](https://vip.123pan.cn/1831996731/a_PicBed/hardware/rs-hellos-use/20260629001321098.webp)

![img](https://vip.123pan.cn/1831996731/a_PicBed/hardware/rs-hellos-use/20260629001329413.webp)

![img](https://vip.123pan.cn/1831996731/a_PicBed/hardware/rs-hellos-use/20260629001337526.webp)

# 2. rslidar_sdk

## a. 下载SDK

从 [rslidar_sdk Release](https://github.com/RoboSense-LiDAR/rslidar_sdk/releases) 页面下载 `rslidar_sdk.tar.gz` 压缩包。

**26-04-30 最新的：**[rslidar_sdk-v1.5.19.tar（9.3MB）](https://1831996731.share.123pan.cn/123pan/wdzVjv-u9Lyv)

- **⚠️** **避坑警告**
  - **不要下载** `Source code` 压缩包，因为它不包含子模块 `rs_driver` 的代码，需要手动补齐。
  - 正确做法是下载 **完整驱动包** `rslidar_sdk.tar.gz`，将其解压到你的ROS工作空间的 `src` 目录下。

  ![img](https://vip.123pan.cn/1831996731/a_PicBed/hardware/rs-hellos-use/20260629001803521.webp)

## b. 驱动依赖

在终端中依次执行以下命令，安装必要的依赖库：

```bash
# pcap`、`Yaml`、`parmetis
sudo apt-get install -y libpcap-dev
sudo apt-get install -y libyaml-cpp-dev   # 若已安装ROS desktop-full，可跳过
sudo apt-get install libparmetis-dev
```

## c. 修改配置文件

这是确保驱动能正确编译的关键步骤。

- **进入驱动目录**
  假设你的工作空间是 `catkin_ws`
  ```bash
  cd ~/catkin_ws/src/rslidar_sdk
  ```
- **CMakeLists.txt**
  使用文本编辑器打开 `CMakeLists.txt`，找到并修改以下几行：
  
  ```
  set(COMPILE_METHOD ORIGINAL)  
  set(POINT_TYPE XYZI)          
  ```
  修改为：
  ```
  set(COMPILE_METHOD CATKIN)    # 这一步骤可省略
  set(POINT_TYPE XYZIRT)          
  ```
- **package.xml**
  在`rslidar_sdk`项目目录中，将文件`package_ros1.xml`复制并粘贴。随后，建议将此复制的文件重命名为`package.xml`。（这一步骤可省略）

## d. 修改雷达参数

这是将驱动与你的RS-Helios-16P雷达型号匹配的关键步骤。

- **找到配置文件**：进入 `rslidar_sdk/config/` 目录，打开 `config.yaml` 文件。

  ```yaml
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

- 激光雷达型号默认 **`RSM1`** 

  - 修改为自己的激光雷达型号即可，不修改则会报错，并且读取不到激光扫描参数：

  ![img](https://vip.123pan.cn/1831996731/a_PicBed/hardware/rs-hellos-use/20260629002342254.webp)

  - 找到 `lidar:` 下的 `driver:` 部分，将 `lidar_type` 修改为你的雷达型号，这里使用的是16线的激光雷达，将 **`RSM1`** 改为 **`RSHELIOS_16P`** 修改如下

    ```yaml
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

- **修改ROS话题设置**
  找到 `ros:` 部分，自定义ROS中的话题和frame_id，这将直接影响你后续在RViz等工具中看到的点云话题名和坐标变换

  ```yaml
  ros:
    ros_frame_id: rslidar           # 点云的坐标系名称，非常重要，后续TF配置需要用到
    ros_recv_packet_topic: /rslidar_packets   # ROS接收雷达数据包的话题
    ros_send_packet_topic: /rslidar_packets   # ROS发送雷达数据包的话题
    ros_send_point_cloud_topic: /rslidar_points # 最终点云数据发布的话题，此为默认值
  ```

  >`config.yaml`文件中包含若干关键参数。特别需要注意的是`ros_frame_id`和`ros_send_point_cloud_topic`的配置。其中，`ros_frame_id`对于后续构建URDF文件至关重要；而`ros_send_point_cloud_topic`则指定了3D雷达所发布的点云数据主题名称，这对于正确订阅这些数据是必要的。此前由于对此细节的忽视，导致在一段时间内未能准确识别雷达对应的`frame_id`。

# 3. 编译与运行

## a. 编译工作空间

返回你的工作空间根目录，使用 `catkin_make` 进行编译。

```bash
cd ~/catkin_ws
catkin_make
source devel/setup.bash
```

## b. 启动雷达驱动

驱动安装完成后，通过ROS的launch文件启动。

```bash
roslaunch rslidar_sdk start.launch
```

![img](https://vip.123pan.cn/1831996731/a_PicBed/hardware/rs-hellos-use/20260629002610844.webp)

## c. 启动RViz

有两种方式查看点云：

- **自动启动**：直接运行 `start.launch`，它会自动打开RViz并加载预置视图。
- **手动启动**：如果你需要更灵活地配置RViz，可以在驱动节点运行后，新开一个终端手动启动：`rviz`

然后在RViz中，通过左下角的 **Add** 按钮，添加 `PointCloud2` 显示类型，并将其话题设置为你在 `config.yaml` 中配置的 `ros_send_point_cloud_topic`，即 `/rslidar_points`。

## d. 不启动RViz的方法

如果你只想运行驱动节点，不启动RViz可视化界面，可以创建一个不包含RViz节点的launch文件。

```plain
cd ~/catkin_ws/src/rslidar_sdk/launch
cp start.launch start_core.launch
```

编辑 `start_core.launch`，**删除或注释掉**包含 `rviz` 的那一行。

**修改前 (start.launch):**

```xml
<!-- rviz -->
<node pkg="rviz" name="rviz" type="rviz" args="-d $(find rslidar_sdk)/rviz/rviz.rviz" />
```

**修改后 (start_core.launch):**

```xml
<!-- rviz -->
<!-- <node pkg="rviz" name="rviz" type="rviz" args="-d $(find rslidar_sdk)/rviz/rviz.rviz" /> -->
```

然后通过 `roslaunch rslidar_sdk start_core.launch` 即可只启动雷达核心节点。

# 4. 常见问题

1. **编译报错：找不到 `rs_driver`**
   - **问题原因**：下载了不完整的源码包。
   - **解决方法**：确保你下载的是 `rslidar_sdk.tar.gz` 完整包，而不是 `Source code`。
2. **运行报错：`Failed to load library` 或 `Invalid lidar type`**
   - **问题原因**：`config.yaml` 中的 `lidar_type` 配置错误或与雷达型号不符。
   - **解决方法**：检查并确保 `lidar_type` 已正确设置为 `RSHELIOS_16P`。
3. **连接不上雷达：收不到点云数据**
   - **问题原因**：网络连接问题，如IP地址配置错误、网线接触不良或防火墙阻止。
   - **解决方法**：
     - 再次确认电脑的静态IP为 `192.168.1.102`，子网掩码 `255.255.255.0`。
     - 尝试 `ping 192.168.1.200` (雷达默认IP)，检查是否连通。
     - 检查并暂时关闭Ubuntu防火墙。
4. **RViz中看不到点云**
   - **问题原因**：未正确添加显示或话题名错误。
   - **解决方法**：
     - 确认驱动节点已成功运行，并输出了 `[sdk]: ... point cloud send ...` 之类的日志。
     - 在RViz的命令行终端或终端中运行 `rostopic list`，确认 `/rslidar_points` 话题存在。
     - 检查RViz中 `PointCloud2` 插件的 **Topic** 属性是否设置为 `/rslidar_points`，**Fixed Frame** 属性是否设置为 `rslidar`。





---

















































