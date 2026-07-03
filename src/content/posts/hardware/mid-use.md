---
title: 览沃 Mid-360s 基本测试
published: 2026-04-16
updated: 2026-06-25
description: 览沃 Mid-360s 基本测试（通信、硬件连接等）
image: /assets/bolg_cover/mid-use.webp
tags: [激光雷达, 览沃, 3D]
category: 硬件调试
draft: false
author: larry
password: ""
passwordHint: ""
---

---


# 前言

> 览沃出品的3D激光雷达，主要是便宜吧这款(相对来说)，测试新到的 3D 激光雷达（Mid-360s）功能性是否完好，进行在 Windows/Linux 测试。

>Mid-360s 测试与 Mid-360 测试文件不同，新产品 **Mid-360s** 在软件层面保持了良好的兼容性。需将现有上位机软件 **Livox Viewer2 更新至最新版 2.5.0，SDK 更新至 1.3.0，ROS 驱动更新至 1.2.5** 即可支持新产品的 全部功能，无需进行其他复杂的软件修改或系统调整。
>
>详情查看：[MID360S变更说明.pdf(440 KB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-U9Lyv)

>本文档后续将围绕上述基础环境，开展项目开发、测试验证等相关内容的记录，具体模块可根据实际需求自行规划补充。

- **26-05-22**
  - 官方发布并更新了关于Mid-360s的资料(写文章的时候是没有的，找客服要的)
    - [Downloads - Mid-360S 激光雷达 - Livox](https://www.livoxtech.com/cn/mid-360s/downloads)
    - [livox_ros_driver2](https://github.com/Livox-SDK/livox_ros_driver2)
    - [Livox-SDK2](https://github.com/Livox-SDK/Livox-SDK2)

- **基础环境**
  1. 主机设备：
  2. 操作系统：Win 10、Ubuntu 18.04/20.04
  3. 传感器设备：Livox Mid-360s
  4. ROS版本：ROS melodic

- **参考链接**
  | [mid360基本配置外加测试FAST_LIO2提取实时里程计数据_fastlio2 github-CSDN博客](https://blog.csdn.net/2301_79618994/article/details/146067579?ops_request_misc=elastic_search_misc&request_id=5ab1717cf683328b137c3e800afac9d4&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-146067579-null-null.142^v102^pc_search_result_base8&utm_term=mid360%20%E6%B5%8B%E8%AF%95&spm=1018.2226.3001.4187) |
  | ------------------------------------------------------------ |
  | **[ubuntu18.04 配置 mid360并测试fast_lio_ubuntu mid360-CSDN博客](https://blog.csdn.net/hero_heart/article/details/139613682?ops_request_misc=elastic_search_misc&request_id=5ab1717cf683328b137c3e800afac9d4&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-139613682-null-null.142^v102^pc_search_result_base8&utm_term=mid360%20%E6%B5%8B%E8%AF%95&spm=1018.2226.3001.4187)** |
  | **[NVIDIA Jetson AGX Orin平台：ROS1+mid-360激光雷达+Fast-lio2 测试_orin 测试mid-360-CSDN博客](https://blog.csdn.net/Yan_uuu/article/details/156276864?ops_request_misc=&request_id=&biz_id=102&utm_term=mid360%20%E6%B5%8B%E8%AF%95&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-156276864.142^v102^pc_search_result_base8&spm=1018.2226.3001.4187)** |
  | **[Ubuntu 20.04使用Livox mid 360 测试 FAST_LIO_ubuntu mid360 ](https://blog.csdn.net/qq_16775293/article/details/132408005?ops_request_misc=elastic_search_misc&request_id=5ab1717cf683328b137c3e800afac9d4&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-4-132408005-null-null.142^v102^pc_search_result_base8&utm_term=mid360%20%E6%B5%8B%E8%AF%95&spm=1018.2226.3001.4187)** |
  | **[mid360初始配置-CSDN博客](https://blog.csdn.net/wuliu21/article/details/148984781?ops_request_misc=elastic_search_misc&request_id=5ab1717cf683328b137c3e800afac9d4&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~ElasticSearch~search_v2-6-148984781-null-null.142^v102^pc_search_result_base8&utm_term=mid360%20%E6%B5%8B%E8%AF%95&spm=1018.2226.3001.4187)** |
  | **[LiDAR Sensors - Livox](https://www.livoxtech.com/cn/downloads)** |
  | **[1.2. Mid-360 — Livox wiki 0.1 文档](https://livox-wiki-cn.readthedocs.io/zh-cn/latest/tutorials/new_product/mid360/mid360.html)** |
  | **[GitHub - WilsonGuo/Fast-LIVO2-Drvier-Mid360S: the Driver for Mid360S](https://github.com/WilsonGuo/Fast-LIVO2-Drvier-Mid360S/tree/main)** |

- **3D 模型**
  [mid-360-stp(4.91 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-pU2yv)



# 1. IP 设置

- **参考手册**
  - [Livox_Mid-360_User_Manual_CHS.pdf(2.1 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-W5wyv)
  - [Livox MID-360S_技术规格书.pdf(1.4 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-enTyv)
  - [Livox_Mid-360s_Product_Information.pdf(675 KB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-C5wyv)
  
- **说明**
  1. Mid-360 通过以太网进行数据通信(UDP)，支持静态 IP 地址模式。
  2. 所有 Mid-360 出厂默认 IP 地址为 192.168.1.1XX (XX为Mid-360 SN码最后两位数字)，子网掩码为 255.255.255.0 ，默认网关为 192.168.1.1。
  3. 查看雷达背后的 id 码，以 `47MDM6J0020438` 为例，其最后两位即为当前雷达的默认 IP 地址，即雷达的出厂默认 IP 地址为 `192.168.1.138`。
  4. 首次使用 Mid-360 时，无需通过路由器，即可直接与电脑连接。

## a. Win

1. 在控制面板中，进入网络与共享中心。

   ![1775188287469-5995096b-69b4-493f-b662-472d5730bc4f](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629102706694.webp)
2. 点击“以太网”跳转到以太网状态界面，点击“属性”按钮进入以太网属性设置。

   ![1775188323053-fdc564ac-6b03-4c4d-a8b0-7122578aefcd](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629102736488.webp)
3. 双击“internet协议版本4(TCP/IPV4)”
4. 将IP地址设置为192.168.1.2，子网掩码设置为255.255.255.0，点击“确认”，完成电脑静态IP的设置。

   ![1775188371097-6d0c3e4d-339e-43a9-85b9-801b1e4b0607](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629102750298.webp)

## b. Linux

### i. 图形界面

在设置的 **Network** 中
- **Ubuntu 18.04**

[grid]
![1775805173110-ca06dbcf-0d15-4971-aa4c-67110c1e0fd1](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629103144372.webp)
![1775805151588-c5b57c4b-02ff-4a49-b1dc-1f1d0bb8e052](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629103153062.webp)
[/grid]

- **Ubuntu 20.04**

[grid]
![1775188909028-e284fcd2-3fda-4a43-88a8-bfe92a38b64f](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629103208093.webp)
![1775184329726-418bf0f2-49ea-4251-9779-c287786cab24](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629103216413.webp)
[/grid]

### ii. 命令行

IP 地址的配置可以在终端中通过 `ifconfig` 命令配置，配置的示例代码如下:

```bash
sudo ifconfig enp4s0 192.168.1.5
```

其中，需要将 `enp4s0` 替换为本机的网口名称

## c. Livox Viewer 2 

上位机测试，这个也是需要版本到 v2.5.0 才可以检测到 Mid-360S，~~只有 Windows 的~~ 官方已更新

[Livox Viewer 2 用户手册-Livox_Viewer_2_User_Manual_chs_v1.2.pdf(1.67 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-S9Lyv)

# 2. Livox-SDK2

| ~~GitHub 上的官网 releases 版本不知道为什么只到 v1.2.5，没有去细究。~~ 官方已更新 |
| ------------------------------------------------------------ |

| Github 地址                             | [GitHub - Livox-SDK/Livox-SDK2](https://github.com/Livox-SDK/Livox-SDK2) |
| --------------------------------------- | ------------------------------------------------------------ |
| 这个是客服给的版本（Mid-360s 使用这版） | [Livox_SDK2_v1.3.0.zip(517 KB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-tnTyv) |
| 详细使用说明                            | [Livox SDK2的安装及使用.pdf(1.05 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-bApyv) |

- **安装CMake**

  ```bash
  sudo apt install cmake
  ```
- **克隆/编译/安装**

  ```bash
  git clone https://github.com/Livox-SDK/Livox-SDK2.git
  cd ./Livox-SDK2/
  mkdir build && cd build
  cmake .. && make -j4
  sudo make install
  
  # 如何删除 Livox SDK2
  sudo rm -rf /usr/local/lib/liblivox_lidar_sdk_* 
  sudo rm -rf /usr/local/include/livox_lidar_*
  ```
- **修改文件**

  进入 `~/Livox-SDK2/samples/livox_lidar_quick_start` 这个文件夹，找到 `mid360s_config.json`，把 **host_ip** 改成 **192.168.1.5**
  ```json
  {
    "Mid360s": {
      "lidar_net_info" : {
        "cmd_data_port"  : 56100,
        "push_msg_port"  : 56200,
        "point_data_port": 56300,
        "imu_data_port"  : 56400,
        "log_data_port"  : 56500
      },
      "host_net_info" : [
        {
          "host_ip"        : "192.168.1.5",
          "cmd_data_port"  : 56101,
          "push_msg_port"  : 56201,
          "point_data_port": 56301,
          "imu_data_port"  : 56401,
          "log_data_port"  : 56501
        }
      ]
    }
  }
  ```
- **运行示例**

  进入 `~/Livox-SDK2/build/samples/livox_lidar_quick_start` 这个文件夹运行如下代码
  ```bash
  ./livox_lidar_quick_start ../../../samples/livox_lidar_quick_start/mid360s_config.json 
  ```
  **注意：** json文件和要执行的文件不在一个文件夹！！
  运行成功会显示以下画面，然后会有数据流一直发（如果不是这个的话可能IP错了)

  ![1775195581922-e96d0e13-f819-4095-aabd-8a4d61d898bc](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629104854674.webp)
  

# 3. livox_ros_driver2

- **来源**
  - [AtomGit | GitCode - 全球开发者的开源社区,开源代码托管平台](https://gitcode.com/gh_mirrors/li/livox_ros_driver2?utm_source=csdn_github_accelerator&isLogin=1&from_link=88a140abd3952cf893ea2eeb266fdca7) 
  - [AtomGit | GitCode - 全球开发者的开源社区,开源代码托管平台](https://gitcode.com/gh_mirrors/li/livox_ros_driver2?utm_source=csdn_github_accelerator&isLogin=1&from_link=88a140abd3952cf893ea2eeb266fdca7) 
  - [GitHub - Livox-SDK/livox_ros_driver2](https://github.com/Livox-SDK/livox_ros_driver2) 
- **说明**
  - 这个的版本 Mid-360s 规定 >= v1.2.5，ROS 版本是靠其中的 build.sh 脚本来控制，~~这个的话官网网站也没有v1.2.5~~ （官网已更新）
  - 我前后查看了一下区别在于 `launch/` 文件夹中多了 Mid-360s 的配置。
  - 这个是客服给的版本（Mid-360s 使用这版）
    - [livox_ros_driver2_v1.2.5.zip(251 KB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-l9Lyv)
  - 有些细节介绍可以查看 **`livox_ros_driver`** 虽说有不一样，但是参数方面有一些介绍
    - [GitHub - Livox-SDK/livox_ros_driver](https://github.com/Livox-SDK/livox_ros_driver) 

  
  

## a. 克隆/编译

   ```bash
   mkdir -p Mid360s/src    #创建工作路径
    
   cd Mid360s/src 
   
   #下载安装包，同理，下载不了就复制链接进入官网下载（Mid-360s用客服给的） 
   git clone https://github.com/Livox-SDK/livox_ros_driver2.git
    
   cd livox_ros_driver2    
   
   #换成自己的ros版本
   source /opt/ros/melodic/setup.sh
    
   ./build.sh ROS1 
   
   #在Mid360s下（可以不进行这步骤） 
   catkin_make   
   
   #在Mid360s下 
   source devel/setup.bash    
   ```

   >**注意事项：catkin_make要在Mid_livox_ros_drivers下运行**

## b. 测试

   - **查看雷达 IP**

     查看 mid-360s 设备ID，根据ID最后两位确认ip，我的设备最后两位是 76，那么 mid-360s 设备的 ip 则为：192.168.1.176

     ![1775196701459-7a6d0a40-ecae-407d-a782-83817b6c587b](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629110104455.webp)

   - 修改 `json` 文件 

     进入 ~/livox_ros_driver2/config/ 路径下，打开 MID360s_config.json文件，修改 mid-360s 和 链接设备 的ip，host_net_info 为 链接设备的 ip ，lidar_configs 为 mid-360s 设备的 ip。
     
     这个是 MID360_config.json 文件的修改示例
     
     ```json
     {
       "lidar_summary_info" : {
         "lidar_type": 8
       },
       "MID360": {
         "lidar_net_info" : {
           "cmd_data_port": 56100,
           "push_msg_port": 56200,
           "point_data_port": 56300,
           "imu_data_port": 56400,
           "log_data_port": 56500
         },
         "host_net_info" : {
           "cmd_data_ip" : "192.168.1.5",  	# <-这里和修改后的电脑ip一致
           "cmd_data_port": 56101,
           "push_msg_ip": "192.168.1.5",  	# <-这里和修改后的电脑ip一致
           "push_msg_port": 56201,
           "point_data_ip": "192.168.1.5",  	# <-这里和修改后的电脑ip一致
           "point_data_port": 56301,
           "imu_data_ip" : "192.168.1.5",  	# <-这里和修改后的电脑ip一致
           "imu_data_port": 56401,
           "log_data_ip" : "",
           "log_data_port": 56501
         }
       },
       "lidar_configs" : [
         {
           "ip" : "192.168.1.176",		  	# <-这里是Livox mid360的ip
           "pcl_data_type" : 1,
           "pattern_mode" : 0,
           "extrinsic_parameter" : {
             "roll": 0.0,
             "pitch": 0.0,
             "yaw": 0.0,
             "x": 0,
             "y": 0,
             "z": 0
           }
         }
       ]
     }
     ```

[grid]
![1775196943422-23518c2c-17ba-47ee-9b0a-eae25b8bcfb6](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629110211937.webp)
![1775196958137-13ffbd34-c828-4cc3-8132-ad5308c3ba97](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629110240730.webp)
[/grid]

## c. 运行	

```bash
# 可以先ping一下mid-360s的ip,确保双方的IP和物理连接配置正常
ping 192.168.1.5
ping 192.168.1.176

# 一个终端发布mid-360节点信息
roslaunch livox_ros_driver2 msg_MID360s.launch  

# 另一个终端获取数据并显示
roslaunch livox_ros_driver2 rviz_MID360s.launch  
```

![1775197414650-7e9a2488-8a83-4826-8def-73f664dd8552](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629110811283.webp)

[grid]
![1776996689835-8704e696-b023-455a-abe3-29f757423c1b](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629110835577.webp)
![1776996704783-bd9e7b76-5a53-4c99-8fae-e0c90c8e0ed5](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629110844283.webp)
[/grid]

# 4. FAST_LIO2

[mars/FAST_LIO: A computationally efficient and robust LiDAR-inertial odometry (LIO) package](https://github.com/hku-mars/FAST_LIO) 

[AtomGit | GitCode - 全球开发者的开源社区,开源代码托管平台](https://gitcode.com/gh_mirrors/fa/FAST_LIO?utm_source=csdn_github_accelerator&isLogin=1&from_link=1179baa7352834b899344acfed0eadfe) 

这个没有版本区别，相关介绍可以阅读项目中的文档信息。

## a. 克隆

### i. Git 下载

```bash
# 进入工作空间的src源码目录（所有ROS功能包都放在这里）
cd Mid360s/src

# 从GitHub下载FAST-LIO源码到当前目录
git clone https://github.com/hku-mars/FAST_LIO.git
    
# 进入刚下载好的FAST-LIO文件夹
cd FAST_LIO

# 初始化并下载FAST-LIO依赖的子模块代码（缺一不可）
git submodule update --init

# 回到ROS工作空间根目录（Mid360s/）
cd ../..
```

### ii. 直接下载

在设备中执行` git`、`git submodule update --init` 会卡住报错，可以直接下载官方文件，然后修改配置就行。

1. `cd Mid360s/src`
2. 从 GitHub 直接下载 .zip 文件

   [GitHub - hku-mars/FAST_LIO](https://github.com/hku-mars/FAST_LIO)

   大概为 129MB，然后解压缩，重命名为 `FAST_LIO`
3. `cd FAST_LIO`
4. 下载FAST-LIO依赖的子模块代码

   [GitHub - hku-mars/ikd-Tree](https://github.com/hku-mars/ikd-Tree)

   这个是他的文件(备份)：[ikd-Tree-main.zip(12.3 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-0Kz6v)
5. 然后解压缩，将解压缩的文件夹中的 `ikd-Tree/` 文件夹下的两个文件 `ikd_Tree.cpp、ikd_Tree.h`，复制到 **FAST_LIO** 中的 `include/ikd-Tree/` 目录下
6. `cd ../..`

## b. 修改代码

因为其中有的文件代码使用的是 livox_ros_driver，而不是 livox_ros_driver2 所以需要修改 5 个文件。

- **FAST_LIO/CMakeLists.txt**
  ```diff
  + 1处修改
  
  find_package(catkin REQUIRED COMPONENTS
    geometry_msgs
    nav_msgs
    sensor_msgs
    roscpp
    rospy
    std_msgs
    pcl_ros
    tf
  -  livox_ros_driver		# <-修改前
  +  livox_ros_driver2	# <-修改后
    message_generation
    eigen_conversions
  )
  ```
- **FAST_LIO/package.xml**
  ```diff
  + 2处修改
  
  - <build_depend>livox_ros_driver</build_depend>  # <-修改前
  - <run_depend>livox_ros_driver</run_depend>
  
  + <build_depend>livox_ros_driver2</build_depend>  # <-修改后
  + <run_depend>livox_ros_driver2</run_depend>
  ```
- **FAST_LIO/src/**
  - 这里面有三个文件，修改的为`头文件引用`与`函数命名空间`
    - FAST_LIO/src/laserMapping.cpp **（2 处修改）**
    - FAST_LIO/src/preprocess.cpp **（2 处修改）**
    - FAST_LIO/src/preprocess.h **（3 处修改）**
  - 头文件
    ```diff
    - #include <livox_ros_driver/CustomMsg.h>   # <-修改前
    + #include <livox_ros_driver2/CustomMsg.h>  # <-修改后
    ```
  - 命名空间
    ```diff
    - livox_ros_driver::   # <-修改前
    + livox_ros_driver2::  # <-修改后
    ```

## c. 编译

FAST_LIO 的编译依赖于 livox_ros_driver2 包，因此需要确保 livox_ros_driver2 在编译 fast_lio 之前编译，然后再编译整个工程。如果 livox_ros_driver2 还未编译，需要先将 FAST_LIO 移出工作空间的 src 文件夹，编译 livox_ros_driver2 后再将 FAST_LIO 移回来。

```bash
catkin_make
```

![1775199666000-a82277c8-973e-4ca3-bc93-4e11e53c9b63](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629113429653.webp)

## d. 运行

打开两个终端，分别运行

```bash
source devel/setup.bash
roslaunch livox_ros_driver2 msg_MID360.launch
```

![1775199876505-04434235-f734-463d-b280-1e2ed9a1e3b9](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629113528789.webp)

另外一个终端运行

```bash
source devel/setup.bash
roslaunch fast_lio mapping_mid360.launch
```

![1775199894224-20a23744-88cb-43e1-8ac1-260135da7cf6](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629113604543.webp)

## e.完整修改文件

[FAST_LIO-EditDone.zip(126.57 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-BaQyv)

# 5. 错误

## a. Init lds lidar failed!

- **现象**
  在 [3. livox_ros_driver2](#3-livox_ros_driver2) 运行后出现

  ![1775207476136-c86c3b61-0bc0-48b1-a218-4f9fe866109a](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629114210561.webp)

  ```bash
  a@a:~/Mid_livox_ros_driver2$ roslaunch livox_ros_driver2 msg_MID360s.launch
  ... logging to /home/a/.ros/log/d9329152-2e76-11f1-99b1-dc53600a4682/roslaunch-a-17773.log
  Checking log directory for disk usage. This may take a while.
  Press Ctrl-C to interrupt
  Done checking log file disk usage. Usage is <1GB.
  
  started roslaunch server http://a:34971/
  
  SUMMARY
  ========
  
  PARAMETERS
   * /cmdline_file_path: livox_test.lvx
   * /cmdline_str: 100000000000000
   * /data_src: 0
   * /enable_imu_bag: True
   * /enable_lidar_bag: True
   * /frame_id: livox_frame
   * /multi_topic: 0
   * /output_data_type: 0
   * /publish_freq: 10.0
   * /rosdistro: melodic
   * /rosversion: 1.14.13
   * /user_config_path: /home/a/Mid_livox...
   * /xfer_format: 1
  
  NODES
    /
      livox_lidar_publisher2 (livox_ros_driver2/livox_ros_driver2_node)
  
  auto-starting new master
  process[master]: started with pid [17787]
  ROS_MASTER_URI=http://localhost:11311
  
  setting /run_id to d9329152-2e76-11f1-99b1-dc53600a4682
  process[rosout-1]: started with pid [17798]
  started core service [/rosout]
  process[livox_lidar_publisher2-2]: started with pid [17801]
  [ INFO] [1775122341.998992812]: Livox Ros Driver2 Version: 1.0.0
  data source:0.
  [ INFO] [1775122342.002338549]: Data Source is raw lidar.
  [ INFO] [1775122342.002694030]: Config file : /home/a/Mid_livox_ros_driver2/src/livox_ros_driver2/config/MID360_config.json
  LdsLidar *GetInstance
  config lidar type: 8
  successfully parse base config, counts: 1
  [2026-04-02 17:32:22.002] [console] [info] set master/slave sdk to master sdk by default  [parse_cfg_file.cpp] [Parse] [82]
  [2026-04-02 17:32:22.002] [console] [info] Livox lidar logger disable.  [parse_cfg_file.cpp] [Parse] [126]
  [2026-04-02 17:32:22.002] [console] [info] Device type:9 point cloud data and IMU data unicast is enabled.  [params_check.cpp] [CheckLidarMulticastIp] [100]
  [2026-04-02 17:32:22.002] [console] [info] Data Handler Init Succ.  [data_handler.cpp] [Init] [49]
  bind failed
  [2026-04-02 17:32:22.003] [console] [error] Create detection socket failed.  [device_manager.cpp] [CreateDetectionChannel] [275]
  [2026-04-02 17:32:22.003] [console] [error] Create detection channel failed.  [device_manager.cpp] [CreateChannel] [242]
  [2026-04-02 17:32:22.003] [console] [error] Create channel failed.  [device_manager.cpp] [Init] [169]
  Failed to init livox lidar sdk.
  [ERROR] [1775122342.003259262]: Init lds lidar failed!
  ```
- **原因**

  Livox 雷达驱动需要占用网卡的 65535 端口，系统里这个端口被占用了 → 绑定失败 → 启动失败，Livox 雷达必须使用 UDP 65535 端口，系统默认不让普通用户绑定这个端口，所以报错 bind failed。
- **解决**

  ```bash
  # 运行
  sudo sysctl -w net.ipv4.ip_nonlocal_bind=1
  
  然后重新启动雷达驱动：
  roslaunch livox_ros_driver2 msg_MID360s.launch
  ```
  
## b.无 topic 消息

- **现象**

  在 [3. livox_ros_driver2](#3-livox_ros_driver2) 运行后出现

  ![1775125539885-509e8034-d5ee-48c8-b628-d8f67ace643d](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629115658708.webp)

- **原因**

  - 进行rostopic list |grep livox正确应该是

    ![1775200954644-68f3b629-4059-4413-89d5-71a321bb241d](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629115912827.webp)

    但是错误运行的话是没有雷达信息与雷达内部 IMU 信息的。

  - 这个的原因的是没有与雷达获得通信，驱动发指令发不出去，归根到底是因为livox_ros_driver2版本不对。

  - 也可能是网线没有插入、IP 没有配置、电源没有供电。

- **解决**

  所使用的雷达型号为Mid-360s，该设备对于SDK及ROS驱动有着特定的版本兼容性要求。遗憾的是，官方网站上提供的下载资源并未包含符合这些规格的确切版本。因此，为了获得与Mid-360s相匹配的正确版本，我们直接联系客服以获取对应版本，文章表头有相关说明，文章中也处处提到了这个问题，所以只是记录一下这个问题。
  ![1775207812332-8aa794eb-50c5-4126-9314-42d7f09da561](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629120013193.webp)

## c. 编译错误

- **现象**

  ![1775201185197-565f5fff-ad5b-460a-bef4-fdef86e2c97e](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629115054149.webp)
- **原因**

  说明 `livox_ros_driver::` 没有全部改成 `livox_ros_driver2::`

- **解决**

  依照文档 [c. 编译](#c-编译)，仔细检查修改一遍

## d. 1

![1775208246895-a5e4c4af-b914-4b0d-9676-da8fd193dc6a](https://vip.123pan.cn/1831996731/a_PicBed/hardware/mid-use/20260629115035607.webp)







---
